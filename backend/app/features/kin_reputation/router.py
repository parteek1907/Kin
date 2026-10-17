"""
FastAPI REST endpoints for the Kin Reputation Engine.
Provides member summaries, paginated history, public reputation cards,
rolling leaderboards, category breakdowns, and privileged administrative actions.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_current_user
from app.models.user import User
from app.features.kin_reputation.models import (
    KinPointsPolicy,
    ContributionEventType,
    ReputationTier,
)
from app.features.kin_reputation.schemas import (
    ReputationSummaryResponse,
    PublicReputationResponse,
    LedgerEntryResponse,
    PaginatedLedgerResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    ContributionBreakdownResponse,
    CategoryBreakdownItem,
    PointsPolicyResponse,
    PointsPolicyCreate,
    RecordVerifiedEventRequest,
    RecordEventResponse,
    ReversalRequest,
)
from app.features.kin_reputation.repository import KinReputationRepository, DEFAULT_POLICIES
from app.features.kin_reputation.service import KinReputationService
from app.features.kin_reputation.permissions import (
    require_privileged_actor,
    verify_reputation_view_permission,
)

router = APIRouter(prefix="/reputation", tags=["Kin Reputation Engine"])


@router.get(
    "/me",
    response_model=ReputationSummaryResponse,
    summary="Get current user's reputation summary"
)
def get_my_reputation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve authenticated member's reputation status, lifetime points,
    net points balance, tier, and rolling scores.
    """
    summary = KinReputationRepository.get_or_create_summary(db, current_user.id)
    return summary


@router.get(
    "/history",
    response_model=PaginatedLedgerResponse,
    summary="Get paginated ledger transaction history"
)
def get_my_ledger_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    event_type: Optional[str] = Query(None, description="Filter by event category"),
    from_date: Optional[datetime] = Query(None, description="Start date filter"),
    to_date: Optional[datetime] = Query(None, description="End date filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the member's immutable contribution ledger entries with pagination.
    """
    items, total = KinReputationRepository.list_ledger_entries(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        event_type=event_type,
        from_date=from_date,
        to_date=to_date
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    mapped_items = []
    for item in items:
        reason = None
        if item.metadata_payload and isinstance(item.metadata_payload, dict):
            reason = item.metadata_payload.get("reason")
        mapped_items.append(
            LedgerEntryResponse(
                id=item.id,
                user_id=item.user_id,
                event_type=item.event_type,
                source_reference=item.source_reference,
                idempotency_key=item.idempotency_key,
                points=item.points,
                policy_version=item.policy_version,
                verification_status=item.verification_status,
                reversal_of_entry_id=item.reversal_of_entry_id,
                is_system_generated=item.is_system_generated,
                counterparty_user_id=item.counterparty_user_id,
                reason=reason,
                created_at=item.created_at
            )
        )

    return PaginatedLedgerResponse(
        items=mapped_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get(
    "/users/{user_id}",
    response_model=PublicReputationResponse,
    summary="View public reputation summary for a community member"
)
def get_user_public_reputation(
    user_id: int,
    viewer: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a member's public reputation score and tier.
    Enforces privacy visibility (public, network-only, private) and blocks.
    Never leaks internal fraud signals or private audit notes.
    """
    profile = verify_reputation_view_permission(db, user_id, viewer)
    summary = KinReputationRepository.get_or_create_summary(db, user_id)

    top_cat = None
    if summary.category_breakdown:
        sorted_cats = sorted(summary.category_breakdown.items(), key=lambda x: x[1], reverse=True)
        if sorted_cats:
            top_cat = sorted_cats[0][0].replace("_", " ").title()

    return PublicReputationResponse(
        user_id=user_id,
        full_name=profile.full_name,
        headline=profile.headline,
        role=profile.role,
        tier=summary.tier,
        current_points=summary.current_points,
        verified_contributions_count=summary.verified_contributions_count,
        top_contribution_category=top_cat
    )


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Get verified community reputation leaderboard"
)
def get_community_leaderboard(
    window: str = Query("lifetime", pattern="^(lifetime|30d|90d)$", description="Rolling window filter"),

    tier: Optional[str] = Query(None, description="Filter by reputation tier"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve the community contribution leaderboard across lifetime or rolling windows.
    Excludes spam or unverified activity to incentivize sustained, high-utility engagement.
    """
    items, total = KinReputationRepository.get_leaderboard(
        db=db,
        window=window,
        page=page,
        page_size=page_size,
        tier=tier
    )

    return LeaderboardResponse(
        window=window,
        total_participants=total,
        items=[LeaderboardEntry(**item) for item in items]
    )


@router.get(
    "/breakdown",
    response_model=ContributionBreakdownResponse,
    summary="Get detailed contribution category breakdown"
)
def get_contribution_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detailed breakdown of points earned and volume across all contribution categories.
    """
    summary = KinReputationRepository.get_or_create_summary(db, current_user.id)
    categories = []

    for event_type, points in (summary.category_breakdown or {}).items():
        policy = KinReputationRepository.get_policy(db, event_type)
        pct = (points / summary.lifetime_points * 100.0) if summary.lifetime_points > 0 else 0.0
        # Estimate event count
        event_count = max(1, points // (policy.base_points or 10))
        categories.append(
            CategoryBreakdownItem(
                event_type=event_type,
                display_name=policy.display_name,
                points_earned=points,
                event_count=event_count,
                percentage=round(pct, 1)
            )
        )

    categories.sort(key=lambda x: x.points_earned, reverse=True)

    return ContributionBreakdownResponse(
        user_id=current_user.id,
        current_points=summary.current_points,
        lifetime_points=summary.lifetime_points,
        verified_contributions_count=summary.verified_contributions_count,
        categories=categories
    )


@router.get(
    "/policies",
    response_model=List[PointsPolicyResponse],
    summary="List active points policies and guidelines"
)
def list_policies(
    db: Session = Depends(get_db)
):
    """
    List all active contribution categories, base point values, caps, and cooldowns.
    """
    return KinReputationRepository.list_policies(db)


@router.post(
    "/events",
    response_model=RecordEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Privileged: Record a verified contribution event"
)
def record_verified_event(
    req: RecordVerifiedEventRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    x_internal_service_key: Optional[str] = Header(None, alias="X-Internal-Service-Key"),
    db: Session = Depends(get_db)
):
    """
    Privileged endpoint for recording verified contribution events.
    Ordinary users cannot grant themselves points (HTTP 403 Forbidden).
    Requires Faculty/Admin role or trusted internal backend service key.
    """
    require_privileged_actor(current_user=current_user, x_internal_service_key=x_internal_service_key)

    actor_id = current_user.id if current_user else None

    entry, summary = KinReputationService.record_verified_contribution(
        db=db,
        user_id=req.user_id,
        event_type=req.event_type,
        source_reference=req.source_reference,
        idempotency_key=req.idempotency_key,
        counterparty_user_id=req.counterparty_user_id,
        quality_score=req.quality_score,
        metadata_payload=req.metadata_payload,
        authorized_by_actor_id=actor_id,
        is_system_generated=True if not actor_id else False
    )

    return RecordEventResponse(
        success=True,
        transaction_id=entry.id,
        idempotency_key=entry.idempotency_key,
        points_awarded=entry.points,
        new_current_points=summary.current_points,
        new_tier=summary.tier,
        verification_status=entry.verification_status,
        message=f"Successfully credited {entry.points} points for verified '{entry.event_type}'."
    )


@router.post(
    "/reversals",
    response_model=RecordEventResponse,
    summary="Privileged: Reverse a previously awarded contribution entry"
)
def reverse_contribution_entry(
    req: ReversalRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    x_internal_service_key: Optional[str] = Header(None, alias="X-Internal-Service-Key"),
    db: Session = Depends(get_db)
):
    """
    Privileged endpoint to reverse an erroneous or disputed ledger award.
    Writes an immutable linked reversal entry without mutating historical records.
    """
    require_privileged_actor(current_user=current_user, x_internal_service_key=x_internal_service_key)

    actor_id = current_user.id if current_user else None

    rev_entry, summary = KinReputationService.reverse_contribution(
        db=db,
        entry_id=req.entry_id,
        reason=req.reason,
        authorized_by_actor_id=actor_id,
        dispute_reference=req.dispute_reference
    )

    return RecordEventResponse(
        success=True,
        transaction_id=rev_entry.id,
        idempotency_key=rev_entry.idempotency_key,
        points_awarded=rev_entry.points,
        new_current_points=summary.current_points,
        new_tier=summary.tier,
        verification_status=rev_entry.verification_status,
        message=f"Successfully reversed transaction #{req.entry_id}. Adjusted points by {rev_entry.points}."
    )


@router.post(
    "/admin/policies",
    response_model=PointsPolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Privileged: Create or update a points policy"
)
def create_or_update_policy(
    req: PointsPolicyCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    x_internal_service_key: Optional[str] = Header(None, alias="X-Internal-Service-Key"),
    db: Session = Depends(get_db)
):
    """
    Privileged endpoint to configure points policy categories, point values, daily caps, and cooldowns.
    """
    require_privileged_actor(current_user=current_user, x_internal_service_key=x_internal_service_key)

    clean_type = req.event_type.strip().lower().replace("-", "_")
    policy = db.query(KinPointsPolicy).filter(KinPointsPolicy.event_type == clean_type).first()
    if not policy:
        policy = KinPointsPolicy(event_type=clean_type)
        db.add(policy)

    policy.display_name = req.display_name
    policy.description = req.description
    policy.base_points = req.base_points
    policy.daily_cap = req.daily_cap
    policy.cooldown_seconds = req.cooldown_seconds
    policy.requires_counterparty = req.requires_counterparty
    policy.requires_verification = req.requires_verification
    policy.min_quality_score = req.min_quality_score
    policy.policy_version = req.policy_version
    policy.is_active = req.is_active

    db.commit()
    db.refresh(policy)
    return policy
