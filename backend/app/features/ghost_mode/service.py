"""
Business service for Kin Ghost Mode.
Orchestrates entitlement validation, identity isolation, content creation,
thread participation, anti-abuse checks, and auditable moderation.
"""

from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.features.ghost_mode.models import (
    GhostEntitlement,
    GhostPersona,
    GhostPost,
    GhostReply,
    GhostReport,
    GhostAuditLog,
    ContentStatus,
    ReportStatus,
    utc_now,
)
from app.features.ghost_mode.repository import GhostModeRepository
from app.features.ghost_mode.permissions import verify_author_ownership


class GhostModeService:

    @classmethod
    def get_user_entitlement_status(cls, db: Session, user_id: int) -> Dict[str, Any]:
        """Check whether the member holds an active Ghost Mode pass."""
        entitlement = GhostModeRepository.get_entitlement(db, user_id)
        if not entitlement:
            return {
                "is_entitled": False,
                "can_post": False,
                "plan_type": None,
                "status": "none",
                "expires_at": None,
                "auto_renew": False,
                "message": "No active Ghost Mode entitlement. Upgrade to participate anonymously in sensitive discussions."
            }

        is_active = entitlement.is_active_entitlement()
        return {
            "is_entitled": is_active,
            "can_post": is_active,
            "plan_type": entitlement.plan_type,
            "status": entitlement.status,
            "expires_at": entitlement.expires_at,
            "auto_renew": entitlement.auto_renew,
            "message": "Ghost Mode active. You may publish and reply under your pseudonymous persona." if is_active else "Ghost Mode expired. Your existing posts remain published, but an active pass is required to create new posts or replies."
        }

    @classmethod
    def publish_post(
        cls,
        db: Session,
        user_id: int,
        title: str,
        content: str,
        category: str
    ) -> GhostPost:
        """Publish a new discussion under pseudonymous persona."""
        # 1. Verify entitlement server-side
        entitlement = GhostModeRepository.get_entitlement(db, user_id)
        if not entitlement or not entitlement.is_active_entitlement():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Active Ghost Mode premium entitlement required to publish pseudonymous discussions."
            )

        # 2. Get current active persona
        persona = GhostModeRepository.get_or_create_current_persona(db, user_id)

        # 3. Create post
        post = GhostModeRepository.create_post(
            db=db,
            persona_id=persona.id,
            title=title,
            content=content,
            category=category
        )
        return post

    @classmethod
    def publish_reply(
        cls,
        db: Session,
        user_id: int,
        post_id: int,
        content: str,
        parent_reply_id: Optional[int] = None
    ) -> GhostReply:
        """Submit a reply under pseudonymous persona."""
        # 1. Verify entitlement server-side
        entitlement = GhostModeRepository.get_entitlement(db, user_id)
        if not entitlement or not entitlement.is_active_entitlement():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Active Ghost Mode premium entitlement required to reply under pseudonym."
            )

        # 2. Validate target post exists and is active
        post = GhostModeRepository.get_post(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target discussion thread not found or has been removed."
            )

        # 3. Get current active persona
        persona = GhostModeRepository.get_or_create_current_persona(db, user_id)

        # 4. Create reply
        reply = GhostModeRepository.create_reply(
            db=db,
            post_id=post_id,
            persona_id=persona.id,
            content=content,
            parent_reply_id=parent_reply_id
        )
        return reply

    @classmethod
    def edit_post(
        cls,
        db: Session,
        user_id: int,
        post_id: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
        category: Optional[str] = None
    ) -> GhostPost:
        """Edit post with strict IDOR author verification."""
        post = GhostModeRepository.get_post(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discussion post not found."
            )

        # Author verification
        verify_author_ownership(user_id=user_id, author_persona_id=post.persona_id, db=db)

        if title is not None:
            post.title = title.strip()
        if content is not None:
            post.content = content.strip()
        if category is not None:
            post.category = category.strip().lower()

        post.updated_at = utc_now()
        db.commit()
        db.refresh(post)
        return post

    @classmethod
    def delete_post(cls, db: Session, user_id: int, post_id: int) -> None:
        """Soft-delete post with strict author verification."""
        post = GhostModeRepository.get_post(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discussion post not found."
            )

        verify_author_ownership(user_id=user_id, author_persona_id=post.persona_id, db=db)

        post.status = ContentStatus.DELETED.value
        post.updated_at = utc_now()
        db.commit()

    @classmethod
    def delete_reply(cls, db: Session, user_id: int, reply_id: int) -> None:
        """Soft-delete reply with strict author verification."""
        reply = GhostModeRepository.get_reply(db, reply_id)
        if not reply:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reply not found."
            )

        verify_author_ownership(user_id=user_id, author_persona_id=reply.persona_id, db=db)

        reply.status = ContentStatus.DELETED.value
        reply.updated_at = utc_now()
        db.commit()

    @classmethod
    def react_to_content(
        cls,
        db: Session,
        user_id: int,
        target_type: str,
        target_id: int,
        reaction_type: str
    ) -> bool:
        """Toggle reaction on post or reply under pseudonym."""
        persona = GhostModeRepository.get_or_create_current_persona(db, user_id)
        return GhostModeRepository.toggle_reaction(
            db=db,
            target_type=target_type,
            target_id=target_id,
            persona_id=persona.id,
            reaction_type=reaction_type
        )

    @classmethod
    def report_content(
        cls,
        db: Session,
        user_id: int,
        target_type: str,
        target_id: int,
        reason_category: str,
        explanation: str
    ) -> GhostReport:
        """Submit an abuse or harassment report."""
        persona = GhostModeRepository.get_or_create_current_persona(db, user_id)
        return GhostModeRepository.create_report(
            db=db,
            target_type=target_type,
            target_id=target_id,
            reporter_persona_id=persona.id,
            reason_category=reason_category,
            explanation=explanation
        )

    @classmethod
    def take_moderation_action(
        cls,
        db: Session,
        moderator_user_id: int,
        target_type: str,
        target_id: int,
        action: str,
        moderator_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Administrative action: hide or restore reported content."""
        if target_type == "post":
            target = db.query(GhostPost).filter(GhostPost.id == target_id).first()
        else:
            target = db.query(GhostReply).filter(GhostReply.id == target_id).first()

        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target {target_type} #{target_id} not found."
            )

        if action == "hide":
            target.status = ContentStatus.HIDDEN.value
        elif action == "restore":
            target.status = ContentStatus.PUBLISHED.value

        # Update any pending reports for this target
        reports = db.query(GhostReport).filter(
            GhostReport.target_type == target_type,
            GhostReport.target_id == target_id,
            GhostReport.status == ReportStatus.PENDING.value
        ).all()

        for r in reports:
            r.status = ReportStatus.ACTION_TAKEN.value if action == "hide" else ReportStatus.DISMISSED.value
            r.moderator_notes = moderator_notes
            r.reviewed_by_user_id = moderator_user_id
            r.updated_at = utc_now()

        db.commit()
        return {
            "success": True,
            "target_type": target_type,
            "target_id": target_id,
            "action": action,
            "status": target.status
        }

    @classmethod
    def reveal_identity_for_audit(
        cls,
        db: Session,
        moderator_user: User,
        persona_handle: str,
        audit_reason: str,
        incident_ticket: Optional[str] = None
    ) -> Tuple[User, GhostAuditLog, GhostPersona]:
        """
        Emergency & legal safety identity resolution.
        Exclusively accessible to authorized moderators with mandatory audit recording.
        """
        persona = GhostModeRepository.get_persona_by_handle(db, persona_handle)
        if not persona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ghost persona handle '{persona_handle}' not found."
            )

        resolved_user, audit_log = GhostModeRepository.audit_and_resolve_identity(
            db=db,
            moderator_user_id=moderator_user.id,
            target_persona_id=persona.id,
            audit_reason=audit_reason,
            incident_ticket=incident_ticket
        )

        return resolved_user, audit_log, persona
