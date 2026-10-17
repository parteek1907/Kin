import secrets
import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import PlatformRole
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
    DisputeReason,
    LedgerEntryType,
)
from app.features.twenty_minute_doorway.schemas import (
    ExpertApplyRequest,
    ExpertProfileUpdate,
    ExpertVerificationAdminRequest,
    ListingCreateRequest,
    ListingUpdateRequest,
    BookingCreateRequest,
    BookingRescheduleRequest,
    BookingCancellationRequest,
    BookingCompleteRequest,
    ReviewCreateRequest,
    DisputeCreateRequest,
    DisputeResolutionRequest,
    FinancialCalculationResult,
    AlumniEarningsSummary,
    LedgerEntryResponse,
)
from app.features.twenty_minute_doorway.repository import DoorwayRepository
from app.features.twenty_minute_doorway.payment_provider import (
    PaymentProviderInterface,
    default_payment_provider,
)
from app.features.kin_reputation.service import KinReputationService


class DoorwayService:
    DEFAULT_POLICY_VERSION = "v1_split_50_50"

    # =========================================================================
    # 1. Exact 50/50 Financial Calculation & Currency Rules
    # =========================================================================

    @classmethod
    def calculate_financial_split(
        cls,
        gross_amount_minor: int,
        currency: str = "INR",
        pricing_policy_version: str = DEFAULT_POLICY_VERSION,
    ) -> FinancialCalculationResult:
        """
        Calculates exact 50% platform / 50% alumni split in integer minor currency units.
        Never uses floating-point arithmetic.
        
        Rounding policy:
        If gross_amount_minor is odd (e.g. 5001 paise), alumni receives floor(5001 / 2) = 2500,
        and platform absorbs the 1 unit remainder = 2501.
        The sum (alumni_share + platform_share) always equals eligible_commission_base exactly.
        """
        if gross_amount_minor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gross amount must be a positive integer in minor currency units"
            )

        eligible_base = gross_amount_minor
        alumni_share = eligible_base // 2
        platform_share = eligible_base - alumni_share

        return FinancialCalculationResult(
            gross_amount_minor=gross_amount_minor,
            currency=currency.upper(),
            eligible_commission_base_minor=eligible_base,
            platform_share_minor=platform_share,
            alumni_share_minor=alumni_share,
            taxes_minor=0,
            processing_fees_minor=0,
            pricing_policy_version=pricing_policy_version,
            rounding_mode="integer_floor_alumni_platform_absorbs_odd"
        )

    # =========================================================================
    # 2. Expert Profiles & Verification Workflow
    # =========================================================================

    @classmethod
    def apply_as_expert(
        cls,
        db: Session,
        current_user: User,
        req: ExpertApplyRequest,
    ) -> DoorwayExpertProfile:
        """
        Alumnus applies for expert eligibility.
        Profile is created in PENDING status pending human administrator review.
        """
        existing = DoorwayRepository.get_expert_by_user_id(db, current_user.id)
        if existing:
            if existing.verification_status == ExpertVerificationStatus.PENDING.value:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An expert application is already pending review for this account."
                )
            if existing.verification_status == ExpertVerificationStatus.APPROVED.value:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This account is already an approved expert."
                )

        categories_str = [c.value if hasattr(c, "value") else str(c) for c in req.expertise_categories]
        expert = DoorwayRepository.create_expert_profile(
            db=db,
            user_id=current_user.id,
            institution_affiliation=req.institution_affiliation.strip(),
            expertise_categories=categories_str,
            evidence_links=req.evidence_links,
            headline=req.headline.strip() if req.headline else None,
            bio=req.bio.strip() if req.bio else None,
            current_organization=req.current_organization.strip() if req.current_organization else None,
            current_role=req.current_role.strip() if req.current_role else None,
            years_of_experience=req.years_of_experience,
            supported_consultation_types=req.supported_consultation_types or ["one_on_one_20min"],
            availability_slots=req.availability_slots,
            payout_account_details=req.payout_account_details,
        )

        DoorwayRepository.create_audit_log(
            db=db,
            entity_type="expert_profile",
            entity_id=str(expert.id),
            action="expert_application_submitted",
            actor_user_id=current_user.id,
            actor_role="applicant",
            metadata_payload={"institution": expert.institution_affiliation, "categories": categories_str}
        )

        db.commit()
        db.refresh(expert)
        return expert

    @classmethod
    def admin_verify_expert(
        cls,
        db: Session,
        admin_user: User,
        expert_id: int,
        req: ExpertVerificationAdminRequest,
    ) -> DoorwayExpertProfile:
        """
        Human-reviewed verification action by an administrator.
        Prevents experts from self-verifying.
        """
        expert = DoorwayRepository.get_expert_by_id(db, expert_id)
        if not expert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expert profile not found"
            )

        if expert.user_id == admin_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrators cannot approve their own expert profile."
            )

        prev_status = expert.verification_status
        new_status = req.verification_status.value

        expert.verification_status = new_status
        expert.verification_notes = req.verification_notes
        if new_status == ExpertVerificationStatus.APPROVED.value:
            expert.verified_at = datetime.now(timezone.utc)
            expert.verified_by_user_id = admin_user.id
            if req.reverification_due_days:
                expert.reverification_due_at = datetime.now(timezone.utc) + timedelta(days=req.reverification_due_days)
            expert.is_active = True
        elif new_status in (ExpertVerificationStatus.SUSPENDED.value, ExpertVerificationStatus.REVOKED.value):
            expert.is_active = False

        DoorwayRepository.create_audit_log(
            db=db,
            entity_type="expert_profile",
            entity_id=str(expert.id),
            action="expert_verification_updated",
            actor_user_id=admin_user.id,
            actor_role="admin",
            previous_state={"verification_status": prev_status},
            new_state={"verification_status": new_status, "reverification_due_at": expert.reverification_due_at.isoformat() if expert.reverification_due_at else None},
            metadata_payload={"notes": req.verification_notes}
        )

        db.commit()
        db.refresh(expert)
        return expert

    @classmethod
    def update_own_expert_profile(
        cls,
        db: Session,
        current_user: User,
        req: ExpertProfileUpdate,
    ) -> DoorwayExpertProfile:
        """
        Allows an expert to update bio, headline, availability slots, and payout settings.
        Experts are strictly forbidden from modifying verification status or metrics.
        """
        expert = DoorwayRepository.get_expert_by_user_id(db, current_user.id)
        if not expert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expert profile not found. Please apply first."
            )

        if req.headline is not None:
            expert.headline = req.headline.strip()
        if req.bio is not None:
            expert.bio = req.bio.strip()
        if req.current_organization is not None:
            expert.current_organization = req.current_organization.strip()
        if req.current_role is not None:
            expert.current_role = req.current_role.strip()
        if req.years_of_experience is not None:
            expert.years_of_experience = req.years_of_experience
        if req.expertise_categories is not None:
            expert.expertise_categories = [c.value if hasattr(c, "value") else str(c) for c in req.expertise_categories]
        if req.supported_consultation_types is not None:
            expert.supported_consultation_types = req.supported_consultation_types
        if req.availability_slots is not None:
            expert.availability_slots = req.availability_slots
        if req.payout_account_details is not None:
            expert.payout_account_details = req.payout_account_details
        if req.is_active is not None:
            expert.is_active = req.is_active

        db.commit()
        db.refresh(expert)
        return expert

    # =========================================================================
    # 3. Consultation Listings
    # =========================================================================

    @classmethod
    def create_listing(
        cls,
        db: Session,
        current_user: User,
        req: ListingCreateRequest,
    ) -> DoorwayListing:
        """
        Approved and active expert creates a 20-minute consultation listing.
        """
        expert = DoorwayRepository.get_expert_by_user_id(db, current_user.id)
        if not expert:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only verified alumni experts can publish consultation listings."
            )
        if expert.verification_status != ExpertVerificationStatus.APPROVED.value or not expert.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your expert profile is not approved or is currently suspended."
            )

        category_str = req.category.value if hasattr(req.category, "value") else str(req.category)
        listing = DoorwayRepository.create_listing(
            db=db,
            expert_profile_id=expert.id,
            expert_user_id=current_user.id,
            title=req.title.strip(),
            service_scope=req.service_scope.strip(),
            category=category_str,
            expected_deliverables=req.expected_deliverables,
            price_amount_minor=req.price_amount_minor,
            currency=req.currency.upper(),
            session_duration_minutes=req.session_duration_minutes,
            pricing_policy_version=cls.DEFAULT_POLICY_VERSION,
            availability_slots=req.availability_slots or expert.availability_slots,
            booking_constraints=req.booking_constraints,
            cancellation_policy=req.cancellation_policy,
            preparation_requirements=req.preparation_requirements,
            service_limitations=req.service_limitations,
        )

        db.commit()
        db.refresh(listing)
        return listing

    @classmethod
    def update_listing(
        cls,
        db: Session,
        current_user: User,
        listing_id: int,
        req: ListingUpdateRequest,
    ) -> DoorwayListing:
        listing = DoorwayRepository.get_listing_by_id(db, listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        if listing.expert_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this listing."
            )

        if req.title is not None:
            listing.title = req.title.strip()
        if req.service_scope is not None:
            listing.service_scope = req.service_scope.strip()
        if req.category is not None:
            listing.category = req.category.value if hasattr(req.category, "value") else str(req.category)
        if req.expected_deliverables is not None:
            listing.expected_deliverables = req.expected_deliverables
        if req.price_amount_minor is not None:
            listing.price_amount_minor = req.price_amount_minor
        if req.currency is not None:
            listing.currency = req.currency.upper()
        if req.availability_slots is not None:
            listing.availability_slots = req.availability_slots
        if req.booking_constraints is not None:
            listing.booking_constraints = req.booking_constraints
        if req.cancellation_policy is not None:
            listing.cancellation_policy = req.cancellation_policy
        if req.preparation_requirements is not None:
            listing.preparation_requirements = req.preparation_requirements
        if req.service_limitations is not None:
            listing.service_limitations = req.service_limitations
        if req.is_active is not None:
            listing.is_active = req.is_active

        db.commit()
        db.refresh(listing)
        return listing

    # =========================================================================
    # 4. Booking Lifecycle & Concurrency Control
    # =========================================================================

    @classmethod
    def create_booking(
        cls,
        db: Session,
        student_user: User,
        req: BookingCreateRequest,
    ) -> DoorwayBooking:
        """
        Student books a consultation listing.
        Server calculates payable amount directly from the listing.
        Checks for self-booking, unapproved expert, and time-slot collision.
        """
        listing = DoorwayRepository.get_listing_by_id(db, req.listing_id)
        if not listing or not listing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing is not available or inactive."
            )

        if listing.expert_user_id == student_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Experts cannot book their own consultation services."
            )

        expert = DoorwayRepository.get_expert_by_id(db, listing.expert_profile_id)
        if not expert or expert.verification_status != ExpertVerificationStatus.APPROVED.value or not expert.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The requested expert is not currently eligible to accept bookings."
            )

        now = datetime.now(timezone.utc)
        start_time = req.scheduled_start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)

        if start_time <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking start time must be in the future."
            )

        end_time = start_time + timedelta(minutes=listing.session_duration_minutes)

        # Concurrency safety: check if slot is already occupied
        if DoorwayRepository.check_conflicting_booking(db, listing.expert_user_id, start_time, end_time):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The requested time slot conflicts with an existing booking for this expert."
            )

        booking_ref = f"BK-20M-{secrets.token_hex(6).upper()}"
        booking = DoorwayRepository.create_booking(
            db=db,
            booking_reference=booking_ref,
            student_id=student_user.id,
            expert_user_id=listing.expert_user_id,
            listing_id=listing.id,
            scheduled_start_time=start_time,
            duration_minutes=listing.session_duration_minutes,
            gross_amount_minor=listing.price_amount_minor,  # Trusted server listing price
            currency=listing.currency,
            pricing_policy_version=listing.pricing_policy_version,
            student_notes=req.student_notes,
            preparation_submitted=req.preparation_submitted,
            recording_consent=req.recording_consent,
        )

        DoorwayRepository.create_audit_log(
            db=db,
            entity_type="booking",
            entity_id=booking.booking_reference,
            action="booking_created",
            actor_user_id=student_user.id,
            actor_role="student",
            new_state={"status": booking.status, "amount_minor": booking.gross_amount_minor}
        )

        db.commit()
        db.refresh(booking)
        return booking

    # =========================================================================
    # 5. Payment Intent, Verification & Webhook Handling
    # =========================================================================

    @classmethod
    def create_payment_intent(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> DoorwayPaymentOrder:
        """
        Creates server-side payment order using trusted booking amount.
        """
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        if booking.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot pay for another user's booking."
            )

        if booking.status not in (BookingStatus.CREATED.value, BookingStatus.PAYMENT_PENDING.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot initiate payment for booking in '{booking.status}' state."
            )

        # Idempotent return if already created
        existing_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
        if existing_order and existing_order.status == PaymentOrderStatus.PENDING.value:
            return existing_order

        idempotency_key = f"pay_intent_{booking.booking_reference}"
        intent_result = provider.create_order(
            amount_minor=booking.gross_amount_minor,
            currency=booking.currency,
            idempotency_key=idempotency_key,
            metadata={"booking_ref": booking.booking_reference, "student_id": booking.student_id}
        )

        intent_ref = f"PI-DOOR-{secrets.token_hex(8).upper()}"
        payment_order = DoorwayRepository.create_payment_order(
            db=db,
            payment_intent_reference=intent_ref,
            booking_id=booking.id,
            provider_name=intent_result.provider_name,
            provider_order_id=intent_result.provider_order_id,
            amount_minor=intent_result.amount_minor,
            currency=intent_result.currency,
            client_secret=intent_result.client_secret,
            idempotency_key=idempotency_key,
        )

        booking.status = BookingStatus.PAYMENT_PENDING.value
        db.commit()
        db.refresh(payment_order)
        return payment_order

    @classmethod
    def verify_payment(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
        provider_order_id: str,
        provider_payment_id: str,
        signature: Optional[str] = None,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> DoorwayBooking:
        """
        Verifies payment with payment provider.
        Never trusts client-supplied success callback without gateway verification.
        Upon success, transitions booking to PAID and creates initial 50/50 financial ledger entry.
        """
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        if booking.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to verify payment for this booking."
            )

        payment_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
        if not payment_order or payment_order.provider_order_id != provider_order_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment order mismatch or missing payment intent."
            )

        # Trusted provider verification
        result = provider.verify_payment(
            provider_order_id=provider_order_id,
            provider_payment_id=provider_payment_id,
            client_signature=signature
        )

        if not result.success:
            payment_order.status = PaymentOrderStatus.FAILED.value
            booking.status = BookingStatus.PAYMENT_FAILED.value
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Payment verification failed: {result.error_message or 'Declined by provider'}"
            )

        # Mark paid
        payment_order.status = PaymentOrderStatus.SUCCEEDED.value
        payment_order.provider_payment_id = provider_payment_id
        payment_order.verified_at = datetime.now(timezone.utc)
        booking.status = BookingStatus.PAID.value

        # Create Durable Financial Ledger Record
        cls._create_initial_ledger_allocation(db, booking, payment_order)

        DoorwayRepository.create_audit_log(
            db=db,
            entity_type="payment",
            entity_id=payment_order.payment_intent_reference,
            action="payment_verified_succeeded",
            actor_user_id=current_user.id,
            actor_role="student",
            new_state={"status": "paid", "provider_payment_id": provider_payment_id}
        )

        db.commit()
        db.refresh(booking)
        return booking

    @classmethod
    def handle_payment_webhook(
        cls,
        db: Session,
        payload_bytes: bytes,
        signature_header: str,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> Dict[str, Any]:
        """
        Idempotent payment webhook processing with HMAC signature verification.
        Protects against duplicate events, out-of-order events, and replay attacks.
        """
        if not provider.verify_webhook_signature(payload_bytes, signature_header, None):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature."
            )

        try:
            data = json.loads(payload_bytes.decode("utf-8"))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed webhook JSON payload."
            )

        event_id = data.get("event_id")
        event_type = data.get("event_type")
        provider_order_id = data.get("provider_order_id")
        provider_payment_id = data.get("provider_payment_id")

        if not provider_order_id:
            return {"status": "ignored", "reason": "missing provider_order_id"}

        payment_order = DoorwayRepository.get_payment_order_by_provider_order_id(db, provider_order_id)
        if not payment_order:
            return {"status": "ignored", "reason": "order_not_found"}

        # Idempotent duplicate event protection
        if payment_order.webhook_last_event_id == event_id:
            return {"status": "success", "message": "Duplicate event ignored (idempotent)"}

        payment_order.webhook_last_event_id = event_id
        booking = payment_order.booking

        if event_type == "payment.succeeded":
            if payment_order.status != PaymentOrderStatus.SUCCEEDED.value:
                payment_order.status = PaymentOrderStatus.SUCCEEDED.value
                payment_order.provider_payment_id = provider_payment_id
                payment_order.verified_at = datetime.now(timezone.utc)
                booking.status = BookingStatus.PAID.value
                cls._create_initial_ledger_allocation(db, booking, payment_order)
        elif event_type == "payment.failed":
            if payment_order.status != PaymentOrderStatus.SUCCEEDED.value:
                payment_order.status = PaymentOrderStatus.FAILED.value
                booking.status = BookingStatus.PAYMENT_FAILED.value

        db.commit()
        return {"status": "success", "processed_event": event_type}

    @classmethod
    def _create_initial_ledger_allocation(
        cls,
        db: Session,
        booking: DoorwayBooking,
        payment_order: DoorwayPaymentOrder,
    ) -> DoorwayFinancialLedgerEntry:
        """
        Writes immutable initial allocation entry in the financial ledger.
        Ensures idempotent single entry.
        """
        existing = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
        if existing:
            return existing[0]

        calc = cls.calculate_financial_split(
            gross_amount_minor=booking.gross_amount_minor,
            currency=booking.currency,
            pricing_policy_version=booking.pricing_policy_version,
        )

        entry_ref = f"LEDG-DOOR-{secrets.token_hex(8).upper()}"
        return DoorwayRepository.create_ledger_entry(
            db=db,
            entry_reference=entry_ref,
            booking_id=booking.id,
            gross_amount_minor=calc.gross_amount_minor,
            currency=calc.currency,
            eligible_commission_base_minor=calc.eligible_commission_base_minor,
            platform_share_minor=calc.platform_share_minor,
            alumni_share_minor=calc.alumni_share_minor,
            entry_type=LedgerEntryType.INITIAL_ALLOCATION.value,
            pricing_policy_version=calc.pricing_policy_version,
            settlement_status=SettlementStatus.UNSETTLED.value,
            taxes_minor=0,
            processing_fees_minor=0,
            notes=f"Initial 50/50 allocation for booking {booking.booking_reference}"
        )

    # =========================================================================
    # 6. Session Execution & Completion Workflow
    # =========================================================================

    @classmethod
    def confirm_booking(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
    ) -> DoorwayBooking:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if booking.expert_user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the assigned expert can confirm this booking.")

        if booking.status != BookingStatus.PAID.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot confirm booking in '{booking.status}' status. Booking must be PAID first."
            )

        booking.status = BookingStatus.CONFIRMED.value
        db.commit()
        db.refresh(booking)
        return booking

    @classmethod
    def start_consultation(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
    ) -> DoorwayBooking:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if current_user.id not in (booking.student_id, booking.expert_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant in this consultation.")

        if booking.status not in (BookingStatus.CONFIRMED.value, BookingStatus.IN_PROGRESS.value):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session cannot be started unless confirmed.")

        if booking.status != BookingStatus.IN_PROGRESS.value:
            booking.status = BookingStatus.IN_PROGRESS.value
            booking.started_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(booking)
        return booking

    @classmethod
    def complete_consultation(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
        req: BookingCompleteRequest,
    ) -> DoorwayBooking:
        """
        Records consultation completion.
        Requires completion confirmation. When both parties confirm (or expert confirms),
        transitions booking to COMPLETED -> SETTLEMENT_PENDING.
        Integrates with Kin Reputation Engine to award verified community reputation!
        """
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if current_user.id not in (booking.student_id, booking.expert_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant in this booking.")

        if booking.status not in (BookingStatus.IN_PROGRESS.value, BookingStatus.CONFIRMED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete session in '{booking.status}' state."
            )

        now = datetime.now(timezone.utc)
        if current_user.id == booking.student_id:
            booking.student_completed = True
            booking.student_completed_at = now
        elif current_user.id == booking.expert_user_id:
            booking.expert_completed = True
            booking.expert_completed_at = now
            booking.ai_assistance_used = req.ai_assistance_used
            booking.ai_assistance_summary = req.ai_assistance_summary

        # Mark completed if expert completes or both complete
        if booking.expert_completed:
            booking.status = BookingStatus.COMPLETED.value
            booking.completed_at = now

            # Increment expert completed session count
            expert = DoorwayRepository.get_expert_by_user_id(db, booking.expert_user_id)
            if expert:
                expert.completed_sessions_count += 1

            # Prepare for settlement
            booking.status = BookingStatus.SETTLEMENT_PENDING.value

            # Update financial ledger to PENDING settlement
            ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
            if ledger_entries:
                ledger_entries[0].settlement_status = SettlementStatus.PENDING.value

            # Integrate with Kin Reputation Engine: award verified doorway contribution points
            try:
                KinReputationService.record_twenty_minute_doorway(
                    db=db,
                    host_user_id=booking.expert_user_id,
                    guest_user_id=booking.student_id,
                    doorway_id=booking.booking_reference,
                    payment_verified=True,
                    completed=True,
                    dispute_active=False
                )
            except Exception:
                # Do not fail completion if reputation service has already awarded or encountered edge case
                pass

        db.commit()
        db.refresh(booking)
        return booking

    @classmethod
    def report_no_show(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
    ) -> DoorwayBooking:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if current_user.id not in (booking.student_id, booking.expert_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant in this booking.")

        role = "student" if current_user.id == booking.student_id else "expert"
        booking.no_show_reported_by = role
        booking.status = BookingStatus.DISPUTED.value

        # Block settlement immediately
        ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
        if ledger_entries:
            ledger_entries[0].settlement_status = SettlementStatus.BLOCKED_DISPUTE.value

        DoorwayRepository.create_dispute(
            db=db,
            dispute_reference=f"DISP-NS-{secrets.token_hex(6).upper()}",
            booking_id=booking.id,
            opened_by_user_id=current_user.id,
            dispute_reason=DisputeReason.NO_SHOW.value,
            detailed_explanation=f"Participant {role} reported counterparty failure to attend scheduled session.",
            requested_resolution="full_refund" if role == "student" else "dismiss"
        )

        db.commit()
        db.refresh(booking)
        return booking

    @classmethod
    def cancel_booking(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
        req: BookingCancellationRequest,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> DoorwayBooking:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if current_user.id not in (booking.student_id, booking.expert_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this booking.")

        if booking.status in (BookingStatus.COMPLETED.value, BookingStatus.SETTLED.value, BookingStatus.IN_PROGRESS.value):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel a booking in '{booking.status}' state.")

        was_paid = booking.status in (BookingStatus.PAID.value, BookingStatus.CONFIRMED.value)

        booking.status = BookingStatus.CANCELLED.value
        booking.cancellation_reason = req.cancellation_reason
        booking.cancelled_by_user_id = current_user.id
        booking.cancelled_at = datetime.now(timezone.utc)

        if was_paid:
            # Process refund via payment provider
            payment_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
            if payment_order and payment_order.provider_payment_id:
                provider.process_refund(
                    provider_payment_id=payment_order.provider_payment_id,
                    amount_minor=booking.gross_amount_minor,
                    currency=booking.currency,
                    reason=f"Booking cancelled: {req.cancellation_reason}"
                )
            booking.status = BookingStatus.REFUNDED.value

            # Record refund adjustment in financial ledger without erasing original history!
            ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
            orig_id = ledger_entries[0].id if ledger_entries else None
            calc = cls.calculate_financial_split(booking.gross_amount_minor, booking.currency)

            DoorwayRepository.create_ledger_entry(
                db=db,
                entry_reference=f"LEDG-ADJ-{secrets.token_hex(8).upper()}",
                booking_id=booking.id,
                gross_amount_minor=-calc.gross_amount_minor,
                currency=calc.currency,
                eligible_commission_base_minor=-calc.eligible_commission_base_minor,
                platform_share_minor=-calc.platform_share_minor,
                alumni_share_minor=-calc.alumni_share_minor,
                entry_type=LedgerEntryType.REFUND_ADJUSTMENT.value,
                pricing_policy_version=booking.pricing_policy_version,
                settlement_status=SettlementStatus.BLOCKED_REFUND.value,
                refund_amount_minor=booking.gross_amount_minor,
                reversal_of_entry_id=orig_id,
                notes=f"Full refund adjustment due to cancellation by user {current_user.id}"
            )

        db.commit()
        db.refresh(booking)
        return booking

    # =========================================================================
    # 7. Reviews & Anti-AI-Slop Governance
    # =========================================================================

    @classmethod
    def submit_review(
        cls,
        db: Session,
        student_user: User,
        booking_id: int,
        req: ReviewCreateRequest,
    ) -> DoorwayReview:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if booking.student_id != student_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the student can review this consultation.")

        if booking.status not in (BookingStatus.COMPLETED.value, BookingStatus.SETTLEMENT_PENDING.value, BookingStatus.SETTLED.value):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only review completed sessions.")

        existing = DoorwayRepository.get_review_by_booking_id(db, booking.id)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A review has already been submitted for this session.")

        review = DoorwayRepository.create_review(
            db=db,
            booking_id=booking.id,
            student_id=student_user.id,
            expert_user_id=booking.expert_user_id,
            rating=req.rating,
            review_text=req.review_text.strip(),
            usefulness_score=req.usefulness_score,
            human_expertise_verified=req.human_expertise_verified,
            ai_slop_complaint=req.ai_slop_complaint,
            would_recommend=req.would_recommend,
        )

        expert = DoorwayRepository.get_expert_by_user_id(db, booking.expert_user_id)
        if expert:
            # Recompute rolling average rating
            total_revs = expert.total_reviews_count
            expert.average_rating = round(((expert.average_rating * total_revs) + req.rating) / (total_revs + 1), 2)
            expert.total_reviews_count += 1

            # Quality and AI slop enforcement
            if req.ai_slop_complaint or not req.human_expertise_verified:
                expert.ai_slop_complaints_count += 1
                if expert.ai_slop_complaints_count >= 2:
                    # Suspend expert and trigger admin review
                    expert.is_active = False
                    expert.verification_status = ExpertVerificationStatus.SUSPENDED.value
                    DoorwayRepository.create_audit_log(
                        db=db,
                        entity_type="expert_profile",
                        entity_id=str(expert.id),
                        action="auto_suspended_quality_complaints",
                        actor_role="system",
                        metadata_payload={"ai_slop_complaints": expert.ai_slop_complaints_count}
                    )

        db.commit()
        db.refresh(review)
        return review

    # =========================================================================
    # 8. Disputes & Dispute Resolution
    # =========================================================================

    @classmethod
    def raise_dispute(
        cls,
        db: Session,
        current_user: User,
        booking_id: int,
        req: DisputeCreateRequest,
    ) -> DoorwayDispute:
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        if current_user.id not in (booking.student_id, booking.expert_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to raise a dispute.")

        reason_str = req.dispute_reason.value if hasattr(req.dispute_reason, "value") else str(req.dispute_reason)
        dispute_ref = f"DISP-{secrets.token_hex(6).upper()}"

        dispute = DoorwayRepository.create_dispute(
            db=db,
            dispute_reference=dispute_ref,
            booking_id=booking.id,
            opened_by_user_id=current_user.id,
            dispute_reason=reason_str,
            detailed_explanation=req.detailed_explanation.strip(),
            requested_resolution=req.requested_resolution,
        )

        booking.status = BookingStatus.DISPUTED.value

        # Block any pending settlement
        ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
        if ledger_entries:
            ledger_entries[0].settlement_status = SettlementStatus.BLOCKED_DISPUTE.value

        db.commit()
        db.refresh(dispute)
        return dispute

    @classmethod
    def admin_resolve_dispute(
        cls,
        db: Session,
        admin_user: User,
        dispute_id: int,
        req: DisputeResolutionRequest,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> DoorwayDispute:
        dispute = DoorwayRepository.get_dispute_by_id(db, dispute_id)
        if not dispute:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")

        booking = dispute.booking
        status_val = req.status.value if hasattr(req.status, "value") else str(req.status)
        dispute.status = status_val
        dispute.resolution_notes = req.resolution_notes.strip()
        dispute.resolved_by_admin_id = admin_user.id
        dispute.resolved_at = datetime.now(timezone.utc)

        if status_val == DisputeStatus.RESOLVED_REFUNDED.value:
            # Full refund
            dispute.refund_amount_minor = booking.gross_amount_minor
            booking.status = BookingStatus.REFUNDED.value
            payment_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
            if payment_order and payment_order.provider_payment_id:
                provider.process_refund(
                    provider_payment_id=payment_order.provider_payment_id,
                    amount_minor=booking.gross_amount_minor,
                    currency=booking.currency,
                    reason=f"Dispute resolved: {dispute.resolution_notes}"
                )

            # Record ledger reversal
            ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
            orig_id = ledger_entries[0].id if ledger_entries else None
            calc = cls.calculate_financial_split(booking.gross_amount_minor, booking.currency)

            DoorwayRepository.create_ledger_entry(
                db=db,
                entry_reference=f"LEDG-DISP-REF-{secrets.token_hex(6).upper()}",
                booking_id=booking.id,
                gross_amount_minor=-calc.gross_amount_minor,
                currency=calc.currency,
                eligible_commission_base_minor=-calc.eligible_commission_base_minor,
                platform_share_minor=-calc.platform_share_minor,
                alumni_share_minor=-calc.alumni_share_minor,
                entry_type=LedgerEntryType.REFUND_ADJUSTMENT.value,
                pricing_policy_version=booking.pricing_policy_version,
                settlement_status=SettlementStatus.BLOCKED_REFUND.value,
                refund_amount_minor=booking.gross_amount_minor,
                reversal_of_entry_id=orig_id,
                notes=f"Dispute {dispute.dispute_reference} resolved with full refund"
            )

        elif status_val == DisputeStatus.RESOLVED_PARTIAL_REFUND.value:
            refund_amt = req.refund_amount_minor or (booking.gross_amount_minor // 2)
            dispute.refund_amount_minor = refund_amt
            booking.status = BookingStatus.PARTIALLY_REFUNDED.value

            payment_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
            if payment_order and payment_order.provider_payment_id:
                provider.process_refund(
                    provider_payment_id=payment_order.provider_payment_id,
                    amount_minor=refund_amt,
                    currency=booking.currency,
                    reason=f"Dispute resolved partial refund: {dispute.resolution_notes}"
                )

            DoorwayRepository.create_ledger_entry(
                db=db,
                entry_reference=f"LEDG-DISP-PART-{secrets.token_hex(6).upper()}",
                booking_id=booking.id,
                gross_amount_minor=-refund_amt,
                currency=booking.currency,
                eligible_commission_base_minor=-refund_amt,
                platform_share_minor=-(refund_amt - (refund_amt // 2)),
                alumni_share_minor=-(refund_amt // 2),
                entry_type=LedgerEntryType.REFUND_ADJUSTMENT.value,
                pricing_policy_version=booking.pricing_policy_version,
                settlement_status=SettlementStatus.PENDING.value,
                refund_amount_minor=refund_amt,
                notes=f"Dispute {dispute.dispute_reference} resolved with partial refund"
            )

        elif status_val == DisputeStatus.RESOLVED_REJECTED.value:
            # Dispute dismissed: unblock settlement
            booking.status = BookingStatus.SETTLEMENT_PENDING.value
            ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
            if ledger_entries:
                ledger_entries[0].settlement_status = SettlementStatus.PENDING.value

        db.commit()
        db.refresh(dispute)
        return dispute

    # =========================================================================
    # 9. Alumni Payouts & Settlement Disbursement
    # =========================================================================

    @classmethod
    def disburse_alumni_payout(
        cls,
        db: Session,
        admin_user: User,
        booking_id: int,
        provider: PaymentProviderInterface = default_payment_provider,
    ) -> DoorwayAlumniPayout:
        """
        Executes authorized alumni settlement payout.
        Enforces strict verification checklist:
        1. Booking completed / settlement pending.
        2. Payment confirmed / succeeded.
        3. Expert profile approved and active (not suspended/revoked).
        4. No active dispute.
        5. No previous successful payout (enforced by DB unique constraint).
        6. Out-of-transaction durable external transfer execution to prevent rollback discrepancies.
        """
        booking = DoorwayRepository.get_booking_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        # 1. Booking Status Checklist
        if booking.status not in (BookingStatus.COMPLETED.value, BookingStatus.SETTLEMENT_PENDING.value, BookingStatus.PAYOUT_FAILED.value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Booking in '{booking.status}' state is not eligible for settlement payout."
            )

        # 2. Payment Succeeded Checklist
        payment_order = DoorwayRepository.get_payment_order_by_booking_id(db, booking.id)
        if not payment_order or payment_order.status != PaymentOrderStatus.SUCCEEDED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disburse payout: verified payment not confirmed."
            )

        # 3. Expert Account Checklist
        expert = DoorwayRepository.get_expert_by_user_id(db, booking.expert_user_id)
        if not expert or expert.verification_status != ExpertVerificationStatus.APPROVED.value or not expert.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disburse payout: Expert account is suspended, revoked, or unverified."
            )

        # 4. Dispute Checklist
        if DoorwayRepository.has_active_dispute(db, booking.id) or booking.status == BookingStatus.DISPUTED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disburse payout: An active dispute is blocking settlement."
            )

        # 5. Duplicate Payout Checklist
        existing_payout = DoorwayRepository.get_payout_by_booking_id(db, booking.id)
        if existing_payout and existing_payout.payout_status == PayoutStatus.SUCCEEDED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A successful settlement payout has already been executed for this booking."
            )

        # Financial share calculation
        ledger_entries = DoorwayRepository.get_ledger_entries_for_booking(db, booking.id)
        if not ledger_entries:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Financial ledger record missing for booking."
            )

        # Sum net alumni share from ledger (accounting for any partial adjustments)
        net_alumni_share = sum(e.alumni_share_minor for e in ledger_entries)
        if net_alumni_share <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Net eligible alumni payout amount is zero or negative."
            )

        destination_mask = expert.payout_account_details.get("account_mask", "acct_****default")
        idempotency_key = f"xfer_bkid_{booking.booking_reference}"

        if existing_payout:
            payout = existing_payout
            payout.payout_status = PayoutStatus.PROCESSING.value
            payout.retry_count += 1
        else:
            payout_ref = f"PO-ALUM-{secrets.token_hex(8).upper()}"
            payout = DoorwayRepository.create_payout(
                db=db,
                payout_reference=payout_ref,
                booking_id=booking.id,
                expert_user_id=booking.expert_user_id,
                amount_minor=net_alumni_share,
                currency=booking.currency,
                destination_account_mask=destination_mask,
                idempotency_key=idempotency_key,
                authorized_by_admin_id=admin_user.id,
                payout_status=PayoutStatus.PROCESSING.value,
            )

        db.commit()
        db.refresh(payout)

        # External Gateway Transfer Call
        transfer_result = provider.disburse_payout(
            expert_user_id=booking.expert_user_id,
            amount_minor=net_alumni_share,
            currency=booking.currency,
            destination_account_mask=destination_mask,
            idempotency_key=idempotency_key,
        )

        if transfer_result.success:
            payout.payout_status = PayoutStatus.SUCCEEDED.value
            payout.provider_transfer_id = transfer_result.provider_transfer_id
            payout.executed_at = datetime.now(timezone.utc)
            booking.status = BookingStatus.SETTLED.value

            for entry in ledger_entries:
                if entry.settlement_status in (SettlementStatus.UNSETTLED.value, SettlementStatus.PENDING.value):
                    entry.settlement_status = SettlementStatus.SETTLED.value
                    entry.payout_reference = payout.payout_reference

            DoorwayRepository.create_audit_log(
                db=db,
                entity_type="payout",
                entity_id=payout.payout_reference,
                action="payout_succeeded",
                actor_user_id=admin_user.id,
                actor_role="admin",
                new_state={"status": "succeeded", "transfer_id": transfer_result.provider_transfer_id}
            )
        else:
            payout.payout_status = PayoutStatus.FAILED.value
            payout.failure_reason = transfer_result.error_message
            booking.status = BookingStatus.PAYOUT_FAILED.value

            DoorwayRepository.create_audit_log(
                db=db,
                entity_type="payout",
                entity_id=payout.payout_reference,
                action="payout_failed",
                actor_user_id=admin_user.id,
                actor_role="admin",
                new_state={"status": "failed", "error": transfer_result.error_message}
            )

        db.commit()
        db.refresh(payout)
        return payout

    # =========================================================================
    # 10. Earnings & History
    # =========================================================================

    @classmethod
    def get_expert_earnings_summary(cls, db: Session, expert_user_id: int) -> AlumniEarningsSummary:
        expert = DoorwayRepository.get_expert_by_user_id(db, expert_user_id)
        if not expert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert profile not found")

        ledger_entries = DoorwayRepository.get_ledger_entries_for_expert(db, expert_user_id)
        payouts = DoorwayRepository.list_payouts_for_expert(db, expert_user_id)

        total_gross = sum(e.gross_amount_minor for e in ledger_entries if e.gross_amount_minor > 0)
        total_earned = sum(e.alumni_share_minor for e in ledger_entries)
        total_settled = sum(p.amount_minor for p in payouts if p.payout_status == PayoutStatus.SUCCEEDED.value)
        pending_settlement = sum(
            e.alumni_share_minor for e in ledger_entries if e.settlement_status == SettlementStatus.PENDING.value
        )
        blocked_dispute = sum(
            e.alumni_share_minor for e in ledger_entries if e.settlement_status == SettlementStatus.BLOCKED_DISPUTE.value
        )

        entry_schemas = [LedgerEntryResponse.model_validate(e) for e in ledger_entries]

        return AlumniEarningsSummary(
            expert_user_id=expert_user_id,
            currency="INR",
            total_lifetime_gross_minor=total_gross,
            total_alumni_earned_minor=total_earned,
            total_settled_payouts_minor=total_settled,
            pending_settlement_minor=pending_settlement,
            blocked_dispute_minor=blocked_dispute,
            completed_sessions_count=expert.completed_sessions_count,
            ledger_entries=entry_schemas,
        )
