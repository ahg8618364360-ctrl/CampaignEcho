"""CampaignEcho — Security, Authentication & Cryptographic Services.

Provides:
- OWASP-compliant PBKDF2-HMAC-SHA256 password hashing (600,000 iterations) and constant-time verification.
- Transparent password rehash detection for legacy iteration counts.
- Server-managed, revocable database session tokens (user_sessions table).
- Dual token extraction: HttpOnly 'campaignecho_session' cookie (primary) or Bearer header (API/automation).
- Fail-closed secret validation with zero fallbacks to default keys or Hindsight credentials.
"""

import base64
import hashlib
import hmac
import os
import secrets
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Any, Deque, Dict

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.config import settings, validate_auth_secret
from backend.app.db.session import get_db

security_scheme = HTTPBearer(auto_error=False)

# OWASP Recommended Iterations for PBKDF2-HMAC-SHA256
PBKDF2_ITERATIONS = 600000
LEGACY_PBKDF2_ITERATIONS = 100000
SESSION_EXPIRATION_DAYS = 7
SESSION_COOKIE_NAME = "campaignecho_session"


def get_auth_secret() -> str:
    """Validate and return application secret with fail-closed guarantee."""
    return validate_auth_secret()


def hash_password(password: str) -> str:
    """Hash password using salted PBKDF2-HMAC-SHA256 with 600,000 iterations."""
    salt = secrets.token_bytes(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    hash_b64 = base64.b64encode(pw_hash).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_b64}${hash_b64}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password in constant time."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = base64.b64decode(parts[2].encode("ascii"))
        expected_hash = base64.b64decode(parts[3].encode("ascii"))
        computed_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(expected_hash, computed_hash)
    except Exception:
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if the stored hash uses fewer iterations than the current standard (600k)."""
    try:
        parts = hashed_password.split("$")
        if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
            return int(parts[1]) < PBKDF2_ITERATIONS
        return True
    except Exception:
        return True


def hash_token(token: str) -> str:
    """Compute deterministic SHA-256 hex digest of a session token for DB storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _utc_now() -> datetime:
    """Return naive UTC datetime for standard cross-database compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_user_session(
    db: Session,
    user_id: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    expires_in_days: int = SESSION_EXPIRATION_DAYS,
) -> Tuple[Any, str]:
    """Generate an opaque high-entropy token and record its SHA-256 hash in user_sessions."""
    from backend.app.db.models import UserSession

    raw_token = secrets.token_urlsafe(32)
    token_digest = hash_token(raw_token)
    now = _utc_now()
    expires_at = now + timedelta(days=expires_in_days)

    session = UserSession(
        user_id=user_id,
        token_hash=token_digest,
        ip_address=ip_address,
        user_agent=user_agent,
        created_at=now,
        expires_at=expires_at,
        revoked_at=None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session, raw_token


def get_session_by_token(db: Session, raw_token: str) -> Optional[Any]:
    """Look up an active, unrevoked, unexpired session by raw token."""
    from backend.app.db.models import UserSession

    if not raw_token or not raw_token.strip():
        return None

    token_digest = hash_token(raw_token.strip())
    now = _utc_now()

    session = (
        db.query(UserSession)
        .filter(
            UserSession.token_hash == token_digest,
            UserSession.revoked_at.is_(None),
            UserSession.expires_at > now,
        )
        .first()
    )
    return session


def revoke_user_session(db: Session, raw_token: str) -> bool:
    """Immediately revoke an active session in the database."""
    from backend.app.db.models import UserSession

    if not raw_token or not raw_token.strip():
        return False

    token_digest = hash_token(raw_token.strip())
    session = (
        db.query(UserSession)
        .filter(
            UserSession.token_hash == token_digest,
            UserSession.revoked_at.is_(None),
        )
        .first()
    )
    if session:
        session.revoked_at = _utc_now()
        db.commit()
        return True
    return False


def revoke_all_user_sessions(db: Session, user_id: str) -> int:
    """Revoke all active sessions for a user (e.g. password change)."""
    from backend.app.db.models import UserSession

    now = _utc_now()
    updated = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == user_id,
            UserSession.revoked_at.is_(None),
        )
        .update({"revoked_at": now})
    )
    db.commit()
    return updated


def extract_raw_token(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = None,
) -> Optional[str]:
    """Extract session token prioritizing explicit Authorization header, then HttpOnly cookie."""
    # 1. Explicit Authorization Header
    if auth and auth.credentials:
        return auth.credentials.strip()

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip()

    # 2. HttpOnly Cookie (ambient browser session)
    cookie_token = request.cookies.get(SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token.strip()

    return None


def get_current_user_optional(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Resolve authenticated user from session token cookie or Bearer header."""
    raw_token = extract_raw_token(request, auth)
    if not raw_token:
        return None

    session = get_session_by_token(db, raw_token)
    if not session:
        return None

    from backend.app.db.models import User
    user = db.query(User).filter(User.id == session.user_id, User.is_active == True).first()
    return user


def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Enforce authenticated user requirement; raises 401 if unauthorized or revoked."""
    user = get_current_user_optional(request, auth, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session required, invalid, or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# Thread-safe sliding window in-memory rate limiter for auth endpoints
_RATE_LIMIT_LOCK = threading.Lock()
_RATE_LIMIT_BUCKETS: Dict[str, Deque[float]] = defaultdict(deque)


def reset_rate_limits() -> None:
    """Clear all rate limit buckets (primarily for test isolation)."""
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BUCKETS.clear()


def enforce_rate_limit(key: str, max_requests: int = 20, window_seconds: int = 60) -> None:
    """Enforce sliding-window rate limit per key; raises HTTP 429 when exceeded."""
    now = time.monotonic()
    cutoff = now - window_seconds
    with _RATE_LIMIT_LOCK:
        bucket = _RATE_LIMIT_BUCKETS[key]
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many authentication attempts. Please wait before retrying.",
                headers={"Retry-After": str(window_seconds)},
            )
        bucket.append(now)
