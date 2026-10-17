"""
High-integrity business service for the Kin Reputation Engine.
Orchestrates event verification, anti-abuse checks, transactional ledgering,
reversals, and inter-feature domain integration.
"""

from typing import Optional, Dict, Any, Tuple
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.features.kin_reputation.models import (
    KinPointsPolicy,
    KinReputationSummary,
    KinLedgerEntry,
    ContributionEventType,
    VerificationStatus,
    ReputationTier,
    utc_now,
)
from app.features.kin_reputation.repository import KinReputationRepository
from app.features.kin_reputation.anti_abuse import validate_contribution_eligibility


class KinReputationService:

    @classmethod
    def record_verified_contribution(
        cls,
        db: Session,
        user_id: int,
        event_type: str,
        source_reference: str,
        idempotency_key: Optional[str] = None,
        counterparty_user_id: Optional[int] = None,
        quality_score: Optional[float] = None,
        metadata_payload: Optional[Dict[str, Any]] = None,
        authorized_by_actor_id: Optional[int] = None,
        is_system_generated: bool = True,
        points_override: Optional[int] = None,
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """
        Server-side contribution verification and ledger recording.
        Performs idempotency check, eligibility verification, anti-abuse checks,
        and atomic database transaction.
        """
        clean_event_type = event_type.strip().lower().replace("-", "_")

        # 1. Deterministic idempotency key if none provided
        if not idempotency_key:
            idempotency_key = f"{clean_event_type}:{source_reference}:{user_id}"

        # 2. Check for duplicate processing via idempotency key
        existing_by_key = KinReputationRepository.get_ledger_entry_by_idempotency_key(db, idempotency_key)
        if existing_by_key:
            summary = KinReputationRepository.get_or_create_summary(db, user_id)
            return existing_by_key, summary

        # 3. Check for duplicate processing via source reference
        existing_by_source = KinReputationRepository.get_ledger_entry_by_source(db, clean_event_type, source_reference)
        if existing_by_source and existing_by_source.user_id == user_id:
            summary = KinReputationRepository.get_or_create_summary(db, user_id)
            return existing_by_source, summary

        # 4. Validate member exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Active user with ID {user_id} not found"
            )

        # 5. Fetch point policy
        policy = KinReputationRepository.get_policy(db, clean_event_type)
        if not policy.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Points policy for '{clean_event_type}' is currently inactive"
            )

        # 6. Run anti-abuse and eligibility checks
        validate_contribution_eligibility(
            db=db,
            user_id=user_id,
            event_type=clean_event_type,
            policy=policy,
            counterparty_user_id=counterparty_user_id,
            quality_score=quality_score
        )

        # 7. Compute points to award
        points_to_award = points_override if points_override is not None else policy.base_points

        # 8. Create immutable ledger entry
        ledger_entry = KinLedgerEntry(
            user_id=user_id,
            event_type=clean_event_type,
            source_reference=source_reference,
            idempotency_key=idempotency_key,
            points=points_to_award,
            policy_version=policy.policy_version,
            verification_status=VerificationStatus.VERIFIED.value,
            reversal_of_entry_id=None,
            authorized_by_actor_id=authorized_by_actor_id,
            is_system_generated=is_system_generated,
            counterparty_user_id=counterparty_user_id,
            metadata_payload=metadata_payload or {},
            created_at=utc_now(),
        )

        try:
            db.add(ledger_entry)
            db.flush()

            # 9. Atomically recalculate and refresh member reputation summary
            summary = KinReputationRepository.recalculate_summary(db, user_id)
            db.commit()
            db.refresh(ledger_entry)
            db.refresh(summary)
            return ledger_entry, summary

        except IntegrityError:
            db.rollback()
            # In concurrent situations where another worker inserted the same idempotency key
            existing = KinReputationRepository.get_ledger_entry_by_idempotency_key(db, idempotency_key)
            if existing:
                summary = KinReputationRepository.get_or_create_summary(db, user_id)
                return existing, summary
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Transaction conflict during ledger write. Please retry."
            )

    @classmethod
    def reverse_contribution(
        cls,
        db: Session,
        entry_id: int,
        reason: str,
        authorized_by_actor_id: Optional[int] = None,
        dispute_reference: Optional[str] = None
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """
        Reverse a previously awarded ledger entry through a linked adjustment row.
        Never overwrites or deletes historical ledger rows.
        """
        original_entry = KinReputationRepository.get_ledger_entry_by_id(db, entry_id)
        if not original_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ledger entry with ID {entry_id} not found"
            )

        if original_entry.verification_status == VerificationStatus.REVERSED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ledger entry #{entry_id} has already been reversed"
            )

        if original_entry.points <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reverse a non-positive adjustment entry"
            )

        # Mark original entry as reversed
        original_entry.verification_status = VerificationStatus.REVERSED.value

        # Create linked reversal entry
        reversal_entry = KinLedgerEntry(
            user_id=original_entry.user_id,
            event_type=ContributionEventType.DISPUTE_REVERSAL.value,
            source_reference=f"reversal:{original_entry.id}",
            idempotency_key=f"rev:{original_entry.idempotency_key}",
            points=-original_entry.points,
            policy_version=original_entry.policy_version,
            verification_status=VerificationStatus.VERIFIED.value,
            reversal_of_entry_id=original_entry.id,
            authorized_by_actor_id=authorized_by_actor_id,
            is_system_generated=False,
            counterparty_user_id=original_entry.counterparty_user_id,
            metadata_payload={
                "reason": reason,
                "dispute_reference": dispute_reference,
                "reversed_entry_id": original_entry.id,
                "reversed_points": original_entry.points,
            },
            created_at=utc_now(),
        )

        db.add(reversal_entry)
        db.flush()

        summary = KinReputationRepository.recalculate_summary(db, original_entry.user_id)
        db.commit()
        db.refresh(reversal_entry)
        db.refresh(summary)

        return reversal_entry, summary

    # =========================================================================
    # Inter-Feature Trusted Domain Integration Interfaces
    # =========================================================================

    @classmethod
    def record_mentoring_session(
        cls,
        db: Session,
        mentor_user_id: int,
        mentee_user_id: int,
        session_id: str,
        duration_minutes: int,
        feedback_score: Optional[float] = None
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward alumni mentor for completing an eligible 1-on-1 mentoring session."""
        if duration_minutes < 15:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mentoring session duration must be at least 15 minutes to qualify for contribution points"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=mentor_user_id,
            event_type=ContributionEventType.MENTORING_SESSION.value,
            source_reference=f"mentoring:{session_id}",
            counterparty_user_id=mentee_user_id,
            quality_score=feedback_score,
            metadata_payload={"session_id": session_id, "duration_minutes": duration_minutes}
        )

    @classmethod
    def record_portfolio_feedback(
        cls,
        db: Session,
        reviewer_user_id: int,
        student_user_id: int,
        review_id: str,
        review_length: int,
        quality_score: Optional[float] = None
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward substantive feedback on a student's portfolio or CV."""
        if review_length < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback text must be at least 50 characters to qualify as substantive feedback"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=reviewer_user_id,
            event_type=ContributionEventType.PORTFOLIO_FEEDBACK.value,
            source_reference=f"portfolio_feedback:{review_id}",
            counterparty_user_id=student_user_id,
            quality_score=quality_score,
            metadata_payload={"review_id": review_id, "review_length": review_length}
        )

    @classmethod
    def record_mock_interview(
        cls,
        db: Session,
        interviewer_user_id: int,
        candidate_user_id: int,
        interview_id: str,
        feedback_notes: str,
        quality_score: Optional[float] = None
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward completing a mock technical interview with actionable feedback."""
        if not feedback_notes or len(feedback_notes.strip()) < 40:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Actionable feedback notes are required following mock interview"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=interviewer_user_id,
            event_type=ContributionEventType.MOCK_INTERVIEW.value,
            source_reference=f"mock_interview:{interview_id}",
            counterparty_user_id=candidate_user_id,
            quality_score=quality_score,
            metadata_payload={"interview_id": interview_id}
        )

    @classmethod
    def record_twenty_minute_doorway(
        cls,
        db: Session,
        host_user_id: int,
        guest_user_id: int,
        doorway_id: str,
        payment_verified: bool = True,
        completed: bool = True,
        dispute_active: bool = False
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward completing a verified paid 20-Minute Doorway session without active disputes."""
        if not payment_verified or not completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="20-Minute Doorway session must be payment-verified and marked completed"
            )
        if dispute_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reward session with an active dispute"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=host_user_id,
            event_type=ContributionEventType.TWENTY_MINUTE_DOORWAY.value,
            source_reference=f"doorway:{doorway_id}",
            counterparty_user_id=guest_user_id,
            metadata_payload={"doorway_id": doorway_id}
        )

    @classmethod
    def record_wisdom_capsule(
        cls,
        db: Session,
        author_user_id: int,
        capsule_id: str,
        approved: bool = True,
        quality_rating: float = 4.5
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward authoring an approved Wisdom Capsule learning resource."""
        if not approved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wisdom Capsule must be reviewed and approved prior to points allocation"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=author_user_id,
            event_type=ContributionEventType.WISDOM_CAPSULE.value,
            source_reference=f"wisdom_capsule:{capsule_id}",
            quality_score=quality_rating,
            metadata_payload={"capsule_id": capsule_id}
        )

    @classmethod
    def record_successful_introduction(
        cls,
        db: Session,
        connector_user_id: int,
        recipient_user_id: int,
        introduction_id: str,
        accepted: bool = True
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward an introduction that has been explicitly accepted by the recipient."""
        if not accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Introduction must be confirmed accepted by recipient"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=connector_user_id,
            event_type=ContributionEventType.SUCCESSFUL_INTRODUCTION.value,
            source_reference=f"intro:{introduction_id}",
            counterparty_user_id=recipient_user_id,
            metadata_payload={"introduction_id": introduction_id}
        )

    @classmethod
    def record_community_answer(
        cls,
        db: Session,
        author_user_id: int,
        answer_id: str,
        accepted: bool = True
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward authoring an accepted/verified community question answer."""
        if not accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Community answer must be verified or accepted"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=author_user_id,
            event_type=ContributionEventType.COMMUNITY_ANSWER.value,
            source_reference=f"community_answer:{answer_id}",
            metadata_payload={"answer_id": answer_id}
        )

    @classmethod
    def record_positive_feedback(
        cls,
        db: Session,
        recipient_user_id: int,
        rater_user_id: int,
        interaction_id: str,
        rating: int = 5
    ) -> Tuple[KinLedgerEntry, KinReputationSummary]:
        """Reward confirmed positive feedback (5-star or >= 4.0)."""
        if rating < 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback rating must be at least 4.0 to earn positive feedback reputation points"
            )
        return cls.record_verified_contribution(
            db=db,
            user_id=recipient_user_id,
            event_type=ContributionEventType.POSITIVE_FEEDBACK.value,
            source_reference=f"positive_feedback:{interaction_id}",
            counterparty_user_id=rater_user_id,
            quality_score=float(rating),
            metadata_payload={"interaction_id": interaction_id, "rating": rating}
        )
