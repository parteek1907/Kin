from typing import Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.profile import Profile, PlatformRole
from app.schemas.auth import (
    UserRegisterRequest, 
    UserLoginRequest, 
    TokenResponse, 
    UserResponse,
    FirebaseSyncRequest,
    FirebaseSyncResponse
)
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


@router.post(
    "/firebase-sync",
    response_model=FirebaseSyncResponse,
    summary="Synchronize Firebase Auth and verify student/business ID"
)
def firebase_sync(
    req: FirebaseSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Synchronizes Firebase authenticated users directly to the platform database.
    Verifies student ID for students or business ID for professionals,
    creates/updates the User and Profile records, and issues a platform JWT token.
    """
    clean_email = req.email.strip().lower()
    clean_uid = req.firebase_uid.strip()

    # 1. Lookup by firebase_uid or email
    user = db.query(User).filter(
        (User.firebase_uid == clean_uid) | (User.email == clean_email)
    ).first()

    is_new = False
    if not user:
        is_new = True
        synthetic_pw = hash_password(f"firebase_{clean_uid}_{clean_email}")
        user = User(
            email=clean_email,
            firebase_uid=clean_uid,
            hashed_password=synthetic_pw,
            is_active=True
        )
        db.add(user)
        db.flush()
    else:
        if not user.firebase_uid:
            user.firebase_uid = clean_uid

    # 2. Map role and verification status
    is_student = req.user_type.lower() == "student"
    chosen_role = PlatformRole.STUDENT.value if is_student else PlatformRole.ALUMNI.value
    verification_status = "verified_student" if (is_student and req.student_id) else (
        "verified_professional" if (not is_student and req.business_id) else "pending"
    )

    # 3. Create or update profile
    profile = user.profile
    if not profile:
        profile = Profile(
            user_id=user.id,
            full_name=req.full_name.strip(),
            role=chosen_role,
            headline=req.department_or_title.strip() if req.department_or_title else None,
            current_organization=req.institution_or_company.strip() if req.institution_or_company else None,
            student_id=req.student_id.strip() if req.student_id else None,
            business_id=req.business_id.strip() if req.business_id else None,
            verification_status=verification_status,
            skills=[]
        )
        db.add(profile)
    else:
        if req.full_name:
            profile.full_name = req.full_name.strip()
        profile.role = chosen_role
        if req.student_id:
            profile.student_id = req.student_id.strip()
        if req.business_id:
            profile.business_id = req.business_id.strip()
        if req.institution_or_company:
            profile.current_organization = req.institution_or_company.strip()
        if req.department_or_title:
            profile.headline = req.department_or_title.strip()
        profile.verification_status = verification_status

    db.commit()
    db.refresh(user)

    # 4. Generate JWT
    token = create_access_token(subject=user.id)

    id_type = "Student ID" if is_student else "Business ID"
    id_val = req.student_id if is_student else req.business_id
    msg = f"Firebase authentication verified and saved to database with {id_type}: {id_val or 'None'}."

    return FirebaseSyncResponse(
        access_token=token,
        token_type="bearer",
        user=user,
        is_new_user=is_new,
        verification_status=verification_status,
        message=msg
    )


@router.get(
    "/registered-users",
    summary="Get all registered users and profiles from platform database"
)
def get_registered_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.is_active == True).all()
    results = []
    for u in users:
        p = u.profile
        results.append({
            "id": u.id,
            "email": u.email,
            "firebase_uid": u.firebase_uid,
            "name": p.full_name if p and p.full_name else u.email.split("@")[0],
            "role": p.role.lower() if p and p.role else "student",
            "headline": p.headline if p else None,
            "institution": p.current_organization if p and p.current_organization else "IIIT Delhi",
            "student_id": p.student_id if p else None,
            "business_id": p.business_id if p else None,
            "verification_status": p.verification_status if p else "verified",
            "skills": p.skills if p and p.skills else [],
            "bio": p.biography if p else None,
        })
    return {"success": True, "total": len(results), "users": results}


