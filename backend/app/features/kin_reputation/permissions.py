"""
Access control and security authorization rules for Kin Reputation Engine.
Enforces that ordinary members cannot award points to themselves or others,
and enforces profile privacy rules on public reputation summaries.
"""

from typing import Optional
from fastapi import HTTPException, status, Header
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import Profile, PlatformRole, ProfileVisibility
from app.features.social.models import UserBlock
from app.features.qualification_connections.models import Connection
from app.core.config import settings


def require_privileged_actor(
    current_user: Optional[User] = None,
    x_internal_service_key: Optional[str] = Header(None, alias="X-Internal-Service-Key")
) -> bool:
    """
    Ensures that only authorized actors (Faculty/Admin roles) or trusted backend
    internal services can record or reverse verified contribution events.
    Ordinary users will be strictly rejected with HTTP 403 Forbidden.
    """
    # 1. Trusted internal backend service key
    if x_internal_service_key and x_internal_service_key == settings.SECRET_KEY:
        return True

    # 2. Check platform role for user (Faculty or authorized leadership role)
    if current_user and current_user.profile:
        role = current_user.profile.role
        if role in [PlatformRole.FACULTY.value, "Admin", "Moderator"]:
            return True

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized. Only trusted backend services and authorized faculty/admins can award or reverse reputation points."
    )


def verify_reputation_view_permission(
    db: Session,
    target_user_id: int,
    viewer_user: Optional[User] = None
) -> Profile:
    """
    Check whether viewer_user is permitted to view target_user's reputation summary
    based on profile visibility and blocking rules.
    """
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )

    profile = target_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user profile not found"
        )

    # If viewer is the user themselves, always permitted
    if viewer_user and viewer_user.id == target_user_id:
        return profile

    # Check for blocks if viewer is authenticated
    if viewer_user:
        is_blocked = db.query(UserBlock).filter(
            ((UserBlock.blocker_id == target_user_id) & (UserBlock.blocked_id == viewer_user.id)) |
            ((UserBlock.blocker_id == viewer_user.id) & (UserBlock.blocked_id == target_user_id))
        ).first()
        if is_blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied due to block settings"
            )

    # Visibility rules
    visibility = profile.visibility
    if visibility == ProfileVisibility.PRIVATE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user's profile and reputation are set to private"
        )
    elif visibility == ProfileVisibility.NETWORK_ONLY.value:
        if not viewer_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to view network-only reputation"
            )
        # Check active 1st-degree connection
        is_connected = db.query(Connection).filter(
            ((Connection.user_a_id == viewer_user.id) & (Connection.user_b_id == target_user_id)) |
            ((Connection.user_a_id == target_user_id) & (Connection.user_b_id == viewer_user.id))
        ).first()
        if not is_connected:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user's reputation is visible only to direct connections"
            )

    return profile
