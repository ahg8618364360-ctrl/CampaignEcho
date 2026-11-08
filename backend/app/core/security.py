"""CampaignEcho — Security, Authentication & Cryptographic Services.

Provides:
- PBKDF2-HMAC-SHA256 salted password hashing & constant-time verification.
- HMAC-SHA256 signed JWT-style session token generation & verification.
- FastAPI dependency for resolving current authenticated user.
"""

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db

security_scheme = HTTPBearer(auto_error=False)

# Derive HMAC key from app secret or persistent token
AUTH_SECRET_KEY = os.environ.get("CAMPAIGNECHO_AUTH_SECRET") or settings.HINDSIGHT_API_KEY or "campaignecho-secure-secret-key-salt-98213"
TOKEN_EXPIRATION_HOURS = 72


def hash_password(password: str) -> str:
    """Hash password using salted PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    salt = secrets.token_bytes(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    hash_b64 = base64.b64encode(pw_hash).decode("ascii")
    return f"pbkdf2_sha256$100000${salt_b64}${hash_b64}"


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


def _b64_url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64_url_decode(data_str: str) -> bytes:
    padding = "=" * (4 - (len(data_str) % 4)) if len(data_str) % 4 else ""
    return base64.urlsafe_b64decode((data_str + padding).encode("ascii"))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create HMAC-SHA256 signed stateless JWT-style token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    now_ts = int(time.time())
    exp_delta = expires_delta or timedelta(hours=TOKEN_EXPIRATION_HOURS)
    payload["iat"] = now_ts
    payload["exp"] = now_ts + int(exp_delta.total_seconds())

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    unsigned = f"{_b64_url_encode(header_bytes)}.{_b64_url_encode(payload_bytes)}"
    signature = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), unsigned.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = _b64_url_encode(signature)

    return f"{unsigned}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode signed access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        unsigned = f"{parts[0]}.{parts[1]}"
        expected_sig = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), unsigned.encode("utf-8"), hashlib.sha256).digest()
        provided_sig = _b64_url_decode(parts[2])

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        payload_bytes = _b64_url_decode(parts[1])
        payload = json.loads(payload_bytes.decode("utf-8"))

        now_ts = int(time.time())
        if payload.get("exp") and payload["exp"] < now_ts:
            return None

        return payload
    except Exception:
        return None


def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Resolve current user if Authorization token provided; None otherwise."""
    if not auth or not auth.credentials:
        return None

    payload = decode_access_token(auth.credentials)
    if not payload or "sub" not in payload:
        return None

    from backend.app.db.models import User
    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    return user


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """Enforce authenticated user requirement; raises 401 if unauthorized."""
    user = get_current_user_optional(auth, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
