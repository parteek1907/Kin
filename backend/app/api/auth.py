from typing import Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.profile import Profile, PlatformRole
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.schemas.profile import ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account"
)
def register(
    req: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account with chosen platform role and profile details.
    Enforces email uniqueness and secure password hashing.
    """
    email_clean = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists"
        )

    # Validate role is valid platform role (Student, Alumni, Faculty, Founder, Recruiter)
    valid_roles = [r.value for r in PlatformRole]
    if req.role.value not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid platform role. Must be one of {valid_roles}"
        )

    hashed_pw = hash_password(req.password)
    user = User(
        email=email_clean,
        hashed_password=hashed_pw,
        is_active=True
    )
    db.add(user)
    db.flush()  # Flush to get user.id

    # Create linked profile
    profile = Profile(
        user_id=user.id,
        full_name=req.full_name.strip(),
        role=req.role.value,
        headline=req.headline.strip() if req.headline else None,
        skills=req.skills or [],
        industry=req.industry.strip() if req.industry else None,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT token"
)
def login(
    req: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate with email and password. Returns a signed JWT access token.
    """
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive"
        )

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user details"
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve profile and account information for the currently authenticated user.
    """
    return current_user


@router.patch(
    "/profile",
    response_model=ProfileResponse,
    summary="Update own user profile"
)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details for the authenticated user.
    Ensures users cannot escalate permissions.
    """
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id, full_name="User")
        db.add(profile)
        db.flush()

    update_dict = profile_in.model_dump(exclude_unset=True)

    # Role validation (prevent privilege escalation)
    if "role" in update_dict and update_dict["role"] is not None:
        role_val = update_dict["role"].value if hasattr(update_dict["role"], "value") else str(update_dict["role"])
        valid_roles = [r.value for r in PlatformRole]
        if role_val not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid platform role. Must be one of {valid_roles}"
            )
        update_dict["role"] = role_val

    if "visibility" in update_dict and update_dict["visibility"] is not None:
        vis_val = update_dict["visibility"].value if hasattr(update_dict["visibility"], "value") else str(update_dict["visibility"])
        update_dict["visibility"] = vis_val

    for field, val in update_dict.items():
        if isinstance(val, str) and field in ("full_name", "headline", "industry", "current_organization"):
            setattr(profile, field, val.strip())
        else:
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile
