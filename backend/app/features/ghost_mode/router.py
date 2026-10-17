"""
FastAPI REST router for Kin Ghost Mode.
Provides privacy-preserving community discussions, identity isolation,
reactions, mutes, reports, and auditable moderation endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.features.ghost_mode.models import (
    GhostPost,
    GhostReply,
    GhostPersona,
    GhostIdentityMapping,
    ContentStatus,
)
from app.features.ghost_mode.schemas import (
    EntitlementStatusResponse,
    EntitlementActivateRequest,
    GhostPersonaPublic,
    GhostPersonaResponse,
    GhostPostCreate,
    GhostPostUpdate,
    GhostPostResponse,
    PaginatedGhostPostsResponse,
    GhostReplyCreate,
    GhostReplyResponse,
    ReactionRequest,
    ReportCreateRequest,
    ReportResponse,
    MutePersonaRequest,
    ModerationActionRequest,
    IdentityRevealRequest,
    IdentityRevealResponse,
)
from app.features.ghost_mode.repository import GhostModeRepository
from app.features.ghost_mode.service import GhostModeService
from app.features.ghost_mode.permissions import (
    require_ghost_entitlement,
    require_ghost_moderator,
    verify_author_ownership,
)

router = APIRouter(prefix="/ghost", tags=["Kin Ghost Mode (Privacy Discussions)"])


# -----------------------------------------------------------------------------
# 1. Entitlement Management
# -----------------------------------------------------------------------------

@router.get(
    "/entitlement",
    response_model=EntitlementStatusResponse,
    summary="Check authenticated member's Ghost Mode entitlement status"
)
def get_my_entitlement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Independently verifies whether the member holds an active premium entitlement.
    Client-supplied flags are never trusted.
    """
    return GhostModeService.get_user_entitlement_status(db, current_user.id)


@router.post(
    "/entitlement/activate",
    response_model=EntitlementStatusResponse,
    summary="Activate or renew Ghost Mode premium access"
)
def activate_entitlement(
    req: EntitlementActivateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Activate a premium Ghost Mode subscription or time-limited access pass.
    """
    entitlement = GhostModeRepository.activate_entitlement(
        db=db,
        user_id=current_user.id,
        plan_type=req.plan_type,
        duration_days=req.duration_days,
        payment_reference=req.payment_reference
    )
    return GhostModeService.get_user_entitlement_status(db, current_user.id)


# -----------------------------------------------------------------------------
# 2. Persona Management
# -----------------------------------------------------------------------------

@router.get(
    "/persona/me",
    response_model=GhostPersonaResponse,
    summary="Get or initialize own active pseudonymous persona"
)
def get_my_persona(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve own current pseudonymous persona (alias, handle, and avatar styling).
    Public users will only ever see the persona, never your user account.
    """
    persona = GhostModeRepository.get_or_create_current_persona(db, current_user.id)
    return persona


@router.post(
    "/persona/regenerate",
    response_model=GhostPersonaResponse,
    summary="Rotate to a fresh pseudonymous persona"
)
def regenerate_my_persona(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Archives your current persona and generates a completely fresh, unlinked alias.
    Past posts remain attributed to their respective past personas.
    """
    new_persona = GhostModeRepository.rotate_persona(db, current_user.id)
    return new_persona


# -----------------------------------------------------------------------------
# 3. Ghost Discussions (Posts)
# -----------------------------------------------------------------------------

@router.get(
    "/posts",
    response_model=PaginatedGhostPostsResponse,
    summary="List public ghost discussions"
)
def list_ghost_posts(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    search: Optional[str] = Query(None, description="Search keywords in title or content"),
    sort: str = Query("recent", pattern="^(recent|popular)$", description="Sort order"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve public Ghost Mode discussions.
    Responses never include real user IDs, email addresses, or profile URLs.
    """
    viewer_persona_id = None
    own_persona_ids = []
    if current_user:
        current_persona = GhostModeRepository.get_or_create_current_persona(db, current_user.id)
        viewer_persona_id = current_persona.id
        mappings = db.query(GhostIdentityMapping.persona_id).filter(
            GhostIdentityMapping.user_id == current_user.id
        ).all()
        own_persona_ids = [m[0] for m in mappings]

    posts, total = GhostModeRepository.list_posts(
        db=db,
        viewer_persona_id=viewer_persona_id,
        category=category,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort
    )

    items = []
    for post in posts:
        is_own = post.persona_id in own_persona_ids
        items.append(
            GhostPostResponse(
                id=post.id,
                author=GhostPersonaPublic.model_validate(post.persona),
                title=post.title,
                content=post.content,
                category=post.category,
                status=post.status,
                view_count=post.view_count,
                reply_count=post.reply_count,
                reaction_count=post.reaction_count,
                created_at=post.created_at,
                updated_at=post.updated_at,
                is_own=is_own,
                replies=[]
            )
        )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedGhostPostsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post(
    "/posts",
    response_model=GhostPostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new discussion under pseudonymous persona"
)
def create_ghost_post(
    req: GhostPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publish a new Ghost Mode discussion thread.
    Requires an active premium Ghost Mode entitlement.
    """
    post = GhostModeService.publish_post(
        db=db,
        user_id=current_user.id,
        title=req.title,
        content=req.content,
        category=req.category
    )
    return GhostPostResponse(
        id=post.id,
        author=GhostPersonaPublic.model_validate(post.persona),
        title=post.title,
        content=post.content,
        category=post.category,
        status=post.status,
        view_count=post.view_count,
        reply_count=post.reply_count,
        reaction_count=post.reaction_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        is_own=True,
        replies=[]
    )


@router.get(
    "/posts/{post_id}",
    response_model=GhostPostResponse,
    summary="Get single discussion thread with replies"
)
def get_ghost_post(
    post_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single discussion and all threaded replies.
    """
    post = GhostModeRepository.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion post not found."
        )

    # Increment view count
    post.view_count += 1
    db.commit()

    viewer_persona_id = None
    own_persona_ids = []
    if current_user:
        current_persona = GhostModeRepository.get_or_create_current_persona(db, current_user.id)
        viewer_persona_id = current_persona.id
        mappings = db.query(GhostIdentityMapping.persona_id).filter(
            GhostIdentityMapping.user_id == current_user.id
        ).all()
        own_persona_ids = [m[0] for m in mappings]

    replies = GhostModeRepository.list_replies_for_post(db, post_id, viewer_persona_id)
    mapped_replies = [
        GhostReplyResponse(
            id=r.id,
            post_id=r.post_id,
            author=GhostPersonaPublic.model_validate(r.persona),
            parent_reply_id=r.parent_reply_id,
            content=r.content,
            status=r.status,
            reaction_count=r.reaction_count,
            created_at=r.created_at,
            is_own=r.persona_id in own_persona_ids
        )
        for r in replies
    ]

    return GhostPostResponse(
        id=post.id,
        author=GhostPersonaPublic.model_validate(post.persona),
        title=post.title,
        content=post.content,
        category=post.category,
        status=post.status,
        view_count=post.view_count,
        reply_count=post.reply_count,
        reaction_count=post.reaction_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        is_own=post.persona_id in own_persona_ids,
        replies=mapped_replies
    )


@router.patch(
    "/posts/{post_id}",
    response_model=GhostPostResponse,
    summary="Edit own ghost post"
)
def update_ghost_post(
    post_id: int,
    req: GhostPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Edit discussion title or content. Enforces strict author ownership.
    """
    post = GhostModeService.edit_post(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
        title=req.title,
        content=req.content,
        category=req.category
    )
    return GhostPostResponse(
        id=post.id,
        author=GhostPersonaPublic.model_validate(post.persona),
        title=post.title,
        content=post.content,
        category=post.category,
        status=post.status,
        view_count=post.view_count,
        reply_count=post.reply_count,
        reaction_count=post.reaction_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        is_own=True,
        replies=[]
    )


@router.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete own ghost post"
)
def delete_ghost_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft-delete discussion post. Enforces strict author ownership.
    """
    GhostModeService.delete_post(db=db, user_id=current_user.id, post_id=post_id)
    return None


# -----------------------------------------------------------------------------
# 4. Threaded Replies
# -----------------------------------------------------------------------------

@router.post(
    "/posts/{post_id}/replies",
    response_model=GhostReplyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reply to a discussion under pseudonym"
)
def create_ghost_reply(
    post_id: int,
    req: GhostReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a threaded reply. Requires an active premium Ghost Mode entitlement.
    """
    reply = GhostModeService.publish_reply(
        db=db,
        user_id=current_user.id,
        post_id=post_id,
        content=req.content,
        parent_reply_id=req.parent_reply_id
    )
    return GhostReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        author=GhostPersonaPublic.model_validate(reply.persona),
        parent_reply_id=reply.parent_reply_id,
        content=reply.content,
        status=reply.status,
        reaction_count=reply.reaction_count,
        created_at=reply.created_at,
        is_own=True
    )


@router.delete(
    "/replies/{reply_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete own reply"
)
def delete_ghost_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft-delete reply. Enforces author ownership.
    """
    GhostModeService.delete_reply(db=db, user_id=current_user.id, reply_id=reply_id)
    return None


# -----------------------------------------------------------------------------
# 5. Reactions, Reports & Mutes
# -----------------------------------------------------------------------------

@router.post(
    "/reactions",
    summary="Toggle reaction on post or reply"
)
def toggle_reaction(
    req: ReactionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle sentiment reaction under pseudonym.
    """
    active = GhostModeService.react_to_content(
        db=db,
        user_id=current_user.id,
        target_type=req.target_type,
        target_id=req.target_id,
        reaction_type=req.reaction_type
    )
    return {"success": True, "active": active, "reaction_type": req.reaction_type}


@router.post(
    "/reports",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report abusive or harmful ghost content"
)
def report_content(
    req: ReportCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    File an abuse report against a post or reply.
    """
    report = GhostModeService.report_content(
        db=db,
        user_id=current_user.id,
        target_type=req.target_type,
        target_id=req.target_id,
        reason_category=req.reason_category,
        explanation=req.explanation
    )
    return report


@router.post(
    "/mutes",
    summary="Locally mute another persona"
)
def mute_persona(
    req: MutePersonaRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mutes the specified persona so their posts and replies are excluded from your feed.
    """
    muter = GhostModeRepository.get_or_create_current_persona(db, current_user.id)
    muted = GhostModeRepository.get_persona_by_handle(db, req.target_persona_handle)
    if not muted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Persona handle not found.")
    GhostModeRepository.mute_persona(db, muter.id, muted.id)
    return {"success": True, "message": f"Successfully muted {muted.pseudonym}."}


# -----------------------------------------------------------------------------
# 6. Privileged Moderation & Auditing
# -----------------------------------------------------------------------------

@router.get(
    "/moderation/reports",
    response_model=List[ReportResponse],
    summary="Privileged: List content moderation reports"
)
def list_moderation_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    moderator: User = Depends(require_ghost_moderator),
    db: Session = Depends(get_db)
):
    """
    Moderator endpoint to inspect pending abuse reports.
    """
    reports, _ = GhostModeRepository.list_reports(db, status=status_filter, page=page, page_size=page_size)
    return reports


@router.post(
    "/moderation/action",
    summary="Privileged: Hide or restore reported content"
)
def take_moderation_action(
    req: ModerationActionRequest,
    moderator: User = Depends(require_ghost_moderator),
    db: Session = Depends(get_db)
):
    """
    Moderator endpoint to hide abusive content or dismiss reports.
    """
    return GhostModeService.take_moderation_action(
        db=db,
        moderator_user_id=moderator.id,
        target_type=req.target_type,
        target_id=req.target_id,
        action=req.action,
        moderator_notes=req.moderator_notes
    )


@router.post(
    "/moderation/reveal-identity",
    response_model=IdentityRevealResponse,
    summary="Privileged & Audited: Emergency identity resolution"
)
def reveal_identity_for_investigation(
    req: IdentityRevealRequest,
    moderator: User = Depends(require_ghost_moderator),
    db: Session = Depends(get_db)
):
    """
    Strictly restricted emergency safety and legal compliance endpoint.
    Resolves a pseudonymous handle to the underlying member account.
    A mandatory audit log is written to `ghost_audit_logs`.
    """
    resolved_user, audit_log, persona = GhostModeService.reveal_identity_for_audit(
        db=db,
        moderator_user=moderator,
        persona_handle=req.persona_handle,
        audit_reason=req.audit_reason,
        incident_ticket=req.incident_ticket
    )

    full_name = resolved_user.profile.full_name if resolved_user.profile else "Unnamed User"

    return IdentityRevealResponse(
        persona_handle=persona.persona_handle,
        pseudonym=persona.pseudonym,
        revealed_user_id=resolved_user.id,
        revealed_user_email=resolved_user.email,
        revealed_user_name=full_name,
        audit_log_id=audit_log.id,
        warning="This action has been permanently recorded in the security audit ledger."
    )
