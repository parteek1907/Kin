"""
Database repository for the Kin Reputation Engine.
Handles persistence, queries, transactional row locking, and aggregation
for policies, ledger entries, summaries, and leaderboards.
"""

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from app.features.kin_reputation.models import (
    KinPointsPolicy,
    KinReputationSummary,
    KinLedgerEntry,
    ContributionEventType,
    VerificationStatus,
    ReputationTier,
    calculate_tier_from_points,
    utc_now,
    to_utc,
)
from app.models.user import User
from app.models.profile import Profile


DEFAULT_POLICIES = [
    {
        "event_type": ContributionEventType.MENTORING_SESSION.value,
        "display_name": "Alumni Mentoring Session",
        "description": "Completing a verified 1-on-1 mentoring session with a junior alumni or student.",
        "base_points": 35,
        "daily_cap": 70,
        "cooldown_seconds": 1800,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 3.0,
    },
    {
        "event_type": ContributionEventType.PORTFOLIO_FEEDBACK.value,
        "display_name": "Portfolio & CV Feedback",
        "description": "Providing substantive, actionable review feedback on a portfolio, resume, or project.",
        "base_points": 20,
        "daily_cap": 60,
        "cooldown_seconds": 600,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 3.0,
    },
    {
        "event_type": ContributionEventType.MOCK_INTERVIEW.value,
        "display_name": "Mock Technical Interview",
        "description": "Conducting a rigorous mock interview and submitting constructive assessment feedback.",
        "base_points": 40,
        "daily_cap": 80,
        "cooldown_seconds": 1800,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 3.0,
    },
    {
        "event_type": ContributionEventType.COMMUNITY_ANSWER.value,
        "display_name": "Verified Community Answer",
        "description": "Authoring an accepted, peer-upvoted solution to a community question.",
        "base_points": 15,
        "daily_cap": 45,
        "cooldown_seconds": 300,
        "requires_counterparty": False,
        "requires_verification": True,
        "min_quality_score": 0.0,
    },
    {
        "event_type": ContributionEventType.TWENTY_MINUTE_DOORWAY.value,
        "display_name": "20-Minute Doorway Session",
        "description": "Completing a high-impact, verified 20-minute exploratory industry session.",
        "base_points": 50,
        "daily_cap": 100,
        "cooldown_seconds": 1200,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 3.5,
    },
    {
        "event_type": ContributionEventType.SUCCESSFUL_INTRODUCTION.value,
        "display_name": "Accepted Professional Introduction",
        "description": "Brokering a bilateral professional introduction that is accepted by the recipient.",
        "base_points": 25,
        "daily_cap": 50,
        "cooldown_seconds": 3600,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 0.0,
    },
    {
        "event_type": ContributionEventType.WISDOM_CAPSULE.value,
        "display_name": "Wisdom Capsule Contribution",
        "description": "Authoring an approved, high-utility technical or career learning guide.",
        "base_points": 30,
        "daily_cap": 60,
        "cooldown_seconds": 1800,
        "requires_counterparty": False,
        "requires_verification": True,
        "min_quality_score": 4.0,
    },
    {
        "event_type": ContributionEventType.POSITIVE_FEEDBACK.value,
        "display_name": "Confirmed Positive Feedback",
        "description": "Receiving verified 5-star positive feedback following a completed interaction.",
        "base_points": 10,
        "daily_cap": 30,
        "cooldown_seconds": 300,
        "requires_counterparty": True,
        "requires_verification": True,
        "min_quality_score": 4.0,
    },
]


class KinReputationRepository:

    @staticmethod
    def get_or_create_summary(db: Session, user_id: int) -> KinReputationSummary:
        """Fetch or initialize the member's reputation summary row."""
        summary = db.query(KinReputationSummary).filter(KinReputationSummary.user_id == user_id).first()
        if not summary:
            summary = KinReputationSummary(
                user_id=user_id,
                lifetime_points=0,
                total_adjustments=0,
                current_points=0,
                rolling_30d_points=0,
                rolling_90d_points=0,
                tier=ReputationTier.BRONZE.value,
                verified_contributions_count=0,
                category_breakdown={},
                last_activity_at=None,
            )
            db.add(summary)
            db.flush()
        return summary

    @staticmethod
    def get_policy(db: Session, event_type: str) -> KinPointsPolicy:
        """Retrieve policy for an event type, creating it from defaults if not found."""
        clean_type = event_type.strip().lower().replace("-", "_")
        policy = db.query(KinPointsPolicy).filter(KinPointsPolicy.event_type == clean_type).first()
        if not policy:
            # Seed from default dictionary if present
            default_match = next((p for p in DEFAULT_POLICIES if p["event_type"] == clean_type), None)
            if default_match:
                policy = KinPointsPolicy(
                    event_type=default_match["event_type"],
                    display_name=default_match["display_name"],
                    description=default_match["description"],
                    base_points=default_match["base_points"],
                    daily_cap=default_match["daily_cap"],
                    cooldown_seconds=default_match["cooldown_seconds"],
                    requires_counterparty=default_match["requires_counterparty"],
                    requires_verification=default_match["requires_verification"],
                    min_quality_score=default_match["min_quality_score"],
                    policy_version="v1.0",
                    is_active=True,
                )
            else:
                policy = KinPointsPolicy(
                    event_type=clean_type,
                    display_name=clean_type.replace("_", " ").title(),
                    description="Custom community contribution event.",
                    base_points=10,
                    daily_cap=50,
                    cooldown_seconds=300,
                    requires_counterparty=False,
                    requires_verification=True,
                    min_quality_score=0.0,
                    policy_version="v1.0",
                    is_active=True,
                )
            db.add(policy)
            db.flush()
        return policy

    @staticmethod
    def list_policies(db: Session) -> List[KinPointsPolicy]:
        """Return all active points policies, ensuring defaults exist."""
        policies = db.query(KinPointsPolicy).filter(KinPointsPolicy.is_active == True).all()
        if len(policies) < len(DEFAULT_POLICIES):
            for default_p in DEFAULT_POLICIES:
                KinReputationRepository.get_policy(db, default_p["event_type"])
            db.commit()
            policies = db.query(KinPointsPolicy).filter(KinPointsPolicy.is_active == True).all()
        return policies

    @staticmethod
    def get_ledger_entry_by_idempotency_key(db: Session, idempotency_key: str) -> Optional[KinLedgerEntry]:
        """Check for existing transaction using unique idempotency key."""
        return db.query(KinLedgerEntry).filter(KinLedgerEntry.idempotency_key == idempotency_key).first()

    @staticmethod
    def get_ledger_entry_by_source(
        db: Session,
        event_type: str,
        source_reference: str
    ) -> Optional[KinLedgerEntry]:
        """Check if this specific event instance has already been credited."""
        return db.query(KinLedgerEntry).filter(
            KinLedgerEntry.event_type == event_type,
            KinLedgerEntry.source_reference == source_reference,
            KinLedgerEntry.verification_status == VerificationStatus.VERIFIED.value
        ).first()

    @staticmethod
    def get_ledger_entry_by_id(db: Session, entry_id: int) -> Optional[KinLedgerEntry]:
        """Fetch a single ledger entry by its primary key."""
        return db.query(KinLedgerEntry).filter(KinLedgerEntry.id == entry_id).first()

    @staticmethod
    def list_ledger_entries(
        db: Session,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        event_type: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> Tuple[List[KinLedgerEntry], int]:
        """Fetch paginated ledger transaction history for a user."""
        query = db.query(KinLedgerEntry).filter(KinLedgerEntry.user_id == user_id)

        if event_type:
            clean_type = event_type.strip().lower().replace("-", "_")
            query = query.filter(KinLedgerEntry.event_type == clean_type)
        if from_date:
            query = query.filter(KinLedgerEntry.created_at >= from_date)
        if to_date:
            query = query.filter(KinLedgerEntry.created_at <= to_date)

        total = query.count()
        items = query.order_by(KinLedgerEntry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def recalculate_summary(db: Session, user_id: int) -> KinReputationSummary:
        """
        Recompute summary aggregations from immutable ledger entries.
        Guarantees mathematical integrity across lifetime points, net balances,
        rolling time windows, and category breakdowns.
        """
        summary = KinReputationRepository.get_or_create_summary(db, user_id)

        entries = db.query(KinLedgerEntry).filter(
            KinLedgerEntry.user_id == user_id,
            KinLedgerEntry.verification_status.in_([VerificationStatus.VERIFIED.value, VerificationStatus.REVERSED.value])
        ).all()

        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)
        ninety_days_ago = now - timedelta(days=90)

        lifetime = 0
        adjustments = 0
        rolling_30d = 0
        rolling_90d = 0
        verified_count = 0
        breakdown: Dict[str, int] = {}
        last_activity = None

        for entry in entries:
            # Positive points = earned
            if entry.points > 0:
                lifetime += entry.points
                verified_count += 1
                breakdown[entry.event_type] = breakdown.get(entry.event_type, 0) + entry.points
            else:
                # Negative points = reversal or adjustment
                adjustments += entry.points

            # Rolling windows
            entry_time = to_utc(entry.created_at)
            if entry_time and entry_time >= thirty_days_ago:
                rolling_30d += entry.points
            if entry_time and entry_time >= ninety_days_ago:
                rolling_90d += entry.points

            if entry_time and (last_activity is None or entry_time > last_activity):
                last_activity = entry_time


        current = lifetime + adjustments
        if current < 0:
            current = 0

        summary.lifetime_points = lifetime
        summary.total_adjustments = adjustments
        summary.current_points = current
        summary.rolling_30d_points = max(0, rolling_30d)
        summary.rolling_90d_points = max(0, rolling_90d)
        summary.tier = calculate_tier_from_points(current)
        summary.verified_contributions_count = verified_count
        summary.category_breakdown = breakdown
        summary.last_activity_at = last_activity
        summary.updated_at = utc_now()

        db.flush()
        return summary

    @staticmethod
    def get_leaderboard(
        db: Session,
        window: str = "lifetime",
        page: int = 1,
        page_size: int = 20,
        tier: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Fetch the permitted public leaderboard with rolling time window support.
        Excludes accounts with 0 contributions.
        """
        query = db.query(KinReputationSummary).filter(KinReputationSummary.verified_contributions_count > 0)

        if tier:
            query = query.filter(KinReputationSummary.tier == tier)

        if window == "30d":
            query = query.order_by(KinReputationSummary.rolling_30d_points.desc(), KinReputationSummary.verified_contributions_count.desc())
        elif window == "90d":
            query = query.order_by(KinReputationSummary.rolling_90d_points.desc(), KinReputationSummary.verified_contributions_count.desc())
        else:
            query = query.order_by(KinReputationSummary.current_points.desc(), KinReputationSummary.lifetime_points.desc())

        total = query.count()
        summaries = query.offset((page - 1) * page_size).limit(page_size).all()

        results = []
        start_rank = (page - 1) * page_size + 1
        for idx, s in enumerate(summaries):
            user = db.query(User).filter(User.id == s.user_id).first()
            full_name = "Community Member"
            headline = None
            role = "Member"
            if user and user.profile:
                full_name = user.profile.full_name
                headline = user.profile.headline
                role = user.profile.role

            # Find top category
            top_cat = None
            if s.category_breakdown:
                sorted_cats = sorted(s.category_breakdown.items(), key=lambda x: x[1], reverse=True)
                if sorted_cats:
                    top_cat = sorted_cats[0][0].replace("_", " ").title()

            score = s.current_points
            if window == "30d":
                score = s.rolling_30d_points
            elif window == "90d":
                score = s.rolling_90d_points

            results.append({
                "rank": start_rank + idx,
                "user_id": s.user_id,
                "full_name": full_name,
                "headline": headline,
                "role": role,
                "tier": s.tier,
                "score": score,
                "verified_contributions_count": s.verified_contributions_count,
                "top_category": top_cat
            })

        return results, total
