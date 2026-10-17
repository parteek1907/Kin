from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func

from app.features.twenty_minute_doorway.models import (
    DoorwayExpertProfile,
    DoorwayListing,
    DoorwayBooking,
    DoorwayPaymentOrder,
    DoorwayFinancialLedgerEntry,
    DoorwayAlumniPayout,
    DoorwayReview,
    DoorwayDispute,
    DoorwayAuditLog,
    ExpertVerificationStatus,
    BookingStatus,
    PaymentOrderStatus,
    SettlementStatus,
    PayoutStatus,
    DisputeStatus,
    LedgerEntryType,
)


class DoorwayRepository:

    # ==========================================
    # Expert Profiles
    # ==========================================

    @staticmethod
    def get_expert_by_user_id(db: Session, user_id: int) -> Optional[DoorwayExpertProfile]:
        return db.query(DoorwayExpertProfile).filter(DoorwayExpertProfile.user_id == user_id).first()

    @staticmethod
    def get_expert_by_id(db: Session, expert_id: int) -> Optional[DoorwayExpertProfile]:
        return db.query(DoorwayExpertProfile).filter(DoorwayExpertProfile.id == expert_id).first()

    @staticmethod
    def create_expert_profile(
        db: Session,
        user_id: int,
        institution_affiliation: str,
        expertise_categories: List[str],
        evidence_links: List[str],
        headline: Optional[str] = None,
        bio: Optional[str] = None,
        current_organization: Optional[str] = None,
        current_role: Optional[str] = None,
        years_of_experience: float = 0.0,
        supported_consultation_types: Optional[List[str]] = None,
        availability_slots: Optional[List[Dict[str, Any]]] = None,
        payout_account_details: Optional[Dict[str, Any]] = None,
    ) -> DoorwayExpertProfile:
        expert = DoorwayExpertProfile(
            user_id=user_id,
            institution_affiliation=institution_affiliation,
            headline=headline,
            bio=bio,
            current_organization=current_organization,
            current_role=current_role,
            years_of_experience=years_of_experience,
            expertise_categories=expertise_categories,
            supported_consultation_types=supported_consultation_types or ["one_on_one_20min"],
            evidence_links=evidence_links,
            availability_slots=availability_slots or [],
            payout_account_details=payout_account_details or {},
            verification_status=ExpertVerificationStatus.PENDING.value,
            is_active=True,
        )
        db.add(expert)
        db.flush()
        return expert

    @staticmethod
    def list_verified_experts(
        db: Session,
        category: Optional[str] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[DoorwayExpertProfile]:
        query = db.query(DoorwayExpertProfile).filter(
            DoorwayExpertProfile.verification_status == ExpertVerificationStatus.APPROVED.value,
            DoorwayExpertProfile.is_active == True,
        )
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    DoorwayExpertProfile.headline.ilike(term),
                    DoorwayExpertProfile.bio.ilike(term),
                    DoorwayExpertProfile.current_organization.ilike(term),
                    DoorwayExpertProfile.current_role.ilike(term),
                )
            )
        experts = query.order_by(desc(DoorwayExpertProfile.average_rating), desc(DoorwayExpertProfile.completed_sessions_count)).offset(skip).limit(limit).all()

        if category:
            # Filter JSON list for matching category
            return [exp for exp in experts if category in (exp.expertise_categories or [])]
        return experts

    @staticmethod
    def list_pending_experts(db: Session, skip: int = 0, limit: int = 50) -> List[DoorwayExpertProfile]:
        return db.query(DoorwayExpertProfile).filter(
            DoorwayExpertProfile.verification_status == ExpertVerificationStatus.PENDING.value
        ).order_by(DoorwayExpertProfile.created_at.asc()).offset(skip).limit(limit).all()

    # ==========================================
    # Listings
    # ==========================================

    @staticmethod
    def create_listing(
        db: Session,
        expert_profile_id: int,
        expert_user_id: int,
        title: str,
        service_scope: str,
        category: str,
        expected_deliverables: List[str],
        price_amount_minor: int,
        currency: str = "INR",
        session_duration_minutes: int = 20,
        pricing_policy_version: str = "v1_split_50_50",
        availability_slots: Optional[List[Dict[str, Any]]] = None,
        booking_constraints: Optional[Dict[str, Any]] = None,
        cancellation_policy: Optional[str] = None,
        preparation_requirements: Optional[str] = None,
        service_limitations: Optional[str] = None,
    ) -> DoorwayListing:
        listing = DoorwayListing(
            expert_profile_id=expert_profile_id,
            expert_user_id=expert_user_id,
            title=title,
            service_scope=service_scope,
            category=category,
            expected_deliverables=expected_deliverables,
            session_duration_minutes=session_duration_minutes,
            price_amount_minor=price_amount_minor,
            currency=currency,
            pricing_policy_version=pricing_policy_version,
            availability_slots=availability_slots or [],
            booking_constraints=booking_constraints or {"min_notice_hours": 12, "max_future_days": 30},
            cancellation_policy=cancellation_policy or "Free cancellation up to 4 hours before the session.",
            preparation_requirements=preparation_requirements,
            service_limitations=service_limitations or "This consultation does not provide direct hiring guarantees or proprietary source code.",
            is_active=True,
        )
        db.add(listing)
        db.flush()
        return listing

    @staticmethod
    def get_listing_by_id(db: Session, listing_id: int) -> Optional[DoorwayListing]:
        return db.query(DoorwayListing).filter(DoorwayListing.id == listing_id).first()

    @staticmethod
    def list_active_listings(
        db: Session,
        category: Optional[str] = None,
        expert_user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[DoorwayListing]:
        query = db.query(DoorwayListing).filter(DoorwayListing.is_active == True)
        if category:
            query = query.filter(DoorwayListing.category == category)
        if expert_user_id:
            query = query.filter(DoorwayListing.expert_user_id == expert_user_id)
        return query.order_by(DoorwayListing.created_at.desc()).offset(skip).limit(limit).all()

    # ==========================================
    # Bookings
    # ==========================================

    @staticmethod
    def check_conflicting_booking(
        db: Session,
        expert_user_id: int,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: Optional[int] = None,
    ) -> bool:
        """
        Returns True if the expert already has a confirmed, paid, or active booking
        that overlaps with the requested slot.
        """
        blocking_statuses = [
            BookingStatus.CONFIRMED.value,
            BookingStatus.PAID.value,
            BookingStatus.IN_PROGRESS.value,
            BookingStatus.PAYMENT_PENDING.value,
        ]
        query = db.query(DoorwayBooking).filter(
            DoorwayBooking.expert_user_id == expert_user_id,
            DoorwayBooking.status.in_(blocking_statuses),
            DoorwayBooking.scheduled_start_time < end_time,
            DoorwayBooking.scheduled_end_time > start_time,
        )
        if exclude_booking_id:
            query = query.filter(DoorwayBooking.id != exclude_booking_id)
        return query.first() is not None

    @staticmethod
    def create_booking(
        db: Session,
        booking_reference: str,
        student_id: int,
        expert_user_id: int,
        listing_id: int,
        scheduled_start_time: datetime,
        duration_minutes: int,
        gross_amount_minor: int,
        currency: str,
        pricing_policy_version: str,
        student_notes: Optional[str] = None,
        preparation_submitted: Optional[Dict[str, Any]] = None,
        recording_consent: bool = False,
    ) -> DoorwayBooking:
        end_time = scheduled_start_time + timedelta(minutes=duration_minutes)
        booking = DoorwayBooking(
            booking_reference=booking_reference,
            student_id=student_id,
            expert_user_id=expert_user_id,
            listing_id=listing_id,
            status=BookingStatus.CREATED.value,
            scheduled_start_time=scheduled_start_time,
            scheduled_end_time=end_time,
            duration_minutes=duration_minutes,
            gross_amount_minor=gross_amount_minor,
            currency=currency,
            pricing_policy_version=pricing_policy_version,
            student_notes=student_notes,
            preparation_submitted=preparation_submitted or {},
            recording_consent=recording_consent,
        )
        db.add(booking)
        db.flush()
        return booking

    @staticmethod
    def get_booking_by_id(db: Session, booking_id: int) -> Optional[DoorwayBooking]:
        return db.query(DoorwayBooking).filter(DoorwayBooking.id == booking_id).first()

    @staticmethod
    def get_booking_by_reference(db: Session, booking_reference: str) -> Optional[DoorwayBooking]:
        return db.query(DoorwayBooking).filter(DoorwayBooking.booking_reference == booking_reference).first()

    @staticmethod
    def list_bookings_for_user(
        db: Session,
        user_id: int,
        as_role: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[DoorwayBooking]:
        if as_role == "student":
            query = db.query(DoorwayBooking).filter(DoorwayBooking.student_id == user_id)
        elif as_role == "expert":
            query = db.query(DoorwayBooking).filter(DoorwayBooking.expert_user_id == user_id)
        else:
            query = db.query(DoorwayBooking).filter(
                or_(DoorwayBooking.student_id == user_id, DoorwayBooking.expert_user_id == user_id)
            )
        return query.order_by(DoorwayBooking.created_at.desc()).offset(skip).limit(limit).all()

    # ==========================================
    # Payment Orders
    # ==========================================

    @staticmethod
    def create_payment_order(
        db: Session,
        payment_intent_reference: str,
        booking_id: int,
        provider_name: str,
        provider_order_id: str,
        amount_minor: int,
        currency: str,
        client_secret: str,
        idempotency_key: str,
    ) -> DoorwayPaymentOrder:
        order = DoorwayPaymentOrder(
            payment_intent_reference=payment_intent_reference,
            booking_id=booking_id,
            provider_name=provider_name,
            provider_order_id=provider_order_id,
            amount_minor=amount_minor,
            currency=currency,
            client_secret=client_secret,
            idempotency_key=idempotency_key,
            status=PaymentOrderStatus.PENDING.value,
        )
        db.add(order)
        db.flush()
        return order

    @staticmethod
    def get_payment_order_by_booking_id(db: Session, booking_id: int) -> Optional[DoorwayPaymentOrder]:
        return db.query(DoorwayPaymentOrder).filter(DoorwayPaymentOrder.booking_id == booking_id).first()

    @staticmethod
    def get_payment_order_by_provider_order_id(db: Session, provider_order_id: str) -> Optional[DoorwayPaymentOrder]:
        return db.query(DoorwayPaymentOrder).filter(DoorwayPaymentOrder.provider_order_id == provider_order_id).first()

    # ==========================================
    # Financial Ledger
    # ==========================================

    @staticmethod
    def create_ledger_entry(
        db: Session,
        entry_reference: str,
        booking_id: int,
        gross_amount_minor: int,
        currency: str,
        eligible_commission_base_minor: int,
        platform_share_minor: int,
        alumni_share_minor: int,
        entry_type: str = LedgerEntryType.INITIAL_ALLOCATION.value,
        pricing_policy_version: str = "v1_split_50_50",
        settlement_status: str = SettlementStatus.UNSETTLED.value,
        taxes_minor: int = 0,
        processing_fees_minor: int = 0,
        refund_amount_minor: int = 0,
        adjustment_amount_minor: int = 0,
        reversal_of_entry_id: Optional[int] = None,
        notes: Optional[str] = None,
    ) -> DoorwayFinancialLedgerEntry:
        now = datetime.now(timezone.utc)
        audit_hash = DoorwayFinancialLedgerEntry.compute_audit_hash(
            entry_reference=entry_reference,
            booking_id=booking_id,
            gross_minor=gross_amount_minor,
            alumni_minor=alumni_share_minor,
            platform_minor=platform_share_minor,
            entry_type=entry_type,
            created_at=now,
        )
        entry = DoorwayFinancialLedgerEntry(
            entry_reference=entry_reference,
            booking_id=booking_id,
            gross_amount_minor=gross_amount_minor,
            currency=currency,
            eligible_commission_base_minor=eligible_commission_base_minor,
            platform_share_minor=platform_share_minor,
            alumni_share_minor=alumni_share_minor,
            taxes_minor=taxes_minor,
            processing_fees_minor=processing_fees_minor,
            refund_amount_minor=refund_amount_minor,
            adjustment_amount_minor=adjustment_amount_minor,
            entry_type=entry_type,
            pricing_policy_version=pricing_policy_version,
            settlement_status=settlement_status,
            reversal_of_entry_id=reversal_of_entry_id,
            notes=notes,
            immutable_audit_hash=audit_hash,
            created_at=now,
        )
        db.add(entry)
        db.flush()
        return entry

    @staticmethod
    def get_ledger_entries_for_booking(db: Session, booking_id: int) -> List[DoorwayFinancialLedgerEntry]:
        return db.query(DoorwayFinancialLedgerEntry).filter(
            DoorwayFinancialLedgerEntry.booking_id == booking_id
        ).order_by(DoorwayFinancialLedgerEntry.created_at.asc()).all()

    @staticmethod
    def get_ledger_entries_for_expert(db: Session, expert_user_id: int) -> List[DoorwayFinancialLedgerEntry]:
        return db.query(DoorwayFinancialLedgerEntry).join(
            DoorwayBooking, DoorwayFinancialLedgerEntry.booking_id == DoorwayBooking.id
        ).filter(
            DoorwayBooking.expert_user_id == expert_user_id
        ).order_by(DoorwayFinancialLedgerEntry.created_at.desc()).all()

    @staticmethod
    def list_pending_settlement_bookings(db: Session, skip: int = 0, limit: int = 50) -> List[DoorwayBooking]:
        return db.query(DoorwayBooking).filter(
            DoorwayBooking.status == BookingStatus.SETTLEMENT_PENDING.value
        ).order_by(DoorwayBooking.completed_at.asc()).offset(skip).limit(limit).all()

    # ==========================================
    # Alumni Payouts
    # ==========================================

    @staticmethod
    def create_payout(
        db: Session,
        payout_reference: str,
        booking_id: int,
        expert_user_id: int,
        amount_minor: int,
        currency: str,
        destination_account_mask: str,
        idempotency_key: str,
        authorized_by_admin_id: Optional[int] = None,
        provider_transfer_id: Optional[str] = None,
        payout_status: str = PayoutStatus.SCHEDULED.value,
    ) -> DoorwayAlumniPayout:
        payout = DoorwayAlumniPayout(
            payout_reference=payout_reference,
            booking_id=booking_id,
            expert_user_id=expert_user_id,
            amount_minor=amount_minor,
            currency=currency,
            payout_status=payout_status,
            provider_transfer_id=provider_transfer_id,
            destination_account_mask=destination_account_mask,
            idempotency_key=idempotency_key,
            authorized_by_admin_id=authorized_by_admin_id,
        )
        db.add(payout)
        db.flush()
        return payout

    @staticmethod
    def get_payout_by_booking_id(db: Session, booking_id: int) -> Optional[DoorwayAlumniPayout]:
        return db.query(DoorwayAlumniPayout).filter(DoorwayAlumniPayout.booking_id == booking_id).first()

    @staticmethod
    def list_payouts_for_expert(db: Session, expert_user_id: int) -> List[DoorwayAlumniPayout]:
        return db.query(DoorwayAlumniPayout).filter(
            DoorwayAlumniPayout.expert_user_id == expert_user_id
        ).order_by(DoorwayAlumniPayout.created_at.desc()).all()

    # ==========================================
    # Reviews & Disputes
    # ==========================================

    @staticmethod
    def create_review(
        db: Session,
        booking_id: int,
        student_id: int,
        expert_user_id: int,
        rating: int,
        review_text: str,
        usefulness_score: int = 5,
        human_expertise_verified: bool = True,
        ai_slop_complaint: bool = False,
        would_recommend: bool = True,
    ) -> DoorwayReview:
        review = DoorwayReview(
            booking_id=booking_id,
            student_id=student_id,
            expert_user_id=expert_user_id,
            rating=rating,
            review_text=review_text,
            usefulness_score=usefulness_score,
            human_expertise_verified=human_expertise_verified,
            ai_slop_complaint=ai_slop_complaint,
            would_recommend=would_recommend,
        )
        db.add(review)
        db.flush()
        return review

    @staticmethod
    def get_review_by_booking_id(db: Session, booking_id: int) -> Optional[DoorwayReview]:
        return db.query(DoorwayReview).filter(DoorwayReview.booking_id == booking_id).first()

    @staticmethod
    def create_dispute(
        db: Session,
        dispute_reference: str,
        booking_id: int,
        opened_by_user_id: int,
        dispute_reason: str,
        detailed_explanation: str,
        requested_resolution: str = "full_refund",
    ) -> DoorwayDispute:
        dispute = DoorwayDispute(
            dispute_reference=dispute_reference,
            booking_id=booking_id,
            opened_by_user_id=opened_by_user_id,
            dispute_reason=dispute_reason,
            detailed_explanation=detailed_explanation,
            requested_resolution=requested_resolution,
            status=DisputeStatus.OPEN.value,
        )
        db.add(dispute)
        db.flush()
        return dispute

    @staticmethod
    def get_dispute_by_id(db: Session, dispute_id: int) -> Optional[DoorwayDispute]:
        return db.query(DoorwayDispute).filter(DoorwayDispute.id == dispute_id).first()

    @staticmethod
    def has_active_dispute(db: Session, booking_id: int) -> bool:
        active_statuses = [DisputeStatus.OPEN.value, DisputeStatus.UNDER_REVIEW.value]
        return db.query(DoorwayDispute).filter(
            DoorwayDispute.booking_id == booking_id,
            DoorwayDispute.status.in_(active_statuses),
        ).first() is not None

    # ==========================================
    # Audit Logs
    # ==========================================

    @staticmethod
    def create_audit_log(
        db: Session,
        entity_type: str,
        entity_id: str,
        action: str,
        actor_user_id: Optional[int] = None,
        actor_role: Optional[str] = None,
        previous_state: Optional[Dict[str, Any]] = None,
        new_state: Optional[Dict[str, Any]] = None,
        metadata_payload: Optional[Dict[str, Any]] = None,
    ) -> DoorwayAuditLog:
        log = DoorwayAuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            previous_state=previous_state,
            new_state=new_state,
            metadata_payload=metadata_payload or {},
        )
        db.add(log)
        db.flush()
        return log
