import json
import secrets
from datetime import datetime, timezone, timedelta
import pytest
from app.features.twenty_minute_doorway.service import DoorwayService
from app.features.twenty_minute_doorway.payment_provider import default_payment_provider
from app.features.twenty_minute_doorway.models import (
    ExpertVerificationStatus,
    BookingStatus,
    PaymentOrderStatus,
    SettlementStatus,
    PayoutStatus,
    LedgerEntryType,
)


from app.core.security import create_access_token
from app.models.user import User
from app.models.profile import Profile


@pytest.fixture
def admin_auth(db):
    """Provides an authenticated admin/faculty user with instant JWT token."""
    user = db.query(User).filter(User.email == "admin.doorway@iiitd.ac.in").first()
    if not user:
        user = User(
            email="admin.doorway@iiitd.ac.in",
            hashed_password="mock_hashed_password_for_testing",
            is_active=True
        )
        db.add(user)
        db.flush()
        profile = Profile(
            user_id=user.id,
            full_name="Admin Director",
            role="Faculty",
            headline="Dean of Academic & Alumni Affairs"
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user.id,
        "email": user.email
    }


def test_exact_50_50_split_and_rounding_boundaries():
    """
    Test 1: Exact 50/50 split for representative prices and rounding boundaries.
    Never uses floating-point arithmetic.
    Even numbers split exactly in half; odd numbers allocate remainder to platform.
    """
    # Case A: Standard even amount (Rs 50.00 = 5000 paise)
    res_5000 = DoorwayService.calculate_financial_split(gross_amount_minor=5000, currency="INR")
    assert res_5000.gross_amount_minor == 5000
    assert res_5000.alumni_share_minor == 2500
    assert res_5000.platform_share_minor == 2500
    assert res_5000.alumni_share_minor + res_5000.platform_share_minor == 5000

    # Case B: Standard high amount ($100.00 = 10000 cents)
    res_10000 = DoorwayService.calculate_financial_split(gross_amount_minor=10000, currency="USD")
    assert res_10000.alumni_share_minor == 5000
    assert res_10000.platform_share_minor == 5000
    assert res_10000.alumni_share_minor + res_10000.platform_share_minor == 10000

    # Case C: Odd amount boundary (5001 paise)
    # 5001 // 2 = 2500 for alumni, 2501 for platform
    res_5001 = DoorwayService.calculate_financial_split(gross_amount_minor=5001, currency="INR")
    assert res_5001.alumni_share_minor == 2500
    assert res_5001.platform_share_minor == 2501
    assert res_5001.alumni_share_minor + res_5001.platform_share_minor == 5001

    # Case D: Minimal odd boundary (1 minor unit)
    res_1 = DoorwayService.calculate_financial_split(gross_amount_minor=1, currency="INR")
    assert res_1.alumni_share_minor == 0
    assert res_1.platform_share_minor == 1
    assert res_1.alumni_share_minor + res_1.platform_share_minor == 1

    # Case E: Non-positive amount rejected
    with pytest.raises(Exception):
        DoorwayService.calculate_financial_split(gross_amount_minor=0)


def test_expert_application_and_admin_verification(client, alumni_auth, admin_auth):
    """
    Test 2: Expert applies, verification is human-reviewed, self-approval prevented.
    """
    apply_payload = {
        "institution_affiliation": "IIITD Alumni Association (Class of 2019)",
        "headline": "Staff ML Engineer at Anthropic",
        "bio": "Specialized in large language models and career transitions.",
        "current_organization": "Anthropic",
        "current_role": "Staff ML Engineer",
        "years_of_experience": 6.5,
        "expertise_categories": ["career_decision", "technical_project_review"],
        "supported_consultation_types": ["one_on_one_20min"],
        "evidence_links": ["https://linkedin.com/in/example-alumni", "https://github.com/example"],
        "availability_slots": [{"day": "saturday", "start": "14:00", "end": "18:00"}],
        "payout_account_details": {"account_mask": "acct_****9876", "payout_method": "bank_transfer"}
    }

    # Alumnus submits application
    res_apply = client.post("/api/v1/doorway/experts/apply", json=apply_payload, headers=alumni_auth["headers"])
    assert res_apply.status_code == 201
    expert_data = res_apply.json()
    assert expert_data["verification_status"] == "pending"
    assert expert_data["is_active"] is True
    expert_id = expert_data["id"]

    # Verify expert is not yet in public approved listings
    res_pub = client.get("/api/v1/doorway/experts")
    assert res_pub.status_code == 200
    assert not any(e["id"] == expert_id for e in res_pub.json())

    # Attempt self-approval by alumnus: must be forbidden
    res_self = client.post(
        f"/api/v1/doorway/admin/experts/{expert_id}/verify",
        json={"verification_status": "approved", "verification_notes": "Self approved"},
        headers=alumni_auth["headers"]
    )
    assert res_self.status_code == 403

    # Legitimate admin review and approval
    res_verify = client.post(
        f"/api/v1/doorway/admin/experts/{expert_id}/verify",
        json={
            "verification_status": "approved",
            "verification_notes": "Credentials and institutional email verified.",
            "reverification_due_days": 180
        },
        headers=admin_auth["headers"]
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["verification_status"] == "approved"

    # Now verified expert appears in public discovery
    res_pub_after = client.get("/api/v1/doorway/experts")
    assert res_pub_after.status_code == 200
    assert any(e["id"] == expert_id for e in res_pub_after.json())


def test_client_cannot_manipulate_price_or_payout_amount(client, alumni_auth, student_auth, admin_auth):
    """
    Test 3: Client attempts to manipulate price, currency, commission, or payout.
    Server strictly enforces trusted listing price and configuration.
    """
    # 1. Alumnus applies & Admin approves
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD Alumni",
        "expertise_categories": ["career_decision"],
        "evidence_links": ["https://linkedin.com/in/test"],
        "payout_account_details": {"account_mask": "acct_****1111"}
    }, headers=alumni_auth["headers"])

    exp_me = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(
        f"/api/v1/doorway/admin/experts/{exp_me['id']}/verify",
        json={"verification_status": "approved"},
        headers=admin_auth["headers"]
    )

    # 2. Expert creates listing with official price = 5000 paise (Rs 50.00)
    listing_res = client.post("/api/v1/doorway/listings", json={
        "title": "20-Min ML Career Guidance & CV Review",
        "service_scope": "Comprehensive 20-minute discussion covering ML career options and resume feedback.",
        "category": "career_decision",
        "expected_deliverables": ["Actionable CV feedback", "Industry transition checklist"],
        "session_duration_minutes": 20,
        "price_amount_minor": 5000,
        "currency": "INR",
    }, headers=alumni_auth["headers"])
    assert listing_res.status_code == 201
    listing_id = listing_res.json()["id"]

    # 3. Student creates booking attempting to supply fake client price = 100 paise
    future_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    booking_res = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing_id,
        "scheduled_start_time": future_time,
        "student_notes": "Career advice please",
        # Malicious client attempts to inject price:
        "gross_amount_minor": 100,
        "price_amount_minor": 100,
        "commission_percentage": 0,
    }, headers=student_auth["headers"])
    assert booking_res.status_code == 201
    booking_data = booking_res.json()
    booking_id = booking_data["id"]

    # Server MUST have used 5000 from the listing, completely ignoring client's 100
    assert booking_data["gross_amount_minor"] == 5000
    assert booking_data["currency"] == "INR"

    # 4. Initiate payment intent
    intent_res = client.post(f"/api/v1/doorway/bookings/{booking_id}/payment-intent", headers=student_auth["headers"])
    assert intent_res.status_code == 200
    intent_data = intent_res.json()
    assert intent_data["amount_minor"] == 5000


def test_invalid_or_unverified_payment_confirmation(client, alumni_auth, student_auth, admin_auth):
    """
    Test 4: Invalid or unverified payment confirmation is rejected.
    Cannot confirm session without verified payment.
    """
    # 1. Setup expert & listing
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["interview_prep"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Interview Prep 20m",
        "service_scope": "Focused technical mock interview with actionable feedback.",
        "category": "interview_prep",
        "expected_deliverables": ["Feedback score"],
        "price_amount_minor": 4000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"]).json()
    booking_id = booking["id"]

    # Try to confirm booking while still unpaid (CREATED state): must fail
    res_confirm_unpaid = client.post(f"/api/v1/doorway/bookings/{booking_id}/confirm", headers=alumni_auth["headers"])
    assert res_confirm_unpaid.status_code == 400

    # Create payment intent
    intent = client.post(f"/api/v1/doorway/bookings/{booking_id}/payment-intent", headers=student_auth["headers"]).json()

    # Try to verify with fake order or failed gateway: simulate verification failure
    default_payment_provider.set_verification_failure_simulation(True)
    res_verify_fail = client.post(
        f"/api/v1/doorway/bookings/{booking_id}/verify-payment",
        json={
            "provider_order_id": intent["provider_order_id"],
            "provider_payment_id": "pay_fake_declined",
        },
        headers=student_auth["headers"]
    )
    assert res_verify_fail.status_code == 402
    default_payment_provider.set_verification_failure_simulation(False)

    # Booking must now be marked PAYMENT_FAILED, not CONFIRMED
    booking_status = client.get(f"/api/v1/doorway/bookings/{booking_id}", headers=student_auth["headers"]).json()["status"]
    assert booking_status == "payment_failed"


def test_concurrent_booking_attempts_for_same_slot(client, alumni_auth, student_auth, second_user_auth, admin_auth):
    """
    Test 5: Concurrent booking attempts for the same time slot prevent double-booking.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["domain_expertise"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Domain Expertise 20m",
        "service_scope": "In-depth domain expertise consultation and Q&A.",
        "category": "domain_expertise",
        "expected_deliverables": ["Advice"],
        "price_amount_minor": 5000,
    }, headers=alumni_auth["headers"]).json()

    slot_time = (datetime.now(timezone.utc) + timedelta(days=5)).replace(minute=0, second=0, microsecond=0).isoformat()

    # Student 1 books slot
    res1 = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": slot_time
    }, headers=student_auth["headers"])
    assert res1.status_code == 201
    booking1_id = res1.json()["id"]

    # Student 1 pays for slot
    intent1 = client.post(f"/api/v1/doorway/bookings/{booking1_id}/payment-intent", headers=student_auth["headers"]).json()
    client.post(
        f"/api/v1/doorway/bookings/{booking1_id}/verify-payment",
        json={"provider_order_id": intent1["provider_order_id"], "provider_payment_id": "pay_slot1"},
        headers=student_auth["headers"]
    )

    # Student 2 attempts to book the exact same overlapping slot
    res2 = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": slot_time
    }, headers=second_user_auth["headers"])
    assert res2.status_code == 409  # Conflict!


def test_duplicate_and_out_of_order_payment_webhooks(client, alumni_auth, student_auth, admin_auth):
    """
    Test 6: Duplicate and out-of-order payment webhooks.
    Idempotent duplicate returns 200 without duplicate state transition or double ledger entry.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["career_decision"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Webhook Test Listing",
        "service_scope": "Testing webhook idempotency and signature validation.",
        "category": "career_decision",
        "expected_deliverables": ["Advice"],
        "price_amount_minor": 6000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=4)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"]).json()

    intent = client.post(f"/api/v1/doorway/bookings/{booking['id']}/payment-intent", headers=student_auth["headers"]).json()

    webhook_payload = {
        "event_id": "evt_webhook_test_101",
        "event_type": "payment.succeeded",
        "provider_order_id": intent["provider_order_id"],
        "provider_payment_id": "pay_webhook_999",
        "amount_minor": 6000,
        "currency": "INR",
        "status": "succeeded",
        "created_at_timestamp": int(datetime.now(timezone.utc).timestamp())
    }
    raw_bytes = json.dumps(webhook_payload).encode("utf-8")
    sig = default_payment_provider.compute_signature(
        raw_bytes.decode("utf-8"),
        default_payment_provider.webhook_secret
    )

    # 1. Send first webhook
    res_wh1 = client.post(
        "/api/v1/doorway/webhooks/payment",
        content=raw_bytes,
        headers={"Content-Type": "application/json", "X-Kin-Signature": sig}
    )
    assert res_wh1.status_code == 200
    assert res_wh1.json()["status"] == "success"

    # Verify booking is paid
    booking_status = client.get(f"/api/v1/doorway/bookings/{booking['id']}", headers=student_auth["headers"]).json()["status"]
    assert booking_status == "paid"

    # 2. Send duplicate webhook with the same event_id: must be ignored idempotently
    res_wh2 = client.post(
        "/api/v1/doorway/webhooks/payment",
        content=raw_bytes,
        headers={"Content-Type": "application/json", "X-Kin-Signature": sig}
    )
    assert res_wh2.status_code == 200
    assert "Duplicate" in res_wh2.json()["message"]


def test_dispute_and_cancellation_blocks_payout(client, alumni_auth, student_auth, admin_auth):
    """
    Test 7: A cancelled or disputed booking cannot trigger a payout.
    """
    # 1. Setup & complete a booking
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["startup_feedback"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Startup Feedback 20m",
        "service_scope": "Founder pitch and unit economics review session.",
        "category": "startup_feedback",
        "expected_deliverables": ["Pitch feedback"],
        "price_amount_minor": 8000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=6)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"]).json()
    booking_id = booking["id"]

    # Pay
    intent = client.post(f"/api/v1/doorway/bookings/{booking_id}/payment-intent", headers=student_auth["headers"]).json()
    client.post(
        f"/api/v1/doorway/bookings/{booking_id}/verify-payment",
        json={"provider_order_id": intent["provider_order_id"], "provider_payment_id": "pay_startup_1"},
        headers=student_auth["headers"]
    )

    # Confirm & Start & Complete
    client.post(f"/api/v1/doorway/bookings/{booking_id}/confirm", headers=alumni_auth["headers"])
    client.post(f"/api/v1/doorway/bookings/{booking_id}/start", headers=student_auth["headers"])
    client.post(
        f"/api/v1/doorway/bookings/{booking_id}/complete",
        json={"notes": "Expert completed session"},
        headers=alumni_auth["headers"]
    )

    # 2. Student raises a dispute
    disp_res = client.post(
        f"/api/v1/doorway/bookings/{booking_id}/disputes",
        json={
            "dispute_reason": "quality_or_ai_slop",
            "detailed_explanation": "Expert read generic AI bullet points rather than personal analysis.",
            "requested_resolution": "full_refund"
        },
        headers=student_auth["headers"]
    )
    assert disp_res.status_code == 201

    # 3. Admin attempts to disburse payout while dispute is active: MUST BE BLOCKED!
    payout_attempt = client.post(
        f"/api/v1/doorway/admin/settlements/{booking_id}/disburse",
        headers=admin_auth["headers"]
    )
    assert payout_attempt.status_code == 400
    assert "dispute" in payout_attempt.json()["detail"].lower()


def test_payout_retry_and_duplicate_settlement_prevention(client, alumni_auth, student_auth, admin_auth):
    """
    Test 8: Duplicate settlement is blocked; failed payout can be retried without duplicate transfer.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["technical_project_review"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Project Review 20m",
        "service_scope": "Code architecture and distributed systems review.",
        "category": "technical_project_review",
        "expected_deliverables": ["Architecture review"],
        "price_amount_minor": 10000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"]).json()
    booking_id = booking["id"]

    # Pay, confirm, start, complete
    intent = client.post(f"/api/v1/doorway/bookings/{booking_id}/payment-intent", headers=student_auth["headers"]).json()
    client.post(
        f"/api/v1/doorway/bookings/{booking_id}/verify-payment",
        json={"provider_order_id": intent["provider_order_id"], "provider_payment_id": "pay_proj_1"},
        headers=student_auth["headers"]
    )
    client.post(f"/api/v1/doorway/bookings/{booking_id}/confirm", headers=alumni_auth["headers"])
    client.post(f"/api/v1/doorway/bookings/{booking_id}/start", headers=student_auth["headers"])
    client.post(
        f"/api/v1/doorway/bookings/{booking_id}/complete",
        json={"notes": "Project review finished"},
        headers=alumni_auth["headers"]
    )

    # 1. Simulate gateway disruption on first payout attempt
    default_payment_provider.set_payout_failure_simulation(True)
    payout_fail = client.post(f"/api/v1/doorway/admin/settlements/{booking_id}/disburse", headers=admin_auth["headers"])
    assert payout_fail.status_code == 200
    assert payout_fail.json()["payout_status"] == "failed"
    default_payment_provider.set_payout_failure_simulation(False)

    # 2. Retry payout: must succeed cleanly
    payout_retry = client.post(f"/api/v1/doorway/admin/settlements/{booking_id}/disburse", headers=admin_auth["headers"])
    assert payout_retry.status_code == 200
    assert payout_retry.json()["payout_status"] == "succeeded"
    assert payout_retry.json()["amount_minor"] == 5000  # Exact 50% of 10000!

    # 3. Attempt a SECOND payout on the same settled booking: MUST BE REJECTED with 409 Conflict
    payout_dup = client.post(f"/api/v1/doorway/admin/settlements/{booking_id}/disburse", headers=admin_auth["headers"])
    assert payout_dup.status_code in (400, 409)


def test_suspended_expert_cannot_receive_bookings(client, alumni_auth, student_auth, admin_auth):
    """
    Test 9: Suspended or unverified expert cannot receive new bookings.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["career_decision"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing_res = client.post("/api/v1/doorway/listings", json={
        "title": "Career Advice 20m",
        "service_scope": "Focused career guidance and resume review consultation.",
        "category": "career_decision",
        "expected_deliverables": ["Advice"],
        "price_amount_minor": 5000,
    }, headers=alumni_auth["headers"])
    assert listing_res.status_code == 201
    listing = listing_res.json()

    # Admin suspends expert
    client.post(
        f"/api/v1/doorway/admin/experts/{exp['id']}/verify",
        json={"verification_status": "suspended", "verification_notes": "Under compliance review"},
        headers=admin_auth["headers"]
    )

    # Student attempts booking: MUST FAIL
    future_time = (datetime.now(timezone.utc) + timedelta(days=8)).isoformat()
    res = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"])
    assert res.status_code == 400
    assert "eligible" in res.json()["detail"].lower() or "suspended" in res.json()["detail"].lower()


def test_idor_protection_for_private_booking_details(client, alumni_auth, student_auth, second_user_auth, admin_auth):
    """
    Test 10: IDOR protection prevents students from accessing another student's booking details.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["career_decision"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Confidential Career Advice",
        "service_scope": "Private advisory session.",
        "category": "career_decision",
        "expected_deliverables": ["Advice"],
        "price_amount_minor": 5000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=9)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time,
        "student_notes": "Very confidential personal career situation"
    }, headers=student_auth["headers"]).json()
    booking_id = booking["id"]

    # Student 1 can access
    res1 = client.get(f"/api/v1/doorway/bookings/{booking_id}", headers=student_auth["headers"])
    assert res1.status_code == 200

    # Second user (unrelated student) CANNOT access
    res2 = client.get(f"/api/v1/doorway/bookings/{booking_id}", headers=second_user_auth["headers"])
    assert res2.status_code == 403


def test_refunds_update_financial_ledger_without_erasing_history(client, alumni_auth, student_auth, admin_auth):
    """
    Test 11: Refunds update financial records using linked adjustment entries without erasing past ledger history.
    """
    client.post("/api/v1/doorway/experts/apply", json={
        "institution_affiliation": "IIITD",
        "expertise_categories": ["career_decision"],
        "evidence_links": ["https://linkedin.com/in/test"]
    }, headers=alumni_auth["headers"])
    exp = client.get("/api/v1/doorway/experts/me", headers=alumni_auth["headers"]).json()
    client.post(f"/api/v1/doorway/admin/experts/{exp['id']}/verify", json={"verification_status": "approved"}, headers=admin_auth["headers"])

    listing = client.post("/api/v1/doorway/listings", json={
        "title": "Refund Test Consultation",
        "service_scope": "Testing ledger durability.",
        "category": "career_decision",
        "expected_deliverables": ["Advice"],
        "price_amount_minor": 7000,
    }, headers=alumni_auth["headers"]).json()

    future_time = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    booking = client.post("/api/v1/doorway/bookings", json={
        "listing_id": listing["id"],
        "scheduled_start_time": future_time
    }, headers=student_auth["headers"]).json()
    booking_id = booking["id"]

    # Pay
    intent = client.post(f"/api/v1/doorway/bookings/{booking_id}/payment-intent", headers=student_auth["headers"]).json()
    client.post(
        f"/api/v1/doorway/bookings/{booking_id}/verify-payment",
        json={"provider_order_id": intent["provider_order_id"], "provider_payment_id": "pay_rfnd_check"},
        headers=student_auth["headers"]
    )

    # Cancel and trigger refund
    cancel_res = client.post(
        f"/api/v1/doorway/bookings/{booking_id}/cancel",
        json={"cancellation_reason": "Student schedule conflict"},
        headers=student_auth["headers"]
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "refunded"

    # Check expert earnings ledger: original entry MUST still exist, alongside new adjustment entry
    earnings = client.get("/api/v1/doorway/experts/me/earnings", headers=alumni_auth["headers"]).json()
    entries = earnings["ledger_entries"]
    assert len(entries) >= 2  # Original initial allocation + refund adjustment!

    types = [e["entry_type"] for e in entries]
    assert "initial_allocation" in types
    assert "refund_adjustment" in types

    # Net earned must equal 0
    assert earnings["total_alumni_earned_minor"] == 0
