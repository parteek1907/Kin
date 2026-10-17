"""
Comprehensive test suite for the Kin Reputation Engine.
Tests all acceptance criteria, anti-abuse controls, idempotency,
reversals, authorization barriers, and inter-feature domain services.
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile, PlatformRole, ProfileVisibility
from app.features.kin_reputation.models import (
    KinPointsPolicy,
    KinReputationSummary,
    KinLedgerEntry,
    KinAbuseAuditLog,
    ContributionEventType,
    VerificationStatus,
    ReputationTier,
)
from app.features.kin_reputation.service import KinReputationService
from app.features.kin_reputation.repository import KinReputationRepository


@pytest.fixture
def faculty_auth(client):
    """Registers and authenticates a test faculty/admin user."""
    reg_data = {
        "email": "dean.faculty@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Prof. Vikram Sarabhai",
        "role": "Faculty",
        "headline": "Distinguished Professor of Computer Science",
        "skills": ["Algorithms", "Distributed Systems"],
        "industry": "Higher Education"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "dean.faculty@iiitd.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": "dean.faculty@iiitd.ac.in"
    }


# =============================================================================
# 1. Verification & Policy Tests
# =============================================================================

def test_list_active_policies(client, student_auth):
    """Test retrieving active contribution points policies."""
    res = client.get("/api/v1/reputation/policies")
    assert res.status_code == 200
    policies = res.json()
    assert len(policies) >= 8
    event_types = [p["event_type"] for p in policies]
    assert "mentoring_session" in event_types
    assert "portfolio_feedback" in event_types
    assert "mock_interview" in event_types
    assert "wisdom_capsule" in event_types
    assert "twenty_minute_doorway" in event_types


def test_valid_verified_event_awards_configured_points(client, faculty_auth, alumni_auth, student_auth):
    """Test that a verified event awards the exact configured points to the member."""
    payload = {
        "user_id": alumni_auth["user_id"],
        "event_type": "mentoring_session",
        "source_reference": "session:test-award-101",
        "counterparty_user_id": student_auth["user_id"],
        "quality_score": 4.5,
        "metadata_payload": {"session_type": "1-on-1 career pathing"}
    }
    res = client.post("/api/v1/reputation/events", json=payload, headers=faculty_auth["headers"])
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["points_awarded"] == 35  # mentoring_session default base points
    assert data["new_current_points"] == 35
    assert data["new_tier"] == "Bronze"

    # Verify summary endpoint reflects the update
    me_res = client.get("/api/v1/reputation/me", headers=alumni_auth["headers"])
    assert me_res.status_code == 200
    summary = me_res.json()
    assert summary["current_points"] == 35
    assert summary["lifetime_points"] == 35
    assert summary["verified_contributions_count"] == 1
    assert summary["category_breakdown"]["mentoring_session"] == 35


def test_idempotent_event_processing(client, faculty_auth, alumni_auth, student_auth):
    """Test that replaying the exact same event does NOT award duplicate points."""
    payload = {
        "user_id": alumni_auth["user_id"],
        "event_type": "portfolio_feedback",
        "source_reference": "feedback:idempotent-test-202",
        "idempotency_key": "idemp-key-unique-999",
        "counterparty_user_id": student_auth["user_id"],
        "quality_score": 4.0,
    }

    # First request
    res1 = client.post("/api/v1/reputation/events", json=payload, headers=faculty_auth["headers"])
    assert res1.status_code == 201
    t1_id = res1.json()["transaction_id"]
    p1 = res1.json()["new_current_points"]

    # Replay identical request
    res2 = client.post("/api/v1/reputation/events", json=payload, headers=faculty_auth["headers"])
    assert res2.status_code == 201
    t2_id = res2.json()["transaction_id"]
    p2 = res2.json()["new_current_points"]

    assert t1_id == t2_id  # Returns existing transaction
    assert p1 == p2        # No points increase


# =============================================================================
# 2. Authorization & Security Barrier Tests
# =============================================================================

def test_ordinary_users_cannot_award_points(client, student_auth, alumni_auth):
    """Test that ordinary students/alumni cannot self-award or award points to others (403 Forbidden)."""
    payload = {
        "user_id": student_auth["user_id"],
        "event_type": "wisdom_capsule",
        "source_reference": "capsule:hack-exploit",
    }
    # Student attempts to award points
    res = client.post("/api/v1/reputation/events", json=payload, headers=student_auth["headers"])
    assert res.status_code == 403
    assert "Unauthorized" in res.json()["detail"]

    # Alumni attempts to award points
    res2 = client.post("/api/v1/reputation/events", json=payload, headers=alumni_auth["headers"])
    assert res2.status_code == 403


def test_internal_service_key_authorization(client, alumni_auth, student_auth):
    """Test that trusted backend workflows can authenticate via X-Internal-Service-Key."""
    payload = {
        "user_id": alumni_auth["user_id"],
        "event_type": "wisdom_capsule",
        "source_reference": "capsule:trusted-internal-auth",
        "quality_score": 4.8,
    }
    headers = {"X-Internal-Service-Key": settings.SECRET_KEY}
    res = client.post("/api/v1/reputation/events", json=payload, headers=headers)
    assert res.status_code == 201
    assert res.json()["success"] is True
    assert res.json()["points_awarded"] == 30


def test_unauthorized_policy_modification_rejected(client, student_auth):
    """Test that non-admin/faculty members cannot modify points policies."""
    payload = {
        "event_type": "mentoring_session",
        "display_name": "Exploited Mentoring",
        "base_points": 500,
        "daily_cap": 1000,
        "cooldown_seconds": 0,
    }
    res = client.post("/api/v1/reputation/admin/policies", json=payload, headers=student_auth["headers"])
    assert res.status_code == 403


# =============================================================================
# 3. Anti-Abuse Controls Tests
# =============================================================================

def test_self_reward_rejected(client, faculty_auth, alumni_auth):
    """Test that self-rewarding as counterparty is rejected with 400 Bad Request."""
    payload = {
        "user_id": alumni_auth["user_id"],
        "event_type": "mentoring_session",
        "source_reference": "session:self-reward-attempt",
        "counterparty_user_id": alumni_auth["user_id"],  # Same user!
        "quality_score": 5.0,
    }
    res = client.post("/api/v1/reputation/events", json=payload, headers=faculty_auth["headers"])
    assert res.status_code == 400
    assert "Self-awarding is prohibited" in res.json()["detail"]


def test_daily_cap_enforcement(client, faculty_auth, alumni_auth, student_auth, db):
    """Test that points exceeding the daily cap for a category are rejected."""
    policy = KinPointsPolicy(
        event_type="cap_test_category",
        display_name="Cap Test Category",
        base_points=30,
        daily_cap=50,
        cooldown_seconds=0,
        requires_counterparty=False,
        requires_verification=False,
        is_active=True,
    )
    db.add(policy)
    db.commit()

    # Event 1: 30 pts (30 <= 50 cap)
    res1 = client.post("/api/v1/reputation/events", json={
        "user_id": alumni_auth["user_id"],
        "event_type": "cap_test_category",
        "source_reference": "cap_test:event-1",
    }, headers=faculty_auth["headers"])
    assert res1.status_code == 201

    # Event 2: 30 pts (30 + 30 = 60 > 50 cap -> 400 Bad Request)
    res2 = client.post("/api/v1/reputation/events", json={
        "user_id": alumni_auth["user_id"],
        "event_type": "cap_test_category",
        "source_reference": "cap_test:event-2",
    }, headers=faculty_auth["headers"])
    assert res2.status_code == 400
    assert "Daily point cap of 50 exceeded" in res2.json()["detail"]


def test_reciprocal_farming_anomaly_detection(db, alumni_auth, student_auth):
    """Test detecting circular collusion between two members exchanging rewards."""
    policy = KinPointsPolicy(
        event_type="reciprocal_test_category",
        display_name="Reciprocal Test Category",
        base_points=10,
        daily_cap=500,
        cooldown_seconds=0,
        requires_counterparty=True,
        requires_verification=False,
        is_active=True,
    )
    db.add(policy)
    db.commit()

    user_a = alumni_auth["user_id"]
    user_b = student_auth["user_id"]

    for i in range(4):
        entry = KinLedgerEntry(
            user_id=user_a if i % 2 == 0 else user_b,
            counterparty_user_id=user_b if i % 2 == 0 else user_a,
            event_type="reciprocal_test_category",
            source_reference=f"reciprocal:test-{i}",
            idempotency_key=f"recip-key-{i}",
            points=10,
            verification_status="verified",
            created_at=datetime.now(timezone.utc) - timedelta(hours=i + 1)
        )
        db.add(entry)
    db.commit()

    # Attempting a 5th mutual transaction triggers reciprocal threshold
    with pytest.raises(Exception) as excinfo:
        KinReputationService.record_verified_contribution(
            db=db,
            user_id=user_a,
            event_type="reciprocal_test_category",
            source_reference="reciprocal:collusion-5",
            counterparty_user_id=user_b
        )
    assert "Reciprocal interaction threshold exceeded" in str(excinfo.value)



# =============================================================================
# 4. Reversal & Audit Trail Tests
# =============================================================================

def test_reversal_preserves_audit_history_and_adjusts_balance(client, faculty_auth, alumni_auth, student_auth):
    """Test reversing an awarded transaction: negative linked entry created, history preserved."""
    # 1. Award points
    award_res = client.post("/api/v1/reputation/events", json={
        "user_id": alumni_auth["user_id"],
        "event_type": "twenty_minute_doorway",
        "source_reference": "doorway:reversal-target-303",
        "counterparty_user_id": student_auth["user_id"],
        "quality_score": 4.5,
    }, headers=faculty_auth["headers"])
    assert award_res.status_code == 201
    entry_id = award_res.json()["transaction_id"]
    points_awarded = award_res.json()["points_awarded"]

    # 2. Reverse points via privileged endpoint
    rev_payload = {
        "entry_id": entry_id,
        "reason": "Student reported host did not attend scheduled session",
        "dispute_reference": "TICKET-DISPUTE-881"
    }
    rev_res = client.post("/api/v1/reputation/reversals", json=rev_payload, headers=faculty_auth["headers"])
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["success"] is True
    assert rev_data["points_awarded"] == -points_awarded

    # 3. Check history retains both the original and reversal entry
    hist_res = client.get("/api/v1/reputation/history", headers=alumni_auth["headers"])
    assert hist_res.status_code == 200
    entries = hist_res.json()["items"]
    # Look for original and reversal
    orig_entry = next((e for e in entries if e["id"] == entry_id), None)
    assert orig_entry is not None
    assert orig_entry["verification_status"] == "reversed"

    reversal_entry = next((e for e in entries if e["reversal_of_entry_id"] == entry_id), None)
    assert reversal_entry is not None
    assert reversal_entry["points"] == -points_awarded


def test_cannot_reverse_already_reversed_entry(client, faculty_auth, alumni_auth, student_auth):
    """Test that double-reversing the same transaction returns 400 Bad Request."""
    award_res = client.post("/api/v1/reputation/events", json={
        "user_id": alumni_auth["user_id"],
        "event_type": "community_answer",
        "source_reference": "answer:double-rev-target",
    }, headers=faculty_auth["headers"])
    entry_id = award_res.json()["transaction_id"]

    # First reversal
    client.post("/api/v1/reputation/reversals", json={
        "entry_id": entry_id,
        "reason": "Plagiarized answer detected",
    }, headers=faculty_auth["headers"])

    # Second reversal attempt
    res = client.post("/api/v1/reputation/reversals", json={
        "entry_id": entry_id,
        "reason": "Duplicate reversal request",
    }, headers=faculty_auth["headers"])
    assert res.status_code == 400
    assert "already been reversed" in res.json()["detail"]


# =============================================================================
# 5. Leaderboard, Breakdown & Profile Privacy Tests
# =============================================================================

def test_community_leaderboard_rolling_windows(client, faculty_auth, alumni_auth, student_auth):
    """Test leaderboard with lifetime and rolling 30d/90d windows."""
    # Seed a verified event
    client.post("/api/v1/reputation/events", json={
        "user_id": alumni_auth["user_id"],
        "event_type": "wisdom_capsule",
        "source_reference": "capsule:leaderboard-test-item",
        "quality_score": 5.0,
    }, headers=faculty_auth["headers"])

    res_lifetime = client.get("/api/v1/reputation/leaderboard?window=lifetime")
    assert res_lifetime.status_code == 200
    data_life = res_lifetime.json()
    assert data_life["window"] == "lifetime"
    assert len(data_life["items"]) >= 1

    res_30d = client.get("/api/v1/reputation/leaderboard?window=30d")
    assert res_30d.status_code == 200
    assert res_30d.json()["window"] == "30d"


def test_contribution_breakdown_endpoint(client, faculty_auth, alumni_auth):
    """Test retrieving the member's category breakdown."""
    res = client.get("/api/v1/reputation/breakdown", headers=alumni_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert "current_points" in data
    assert "categories" in data
    assert isinstance(data["categories"], list)


def test_public_reputation_respects_visibility_rules(client, alumni_auth, second_user_auth, db):
    """Test public profile reputation card respects visibility (public vs private)."""
    # 1. Public user
    res1 = client.get(f"/api/v1/reputation/users/{alumni_auth['user_id']}")
    assert res1.status_code == 200
    card = res1.json()
    assert card["user_id"] == alumni_auth["user_id"]
    assert "current_points" in card
    assert "tier" in card
    # Ensure no internal fields are leaked
    assert "metadata_payload" not in card
    assert "dispute_reference" not in card

    # 2. Make second_user private
    profile = db.query(Profile).filter(Profile.user_id == second_user_auth["user_id"]).first()
    profile.visibility = ProfileVisibility.PRIVATE.value
    db.commit()

    # Anonymous attempt to view private user
    res2 = client.get(f"/api/v1/reputation/users/{second_user_auth['user_id']}")
    assert res2.status_code == 403
    assert "private" in res2.json()["detail"]


# =============================================================================
# 6. Inter-Feature Domain Integration Services Tests
# =============================================================================

def test_inter_feature_domain_helpers(db, alumni_auth, student_auth):
    """Test domain helper methods callable by other backend modules."""
    user_a = alumni_auth["user_id"]
    user_b = student_auth["user_id"]

    # 1. Mentoring session helper (fails if < 15 min)
    with pytest.raises(Exception):
        KinReputationService.record_mentoring_session(
            db=db,
            mentor_user_id=user_a,
            mentee_user_id=user_b,
            session_id="short-session",
            duration_minutes=10
        )

    # 2. Mentoring session helper (succeeds if >= 15 min)
    entry, summary = KinReputationService.record_mentoring_session(
        db=db,
        mentor_user_id=user_a,
        mentee_user_id=user_b,
        session_id="valid-session-45m",
        duration_minutes=45,
        feedback_score=4.8
    )
    assert entry.points == 35
    assert summary.current_points >= 35

    # 3. Portfolio feedback helper (fails if < 50 chars)
    with pytest.raises(Exception):
        KinReputationService.record_portfolio_feedback(
            db=db,
            reviewer_user_id=user_a,
            student_user_id=user_b,
            review_id="short-rev",
            review_length=20
        )

    # 4. Wisdom capsule helper (succeeds if approved)
    cap_entry, cap_summary = KinReputationService.record_wisdom_capsule(
        db=db,
        author_user_id=user_a,
        capsule_id="capsule-distributed-systems",
        approved=True,
        quality_rating=4.9
    )
    assert cap_entry.points == 30

    # 5. Successful introduction helper
    intro_entry, _ = KinReputationService.record_successful_introduction(
        db=db,
        connector_user_id=user_a,
        recipient_user_id=user_b,
        introduction_id="intro-google-ai",
        accepted=True
    )
    assert intro_entry.points == 25
