"""
Database repository for Kin Ghost Mode.
Manages entitlements, pseudonymous personas, discussion threads,
reactions, mutes, reports, and identity access auditing.
"""

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_, and_

from app.features.ghost_mode.models import (
    GhostEntitlement,
    GhostPersona,
    GhostIdentityMapping,
    GhostPost,
    GhostReply,
    GhostReaction,
    GhostReport,
    GhostPersonaMute,
    GhostAuditLog,
    EntitlementStatus,
    EntitlementPlan,
    ContentStatus,
    ReportStatus,
    utc_now,
    to_utc,
)
from app.features.ghost_mode.pseudonyms import generate_pseudonym_profile
from app.models.user import User


class GhostModeRepository:

    # -------------------------------------------------------------------------
    # Entitlement Management
    # -------------------------------------------------------------------------

    @staticmethod
    def get_entitlement(db: Session, user_id: int) -> Optional[GhostEntitlement]:
        """Fetch entitlement row for user."""
        return db.query(GhostEntitlement).filter(GhostEntitlement.user_id == user_id).first()

    @staticmethod
    def activate_entitlement(
        db: Session,
        user_id: int,
        plan_type: str = EntitlementPlan.GHOST_MONTHLY.value,
        duration_days: int = 30,
        payment_reference: Optional[str] = None
    ) -> GhostEntitlement:
        """Create or renew a premium Ghost Mode entitlement."""
        entitlement = GhostModeRepository.get_entitlement(db, user_id)
        now = datetime.now(timezone.utc)
        new_expires_at = now + timedelta(days=duration_days)

        if not entitlement:
            entitlement = GhostEntitlement(
                user_id=user_id,
                plan_type=plan_type,
                status=EntitlementStatus.ACTIVE.value,
                expires_at=new_expires_at,
                auto_renew=True,
                payment_reference=payment_reference,
            )
            db.add(entitlement)
        else:
            current_exp = to_utc(entitlement.expires_at)
            if current_exp and current_exp > now:
                new_expires_at = current_exp + timedelta(days=duration_days)
            entitlement.plan_type = plan_type
            entitlement.status = EntitlementStatus.ACTIVE.value
            entitlement.expires_at = new_expires_at
            entitlement.payment_reference = payment_reference
            entitlement.updated_at = utc_now()

        db.commit()
        db.refresh(entitlement)
        return entitlement

    # -------------------------------------------------------------------------
    # Persona & Identity Separation
    # -------------------------------------------------------------------------

    @staticmethod
    def get_or_create_current_persona(db: Session, user_id: int) -> GhostPersona:
        """Fetch or initialize the member's current active pseudonymous persona."""
        mapping = db.query(GhostIdentityMapping).filter(
            GhostIdentityMapping.user_id == user_id,
            GhostIdentityMapping.is_current == True
        ).first()

        if mapping:
            persona = db.query(GhostPersona).filter(GhostPersona.id == mapping.persona_id).first()
            if persona and persona.is_active:
                return persona

        # Generate fresh decoupled persona
        profile_data = generate_pseudonym_profile()
        persona = GhostPersona(
            persona_handle=profile_data["persona_handle"],
            pseudonym=profile_data["pseudonym"],
            avatar_seed=profile_data["avatar_seed"],
            theme_color=profile_data["theme_color"],
            is_active=True,
        )
        db.add(persona)
        db.flush()

        mapping = GhostIdentityMapping(
            user_id=user_id,
            persona_id=persona.id,
            is_current=True,
        )
        db.add(mapping)
        db.commit()
        db.refresh(persona)
        return persona

    @staticmethod
    def rotate_persona(db: Session, user_id: int) -> GhostPersona:
        """Archive current persona and allocate a fresh pseudonymous handle."""
        db.query(GhostIdentityMapping).filter(
            GhostIdentityMapping.user_id == user_id,
            GhostIdentityMapping.is_current == True
        ).update({"is_current": False})

        profile_data = generate_pseudonym_profile()
        persona = GhostPersona(
            persona_handle=profile_data["persona_handle"],
            pseudonym=profile_data["pseudonym"],
            avatar_seed=profile_data["avatar_seed"],
            theme_color=profile_data["theme_color"],
            is_active=True,
        )
        db.add(persona)
        db.flush()

        new_mapping = GhostIdentityMapping(
            user_id=user_id,
            persona_id=persona.id,
            is_current=True,
        )
        db.add(new_mapping)
        db.commit()
        db.refresh(persona)
        return persona

    @staticmethod
    def get_persona_by_id(db: Session, persona_id: int) -> Optional[GhostPersona]:
        return db.query(GhostPersona).filter(GhostPersona.id == persona_id).first()

    @staticmethod
    def get_persona_by_handle(db: Session, handle: str) -> Optional[GhostPersona]:
        return db.query(GhostPersona).filter(GhostPersona.persona_handle == handle).first()

    # -------------------------------------------------------------------------
    # Content & Discussions
    # -------------------------------------------------------------------------

    @staticmethod
    def create_post(
        db: Session,
        persona_id: int,
        title: str,
        content: str,
        category: str
    ) -> GhostPost:
        """Publish a new discussion under pseudonymous persona."""
        post = GhostPost(
            persona_id=persona_id,
            title=title.strip(),
            content=content.strip(),
            category=category.strip().lower(),
            status=ContentStatus.PUBLISHED.value,
            view_count=0,
            reply_count=0,
            reaction_count=0,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def get_post(db: Session, post_id: int) -> Optional[GhostPost]:
        return db.query(GhostPost).filter(
            GhostPost.id == post_id,
            GhostPost.status.in_([ContentStatus.PUBLISHED.value, ContentStatus.FLAGGED.value])
        ).first()

    @staticmethod
    def list_posts(
        db: Session,
        viewer_persona_id: Optional[int] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "recent"
    ) -> Tuple[List[GhostPost], int]:
        """Fetch public ghost discussions with category filter, search, and mute exclusions."""
        query = db.query(GhostPost).filter(
            GhostPost.status.in_([ContentStatus.PUBLISHED.value, ContentStatus.FLAGGED.value])
        )

        # Exclude muted personas if viewer has persona
        if viewer_persona_id:
            muted_ids = db.query(GhostPersonaMute.muted_persona_id).filter(
                GhostPersonaMute.muter_persona_id == viewer_persona_id
            ).all()
            if muted_ids:
                excluded = [m[0] for m in muted_ids]
                query = query.filter(~GhostPost.persona_id.in_(excluded))

        if category:
            query = query.filter(GhostPost.category == category.strip().lower())

        if search:
            term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(GhostPost.title).like(term),
                    func.lower(GhostPost.content).like(term)
                )
            )

        total = query.count()

        if sort_by == "popular":
            query = query.order_by(
                desc(GhostPost.reaction_count + GhostPost.reply_count),
                desc(GhostPost.created_at)
            )
        else:
            query = query.order_by(desc(GhostPost.created_at))

        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create_reply(
        db: Session,
        post_id: int,
        persona_id: int,
        content: str,
        parent_reply_id: Optional[int] = None
    ) -> GhostReply:
        """Create a threaded reply to a post."""
        reply = GhostReply(
            post_id=post_id,
            persona_id=persona_id,
            parent_reply_id=parent_reply_id,
            content=content.strip(),
            status=ContentStatus.PUBLISHED.value,
            reaction_count=0,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        db.add(reply)
        # Increment post reply count
        post = db.query(GhostPost).filter(GhostPost.id == post_id).first()
        if post:
            post.reply_count += 1
            post.updated_at = utc_now()
        db.commit()
        db.refresh(reply)
        return reply

    @staticmethod
    def get_reply(db: Session, reply_id: int) -> Optional[GhostReply]:
        return db.query(GhostReply).filter(
            GhostReply.id == reply_id,
            GhostReply.status.in_([ContentStatus.PUBLISHED.value, ContentStatus.FLAGGED.value])
        ).first()

    @staticmethod
    def list_replies_for_post(
        db: Session,
        post_id: int,
        viewer_persona_id: Optional[int] = None
    ) -> List[GhostReply]:
        """Fetch all visible threaded replies for a post."""
        query = db.query(GhostReply).filter(
            GhostReply.post_id == post_id,
            GhostReply.status.in_([ContentStatus.PUBLISHED.value, ContentStatus.FLAGGED.value])
        )
        if viewer_persona_id:
            muted_ids = db.query(GhostPersonaMute.muted_persona_id).filter(
                GhostPersonaMute.muter_persona_id == viewer_persona_id
            ).all()
            if muted_ids:
                excluded = [m[0] for m in muted_ids]
                query = query.filter(~GhostReply.persona_id.in_(excluded))

        return query.order_by(GhostReply.created_at.asc()).all()

    # -------------------------------------------------------------------------
    # Reactions & Muting
    # -------------------------------------------------------------------------

    @staticmethod
    def toggle_reaction(
        db: Session,
        target_type: str,
        target_id: int,
        persona_id: int,
        reaction_type: str
    ) -> bool:
        """Toggle reaction on post or reply. Returns True if added, False if removed."""
        existing = db.query(GhostReaction).filter(
            GhostReaction.target_type == target_type,
            GhostReaction.target_id == target_id,
            GhostReaction.persona_id == persona_id,
            GhostReaction.reaction_type == reaction_type
        ).first()

        if existing:
            db.delete(existing)
            # Decrement reaction count
            if target_type == "post":
                post = db.query(GhostPost).filter(GhostPost.id == target_id).first()
                if post and post.reaction_count > 0:
                    post.reaction_count -= 1
            else:
                reply = db.query(GhostReply).filter(GhostReply.id == target_id).first()
                if reply and reply.reaction_count > 0:
                    reply.reaction_count -= 1
            db.commit()
            return False
        else:
            reaction = GhostReaction(
                target_type=target_type,
                target_id=target_id,
                persona_id=persona_id,
                reaction_type=reaction_type,
                created_at=utc_now(),
            )
            db.add(reaction)
            # Increment reaction count
            if target_type == "post":
                post = db.query(GhostPost).filter(GhostPost.id == target_id).first()
                if post:
                    post.reaction_count += 1
            else:
                reply = db.query(GhostReply).filter(GhostReply.id == target_id).first()
                if reply:
                    reply.reaction_count += 1
            db.commit()
            return True

    @staticmethod
    def mute_persona(db: Session, muter_persona_id: int, muted_persona_id: int) -> None:
        """Locally mute a persona from user's feed."""
        existing = db.query(GhostPersonaMute).filter(
            GhostPersonaMute.muter_persona_id == muter_persona_id,
            GhostPersonaMute.muted_persona_id == muted_persona_id
        ).first()
        if not existing:
            mute = GhostPersonaMute(
                muter_persona_id=muter_persona_id,
                muted_persona_id=muted_persona_id,
                created_at=utc_now(),
            )
            db.add(mute)
            db.commit()

    # -------------------------------------------------------------------------
    # Reports & Audit Logging
    # -------------------------------------------------------------------------

    @staticmethod
    def create_report(
        db: Session,
        target_type: str,
        target_id: int,
        reporter_persona_id: Optional[int],
        reason_category: str,
        explanation: str
    ) -> GhostReport:
        """File a moderation abuse report."""
        report = GhostReport(
            target_type=target_type,
            target_id=target_id,
            reporter_persona_id=reporter_persona_id,
            reason_category=reason_category,
            explanation=explanation.strip(),
            status=ReportStatus.PENDING.value,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        db.add(report)
        # Flag target
        if target_type == "post":
            post = db.query(GhostPost).filter(GhostPost.id == target_id).first()
            if post and post.status == ContentStatus.PUBLISHED.value:
                post.status = ContentStatus.FLAGGED.value
        else:
            reply = db.query(GhostReply).filter(GhostReply.id == target_id).first()
            if reply and reply.status == ContentStatus.PUBLISHED.value:
                reply.status = ContentStatus.FLAGGED.value

        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def list_reports(
        db: Session,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[GhostReport], int]:
        """List reported content for administrative moderators."""
        query = db.query(GhostReport)
        if status:
            query = query.filter(GhostReport.status == status)
        total = query.count()
        items = query.order_by(desc(GhostReport.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def audit_and_resolve_identity(
        db: Session,
        moderator_user_id: int,
        target_persona_id: int,
        audit_reason: str,
        incident_ticket: Optional[str] = None
    ) -> Tuple[User, GhostAuditLog]:
        """
        Strictly privileged and audited identity resolution.
        Resolves a persona to the underlying real account with mandatory audit record.
        """
        mapping = db.query(GhostIdentityMapping).filter(
            GhostIdentityMapping.persona_id == target_persona_id
        ).first()

        if not mapping:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Persona mapping not found"
            )

        resolved_user = db.query(User).filter(User.id == mapping.user_id).first()
        if not resolved_user:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Underlying user account not found"
            )

        audit_log = GhostAuditLog(
            moderator_user_id=moderator_user_id,
            target_persona_id=target_persona_id,
            resolved_user_id=resolved_user.id,
            audit_reason=audit_reason.strip(),
            action_type="identity_reveal_investigation",
            incident_ticket=incident_ticket.strip() if incident_ticket else None,
            created_at=utc_now(),
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        return resolved_user, audit_log
