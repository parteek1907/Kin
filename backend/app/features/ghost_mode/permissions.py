"""
Security authorization and entitlement verification for Kin Ghost Mode.
Guarantees server-side verification of premium status and moderator roles.
"""

from typing import Optional
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import PlatformRole
from app.features.ghost_mode.models import GhostEntitlement, GhostIdentityMapping, to_utc


def require_ghost_entitlement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> GhostEntitlement:
    """
    Ensures the authenticated user possesses an active, unexpired Ghost Mode entitlement.
    Client-provided claims are ignored; access is strictly verified in the database.
    """
    entitlement = db.query(GhostEntitlement).filter(GhostEntitlement.user_id == current_user.id).first()
    if not entitlement or not entitlement.is_active_entitlement():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active Ghost Mode premium entitlement required to publish pseudonymous discussions or replies."
        )
    return entitlement


def require_ghost_moderator(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Ensures the user possesses administrative or faculty moderation authority.
    """
    if not current_user.profile or current_user.profile.role not in [PlatformRole.FACULTY.value, "Admin", "Moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty or administrative moderator authority required for this action."
        )
    return current_user


def verify_author_ownership(
    user_id: int,
    author_persona_id: int,
    db: Session
) -> None:
    """
    Verifies that the requested content's author persona is mapped to the current authenticated user.
    Prevents IDOR (Insecure Direct Object Reference) attacks on edit and delete operations.
    """
    mapping = db.query(GhostIdentityMapping).filter(
        GhostIdentityMapping.user_id == user_id,
        GhostIdentityMapping.persona_id == author_persona_id
    ).first()

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized. You do not own this pseudonymous content."
        )
