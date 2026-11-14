"""CampaignEcho — Authentication Endpoints (Registration, Login, User Profile, Session Revocation)."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.security import (
    hash_password,
    verify_password,
    needs_rehash,
    create_user_session,
    revoke_user_session,
    extract_raw_token,
    get_current_user,
    enforce_rate_limit,
    SESSION_COOKIE_NAME,
    SESSION_EXPIRATION_DAYS,
)
from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register a new user account and issue an HttpOnly session cookie."""
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"register:{client_ip}", max_requests=30, window_seconds=60)

    normalized_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=normalized_email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    _, raw_token = create_user_session(db, user_id=user.id, ip_address=client_ip, user_agent=user_agent)

    # Issue HttpOnly session cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=(settings.ENV == "production"),
        max_age=SESSION_EXPIRATION_DAYS * 86400,
        path="/",
    )

    return TokenResponse(
        access_token=raw_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(
    payload: UserLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate with credentials, transparently upgrade legacy hashes, and issue session cookie."""
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"login:{client_ip}", max_requests=30, window_seconds=60)

    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email, User.is_active == True).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Transparent OWASP PBKDF2 hash upgrade from 100k to 600k iterations
    if needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(payload.password)
        db.commit()

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    _, raw_token = create_user_session(db, user_id=user.id, ip_address=client_ip, user_agent=user_agent)

    # Issue HttpOnly session cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite="lax",
        secure=(settings.ENV == "production"),
        max_age=SESSION_EXPIRATION_DAYS * 86400,
        path="/",
    )

    return TokenResponse(
        access_token=raw_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Revoke session token in database and clear client session cookie."""
    raw_token = extract_raw_token(request)
    if raw_token:
        revoke_user_session(db, raw_token)

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
    )
    return {"message": "Logged out successfully"}
