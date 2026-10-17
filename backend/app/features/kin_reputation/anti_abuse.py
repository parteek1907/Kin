"""
Anti-abuse safeguards and velocity checks for Kin Reputation Engine.
Detects reciprocal ring farming, cooldown violations, daily cap overruns,
and self-awarding attempts, logging anomalies for review without silent corruptions.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.features.kin_reputation.models import (
    KinPointsPolicy,
    KinLedgerEntry,
    KinAbuseAuditLog,
    AbuseFlagSeverity,
    VerificationStatus,
    to_utc,
)


def log_abuse_anomaly(
    db: Session,
    user_id: int,
    event_type: str,
    flag_reason: str,
    severity: str,
    counterparty_user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
) -> KinAbuseAuditLog:
    """Log an anomalous event for security audit and moderation review."""
    log = KinAbuseAuditLog(
        user_id=user_id,
        counterparty_user_id=counterparty_user_id,
        event_type=event_type,
        flag_reason=flag_reason,
        severity=severity,
        details=details or {},
    )
    db.add(log)
    db.flush()
    return log


def check_self_reward(
    db: Session,
    user_id: int,
    counterparty_user_id: Optional[int],
    event_type: str
) -> None:
    """Reject requests where a member specifies themselves as the counterparty for interaction rewards."""
    if counterparty_user_id and user_id == counterparty_user_id:
        log_abuse_anomaly(
            db=db,
            user_id=user_id,
            event_type=event_type,
            flag_reason="self_reward_attempt",
            severity=AbuseFlagSeverity.FLAGGED.value,
            counterparty_user_id=counterparty_user_id,
            details={"message": "User specified themselves as the counterparty"}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-awarding is prohibited. You cannot be the counterparty for your own contribution event."
        )


def check_cooldown(
    db: Session,
    user_id: int,
    event_type: str,
    cooldown_seconds: int
) -> None:
    """Verify that the cooldown period has elapsed since the member's last event in this category."""
    if cooldown_seconds <= 0:
        return

    cutoff = datetime.now(timezone.utc) - timedelta(seconds=cooldown_seconds)
    recent_entry = db.query(KinLedgerEntry).filter(
        KinLedgerEntry.user_id == user_id,
        KinLedgerEntry.event_type == event_type,
        KinLedgerEntry.verification_status == VerificationStatus.VERIFIED.value,
        KinLedgerEntry.created_at >= cutoff
    ).order_by(KinLedgerEntry.created_at.desc()).first()

    if recent_entry:
        entry_time = to_utc(recent_entry.created_at)
        elapsed = (datetime.now(timezone.utc) - entry_time).total_seconds()
        remaining = max(1, int(cooldown_seconds - elapsed))
        log_abuse_anomaly(
            db=db,
            user_id=user_id,
            event_type=event_type,
            flag_reason="cooldown_violation",
            severity=AbuseFlagSeverity.INFO.value,
            details={"cooldown_seconds": cooldown_seconds, "remaining_seconds": remaining}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Cooldown active for '{event_type}'. Please wait {remaining} seconds before submitting another event in this category."
        )


def check_daily_cap(
    db: Session,
    user_id: int,
    event_type: str,
    daily_cap: int,
    points_to_award: int
) -> None:
    """Enforce daily point caps per category per user."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_points = db.query(func.coalesce(func.sum(KinLedgerEntry.points), 0)).filter(
        KinLedgerEntry.user_id == user_id,
        KinLedgerEntry.event_type == event_type,
        KinLedgerEntry.verification_status == VerificationStatus.VERIFIED.value,
        KinLedgerEntry.created_at >= today_start
    ).scalar() or 0

    if today_points + points_to_award > daily_cap:
        log_abuse_anomaly(
            db=db,
            user_id=user_id,
            event_type=event_type,
            flag_reason="daily_cap_exceeded",
            severity=AbuseFlagSeverity.WARNING.value,
            details={"today_points": today_points, "attempted_award": points_to_award, "daily_cap": daily_cap}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Daily point cap of {daily_cap} exceeded for category '{event_type}'. Already earned {today_points} points today."
        )


def check_reciprocal_farming(
    db: Session,
    user_id: int,
    counterparty_user_id: Optional[int],
    event_type: str,
    max_reciprocal_per_week: int = 4
) -> None:
    """
    Detects two members repeatedly trading points back and forth.
    If Member A and Member B have mutually credited each other more than max_reciprocal_per_week times
    in 7 days, trigger an anomaly flag.
    """
    if not counterparty_user_id:
        return

    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Transactions from counterparty to user
    a_to_b_count = db.query(func.count(KinLedgerEntry.id)).filter(
        KinLedgerEntry.user_id == user_id,
        KinLedgerEntry.counterparty_user_id == counterparty_user_id,
        KinLedgerEntry.verification_status == VerificationStatus.VERIFIED.value,
        KinLedgerEntry.created_at >= one_week_ago
    ).scalar() or 0

    # Transactions from user to counterparty
    b_to_a_count = db.query(func.count(KinLedgerEntry.id)).filter(
        KinLedgerEntry.user_id == counterparty_user_id,
        KinLedgerEntry.counterparty_user_id == user_id,
        KinLedgerEntry.verification_status == VerificationStatus.VERIFIED.value,
        KinLedgerEntry.created_at >= one_week_ago
    ).scalar() or 0

    total_mutual = a_to_b_count + b_to_a_count
    if total_mutual >= max_reciprocal_per_week:
        log_abuse_anomaly(
            db=db,
            user_id=user_id,
            counterparty_user_id=counterparty_user_id,
            event_type=event_type,
            flag_reason="reciprocal_ring_detected",
            severity=AbuseFlagSeverity.FLAGGED.value,
            details={"a_to_b": a_to_b_count, "b_to_a": b_to_a_count, "threshold": max_reciprocal_per_week}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reciprocal interaction threshold exceeded between these members for the current rolling window."
        )


def validate_contribution_eligibility(
    db: Session,
    user_id: int,
    event_type: str,
    policy: KinPointsPolicy,
    counterparty_user_id: Optional[int],
    quality_score: Optional[float]
) -> None:
    """Run comprehensive anti-abuse validation pipeline before committing any ledger award."""
    # 1. Self reward check
    check_self_reward(db, user_id, counterparty_user_id, event_type)

    # 2. Counterparty requirement
    if policy.requires_counterparty and not counterparty_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{event_type}' requires a valid counterparty member."
        )

    # 3. Minimum quality score requirement
    if quality_score is not None and quality_score < policy.min_quality_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quality score {quality_score} is below the required threshold of {policy.min_quality_score}."
        )

    # 4. Reciprocal farming check (run before cooldown/cap to catch ring collusion immediately)
    if counterparty_user_id:
        check_reciprocal_farming(db, user_id, counterparty_user_id, event_type)

    # 5. Cooldown check
    check_cooldown(db, user_id, event_type, policy.cooldown_seconds)

    # 6. Daily cap check
    check_daily_cap(db, user_id, event_type, policy.daily_cap, policy.base_points)

