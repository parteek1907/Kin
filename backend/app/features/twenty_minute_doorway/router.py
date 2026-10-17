from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.features.twenty_minute_doorway.models import (
    DoorwayExpertProfile,
    DoorwayListing,
    DoorwayBooking,
    DoorwayPaymentOrder,
    DoorwayAlumniPayout,
    DoorwayReview,
    DoorwayDispute,
    BookingStatus,
)
from app.features.twenty_minute_doorway.schemas import (
    ExpertApplyRequest,
    ExpertProfileUpdate,
    ExpertVerificationAdminRequest,
    ExpertPublicResponse,
    ExpertPrivateResponse,
    ListingCreateRequest,
    ListingUpdateRequest,
    ListingResponse,
    BookingCreateRequest,
    BookingRescheduleRequest,
    BookingCancellationRequest,
    BookingCompleteRequest,
    BookingResponse,
    PaymentIntentResponse,
    PaymentVerifyRequest,
    LedgerEntryResponse,
    AlumniEarningsSummary,
    PayoutResponse,
    ReviewCreateRequest,
    ReviewResponse,
    DisputeCreateRequest,
    DisputeResolutionRequest,
    DisputeResponse,
)
from app.features.twenty_minute_doorway.repository import DoorwayRepository
from app.features.twenty_minute_doorway.service import DoorwayService


router = APIRouter(prefix="/doorway", tags=["Kin 20-Minute Doorway"])


# =============================================================================
# Expert Discovery & Profile Endpoints
# =============================================================================

@router.get(
    "/experts",
    response_model=List[ExpertPublicResponse],
    summary="List verified experts eligible for consultations"
)
def list_verified_experts(
    category: Optional[str] = Query(None, description="Filter by expertise category"),
    search: Optional[str] = Query(None, description="Search by name, organization, or role"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns public list of verified experts who are approved and active.
    Credibility indicators are strictly verified.
    """
    experts = DoorwayRepository.list_verified_experts(db=db, category=category, search_query=search, skip=skip, limit=limit)
    return experts


@router.get(
    "/experts/me",
    response_model=ExpertPrivateResponse,
    summary="Get current user's expert profile"
)
def get_my_expert_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the expert profile for the authenticated user, including verification status.
    """
    expert = DoorwayRepository.get_expert_by_user_id(db, current_user.id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert profile not found.")
    
    # Mask payout account
    mask = expert.payout_account_details.get("account_mask", "acct_****none") if expert.payout_account_details else None
    resp = ExpertPrivateResponse.model_validate(expert)
    resp.payout_account_mask = mask
    return resp


@router.get(
    "/experts/{expert_id}",
    response_model=ExpertPublicResponse,
    summary="Get verified expert details and credibility indicators"
)
def get_expert_details(
    expert_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns verified expert details, ratings, and permitted credibility indicators.
    Internal fraud notes and verification documents are redacted.
    """
    expert = DoorwayRepository.get_expert_by_id(db, expert_id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found.")
    return expert


@router.post(
    "/experts/apply",
    response_model=ExpertPrivateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for verified alumnus expert status"
)
def apply_as_expert(
    req: ExpertApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Alumnus submits credentials, institutional affiliation, and evidence to become a verified expert.
    """
    expert = DoorwayService.apply_as_expert(db=db, current_user=current_user, req=req)
    return expert


@router.patch(
    "/experts/me",
    response_model=ExpertPrivateResponse,
    summary="Update own expert profile settings"
)
def update_my_expert_profile(
    req: ExpertProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates headline, bio, categories, and availability slots. Verification fields cannot be self-edited.
    """
    expert = DoorwayService.update_own_expert_profile(db=db, current_user=current_user, req=req)
    return expert


@router.get(
    "/experts/me/earnings",
    response_model=AlumniEarningsSummary,
    summary="View expert's earnings, ledger credits, and payout history"
)
def get_my_earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns complete financial breakdown: total earned, pending settlement, settled payouts, and ledger audit entries.
    """
    return DoorwayService.get_expert_earnings_summary(db=db, expert_user_id=current_user.id)


# =============================================================================
# Consultation Listings Endpoints
# =============================================================================

@router.get(
    "/listings",
    response_model=List[ListingResponse],
    summary="List available consultation listings"
)
def list_listings(
    category: Optional[str] = Query(None),
    expert_user_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Browse active consultation listings with transparent pricing and deliverables.
    """
    return DoorwayRepository.list_active_listings(db=db, category=category, expert_user_id=expert_user_id, skip=skip, limit=limit)


@router.get(
    "/listings/{listing_id}",
    response_model=ListingResponse,
    summary="Get consultation listing details"
)
def get_listing_details(
    listing_id: int,
    db: Session = Depends(get_db)
):
    listing = DoorwayRepository.get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return listing


@router.get(
    "/listings/{listing_id}/availability",
    summary="Check availability slots and constraints for listing"
)
def get_listing_availability(
    listing_id: int,
    db: Session = Depends(get_db)
):
    listing = DoorwayRepository.get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return {
        "listing_id": listing.id,
        "session_duration_minutes": listing.session_duration_minutes,
        "availability_slots": listing.availability_slots,
        "booking_constraints": listing.booking_constraints,
    }


@router.post(
    "/listings",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create consultation listing (Approved experts only)"
)
def create_listing(
    req: ListingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.create_listing(db=db, current_user=current_user, req=req)


@router.patch(
    "/listings/{listing_id}",
    response_model=ListingResponse,
    summary="Update or toggle consultation listing"
)
def update_listing(
    listing_id: int,
    req: ListingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.update_listing(db=db, current_user=current_user, listing_id=listing_id, req=req)


# =============================================================================
# Booking & Payment Endpoints
# =============================================================================

@router.post(
    "/bookings",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a consultation session"
)
def create_booking(
    req: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a booking in CREATED state.
    Calculates payable amount strictly from server listing configuration.
    """
    return DoorwayService.create_booking(db=db, student_user=current_user, req=req)


@router.get(
    "/bookings/my",
    response_model=List[BookingResponse],
    summary="List current user's bookings"
)
def list_my_bookings(
    role: Optional[str] = Query(None, description="'student' or 'expert'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayRepository.list_bookings_for_user(db=db, user_id=current_user.id, as_role=role, skip=skip, limit=limit)


@router.get(
    "/bookings/{booking_id}",
    response_model=BookingResponse,
    summary="Get booking details (Participants only)"
)
def get_booking_details(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = DoorwayRepository.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    # IDOR check: only participants or admin can view
    if current_user.id not in (booking.student_id, booking.expert_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to another member's booking.")
    return booking


@router.post(
    "/bookings/{booking_id}/payment-intent",
    response_model=PaymentIntentResponse,
    summary="Initiate payment intent for booking"
)
def create_payment_intent(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates server-side payment order. Never trusts client price.
    """
    order = DoorwayService.create_payment_intent(db=db, current_user=current_user, booking_id=booking_id)
    return PaymentIntentResponse(
        payment_intent_reference=order.payment_intent_reference,
        booking_reference=order.booking.booking_reference,
        provider_name=order.provider_name,
        provider_order_id=order.provider_order_id,
        amount_minor=order.amount_minor,
        currency=order.currency,
        client_secret=order.client_secret,
        status=order.status,
    )


@router.post(
    "/bookings/{booking_id}/verify-payment",
    response_model=BookingResponse,
    summary="Verify payment through trusted provider integration"
)
def verify_payment(
    booking_id: int,
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirms payment with payment provider.
    Transitions booking to PAID and creates immutable 50/50 ledger entry.
    """
    return DoorwayService.verify_payment(
        db=db,
        current_user=current_user,
        booking_id=booking_id,
        provider_order_id=req.provider_order_id,
        provider_payment_id=req.provider_payment_id,
        signature=req.signature,
    )


@router.post(
    "/webhooks/payment",
    summary="Idempotent payment webhook receiver"
)
async def handle_payment_webhook(
    request: Request,
    x_kin_signature: Optional[str] = Header(None, alias="X-Kin-Signature"),
    db: Session = Depends(get_db)
):
    """
    Verifies HMAC signature, prevents replay attacks and duplicate event processing.
    """
    payload_bytes = await request.body()
    return DoorwayService.handle_payment_webhook(
        db=db,
        payload_bytes=payload_bytes,
        signature_header=x_kin_signature or "",
    )


# =============================================================================
# Consultation Session Lifecycle Endpoints
# =============================================================================

@router.post(
    "/bookings/{booking_id}/confirm",
    response_model=BookingResponse,
    summary="Confirm booking by expert"
)
def confirm_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.confirm_booking(db=db, current_user=current_user, booking_id=booking_id)


@router.post(
    "/bookings/{booking_id}/start",
    response_model=BookingResponse,
    summary="Start consultation session"
)
def start_consultation(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.start_consultation(db=db, current_user=current_user, booking_id=booking_id)


@router.post(
    "/bookings/{booking_id}/complete",
    response_model=BookingResponse,
    summary="Confirm session completion"
)
def complete_consultation(
    booking_id: int,
    req: BookingCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records session completion evidence. Prepares booking for settlement.
    Integrates with Kin Reputation Engine.
    """
    return DoorwayService.complete_consultation(db=db, current_user=current_user, booking_id=booking_id, req=req)


@router.post(
    "/bookings/{booking_id}/no-show",
    response_model=BookingResponse,
    summary="Report participant no-show"
)
def report_no_show(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.report_no_show(db=db, current_user=current_user, booking_id=booking_id)


@router.post(
    "/bookings/{booking_id}/cancel",
    response_model=BookingResponse,
    summary="Cancel booking (triggers refund if paid)"
)
def cancel_booking(
    booking_id: int,
    req: BookingCancellationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.cancel_booking(db=db, current_user=current_user, booking_id=booking_id, req=req)


# =============================================================================
# Reviews & Disputes Endpoints
# =============================================================================

@router.post(
    "/bookings/{booking_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit structured post-session feedback"
)
def submit_review(
    booking_id: int,
    req: ReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student submits rating and usefulness feedback. Includes anti-AI-slop reporting.
    """
    return DoorwayService.submit_review(db=db, student_user=current_user, booking_id=booking_id, req=req)


@router.post(
    "/bookings/{booking_id}/disputes",
    response_model=DisputeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Raise a dispute on a booking"
)
def raise_dispute(
    booking_id: int,
    req: DisputeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Raises a formal dispute. Immediately halts settlement and prevents payouts.
    """
    return DoorwayService.raise_dispute(db=db, current_user=current_user, booking_id=booking_id, req=req)


@router.get(
    "/bookings/{booking_id}/disputes",
    response_model=List[DisputeResponse],
    summary="Get disputes on booking"
)
def get_booking_disputes(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = DoorwayRepository.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    if current_user.id not in (booking.student_id, booking.expert_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return booking.disputes


# =============================================================================
# Administrative Review & Settlement Endpoints
# =============================================================================

@router.get(
    "/admin/experts/pending",
    response_model=List[ExpertPrivateResponse],
    summary="Admin: List pending expert applications"
)
def admin_list_pending_experts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayRepository.list_pending_experts(db=db, skip=skip, limit=limit)


@router.post(
    "/admin/experts/{expert_id}/verify",
    response_model=ExpertPrivateResponse,
    summary="Admin: Human review and verification of expert credentials"
)
def admin_verify_expert(
    expert_id: int,
    req: ExpertVerificationAdminRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.admin_verify_expert(db=db, admin_user=current_user, expert_id=expert_id, req=req)


@router.get(
    "/admin/settlements/pending",
    response_model=List[BookingResponse],
    summary="Admin: List bookings eligible for settlement payout"
)
def admin_list_pending_settlements(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayRepository.list_pending_settlement_bookings(db=db, skip=skip, limit=limit)


@router.post(
    "/admin/settlements/{booking_id}/disburse",
    response_model=PayoutResponse,
    summary="Admin: Disburse alumni 50% settlement payout"
)
def admin_disburse_payout(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes alumni 50% payout transfer.
    Verifies full eligibility checklist and prevents double payout.
    """
    return DoorwayService.disburse_alumni_payout(db=db, admin_user=current_user, booking_id=booking_id)


@router.post(
    "/admin/disputes/{dispute_id}/resolve",
    response_model=DisputeResponse,
    summary="Admin: Resolve dispute with refund or dismissal"
)
def admin_resolve_dispute(
    dispute_id: int,
    req: DisputeResolutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return DoorwayService.admin_resolve_dispute(db=db, admin_user=current_user, dispute_id=dispute_id, req=req)
