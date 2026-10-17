"""
Comprehensive test suite for Kin Ghost Mode.
Verifies premium entitlement gates, identity isolation, IDOR protections,
moderation workflows, audited identity resolution, and feed privacy.
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.models.profile import Profile, PlatformRole
from app.features.ghost_mode.models import (
    GhostEntitlement,
    GhostPersona,
    GhostIdentityMapping,
    GhostPost,
    GhostReply,
    GhostReport,
    GhostAuditLog,
    EntitlementStatus,
    ContentStatus,
    ReportStatus,
)
from app.features.ghost_mode.repository import GhostModeRepository
from app.features.ghost_mode.service import GhostModeService


@pytest.fixture
def faculty_auth(client):
    """Registers and authenticates a test faculty/admin user."""
    reg_data = {
        "email": "dean.privacy@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Prof. Homi Bhabha",
        "role": "Faculty",
        "headline": "Dean of Academic Safety",
        "skills": ["Information Security", "Ethics"],
        "industry": "Higher Education"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "dean.privacy@iiitd.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": "dean.privacy@iiitd.ac.in"
    }


# =============================================================================
# 1. Entitlement Gates & Expiry Tests
# =============================================================================

def test_unentitled_user_cannot_create_ghost_post(client, student_auth):
    """Test that a free user without Ghost Mode entitlement cannot create a post (403 Forbidden)."""
    # 1. Check entitlement status shows can_post = False
    status_res = client.get("/api/v1/ghost/entitlement", headers=student_auth["headers"])
    assert status_res.status_code == 200
    assert status_res.json()["can_post"] is False
    assert status_res.json()["is_entitled"] is False

    # 2. Attempt to publish ghost post
    post_payload = {
        "title": "Struggling with salary negotiation at unicorn startup",
        "content": "Received an offer of 24 LPA but recruiter says take it or leave it in 24 hours.",
        "category": "salary_negotiation"
    }
    post_res = client.post("/api/v1/ghost/posts", json=post_payload, headers=student_auth["headers"])
    assert post_res.status_code == 403
    assert "Active Ghost Mode premium entitlement required" in post_res.json()["detail"]


def test_entitlement_activation_enables_posting(client, student_auth):
    """Test activating a Ghost Mode pass allows publishing discussions and replies."""
    # Activate pass
    act_res = client.post("/api/v1/ghost/entitlement/activate", json={
        "plan_type": "ghost_monthly",
        "duration_days": 30,
        "payment_reference": "PAY-REF-TX990"
    }, headers=student_auth["headers"])
    assert act_res.status_code == 200
    assert act_res.json()["can_post"] is True
    assert act_res.json()["is_entitled"] is True

    # Now publishing succeeds
    post_payload = {
        "title": "Facing unexpected burnout after series A crunch",
        "content": "Working 70+ hour weeks for 6 months. How do senior engineers set firm boundaries?",
        "category": "workplace_challenges"
    }
    post_res = client.post("/api/v1/ghost/posts", json=post_payload, headers=student_auth["headers"])
    assert post_res.status_code == 201
    post_data = post_res.json()
    assert post_data["title"] == post_payload["title"]
    assert "author" in post_data
    assert "persona_handle" in post_data["author"]
    assert "pseudonym" in post_data["author"]


def test_expired_entitlement_policy(client, student_auth, db):
    """
    Test expired entitlement: cannot create new posts or replies,
    but existing published posts remain intact and accessible.
    """
    # 1. Ensure user has an existing post
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=student_auth["headers"])
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Navigating layoff rumors as a junior dev",
        "content": "Multiple projects were cancelled this week and leadership has gone silent.",
        "category": "rejection_and_layoffs"
    }, headers=student_auth["headers"])
    post_id = post_res.json()["id"]

    # 2. Simulate entitlement expiration
    entitlement = db.query(GhostEntitlement).filter(GhostEntitlement.user_id == student_auth["user_id"]).first()
    entitlement.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    db.commit()

    # 3. Verify status shows expired and can_post = False
    status_res = client.get("/api/v1/ghost/entitlement", headers=student_auth["headers"])
    assert status_res.status_code == 200
    assert status_res.json()["can_post"] is False

    # 4. Attempting new post fails with 403
    fail_post = client.post("/api/v1/ghost/posts", json={
        "title": "Another new question post",
        "content": "This should be blocked due to expired pass.",
        "category": "general_anonymous"
    }, headers=student_auth["headers"])
    assert fail_post.status_code == 403

    # 5. Existing post remains published and readable
    view_res = client.get(f"/api/v1/ghost/posts/{post_id}", headers=student_auth["headers"])
    assert view_res.status_code == 200
    assert view_res.json()["id"] == post_id
    assert view_res.json()["status"] == "published"


# =============================================================================
# 2. Identity Separation & Leak Prevention Tests
# =============================================================================

def test_public_responses_never_expose_account_identity(client, alumni_auth, student_auth):
    """
    Test that public list and detail endpoints strictly omit:
    real user_id, real email, real name, profile URL, or personal metadata.
    """
    # Alumni creates post
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    create_res = client.post("/api/v1/ghost/posts", json={
        "title": "Considering leaving FAANG for early stage AI startup",
        "content": "Comp would drop 40% but equity is substantial. Has anyone made this leap recently?",
        "category": "career_pivot"
    }, headers=alumni_auth["headers"])
    post_id = create_res.json()["id"]

    # Student views the post publicly
    view_res = client.get(f"/api/v1/ghost/posts/{post_id}", headers=student_auth["headers"])
    assert view_res.status_code == 200
    data = view_res.json()

    # Verify no leaks of user_id or real identity
    author = data["author"]
    assert "user_id" not in author
    assert "email" not in author
    assert "full_name" not in author
    assert alumni_auth["email"] not in str(data)
    assert "Priya Nair" not in str(data)  # Alumni real name
    assert str(alumni_auth["user_id"]) != author["persona_handle"]

    # Verify feeds do not leak
    list_res = client.get("/api/v1/ghost/posts", headers=student_auth["headers"])
    assert list_res.status_code == 200
    assert alumni_auth["email"] not in str(list_res.json())


def test_persona_rotation_generates_fresh_pseudonym(client, alumni_auth):
    """Test rotating the pseudonymous persona creates an unlinked new handle."""
    persona_1 = client.get("/api/v1/ghost/persona/me", headers=alumni_auth["headers"]).json()

    # Regenerate persona
    regen_res = client.post("/api/v1/ghost/persona/regenerate", headers=alumni_auth["headers"])
    assert regen_res.status_code == 200
    persona_2 = regen_res.json()

    assert persona_1["persona_handle"] != persona_2["persona_handle"]
    assert persona_1["id"] != persona_2["id"]


# =============================================================================
# 3. IDOR & Content Ownership Tests
# =============================================================================

def test_user_cannot_edit_or_delete_other_user_ghost_post(client, alumni_auth, student_auth):
    """Test that User B cannot edit or delete User A's post by tampering with post_id (IDOR protection)."""
    # Alumni creates post
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Strictly confidential executive interview debrief",
        "content": "Discussing VP of Engineering interview questions and architecture rounds.",
        "category": "career_pivot"
    }, headers=alumni_auth["headers"])
    post_id = post_res.json()["id"]

    # Student attempts to edit Alumni's post
    edit_res = client.patch(f"/api/v1/ghost/posts/{post_id}", json={
        "title": "Hacked Title By Attacker"
    }, headers=student_auth["headers"])
    assert edit_res.status_code == 403
    assert "You do not own this pseudonymous content" in edit_res.json()["detail"]

    # Student attempts to delete Alumni's post
    del_res = client.delete(f"/api/v1/ghost/posts/{post_id}", headers=student_auth["headers"])
    assert del_res.status_code == 403


def test_author_can_edit_and_delete_own_ghost_post(client, alumni_auth):
    """Test author can edit and soft-delete their own discussion thread."""
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Original Post Title for Edit Test",
        "content": "Original content detailing sensitive career experiences.",
        "category": "sensitive_advice"
    }, headers=alumni_auth["headers"])
    post_id = post_res.json()["id"]

    # Edit
    edit_res = client.patch(f"/api/v1/ghost/posts/{post_id}", json={
        "title": "Updated Post Title After Revision"
    }, headers=alumni_auth["headers"])
    assert edit_res.status_code == 200
    assert edit_res.json()["title"] == "Updated Post Title After Revision"

    # Delete
    del_res = client.delete(f"/api/v1/ghost/posts/{post_id}", headers=alumni_auth["headers"])
    assert del_res.status_code == 204

    # Post is no longer returned in active detail
    view_res = client.get(f"/api/v1/ghost/posts/{post_id}", headers=alumni_auth["headers"])
    assert view_res.status_code == 404


# =============================================================================
# 4. Threaded Replies, Reactions & Muting Tests
# =============================================================================

def test_threaded_replies_and_reactions(client, alumni_auth, student_auth):
    """Test publishing threaded replies under pseudonym and toggling sentiment reactions."""
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=student_auth["headers"])

    # 1. Post
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "How to handle pip at major tech company?",
        "content": "Received unexpected performance plan despite positive peer reviews.",
        "category": "workplace_challenges"
    }, headers=alumni_auth["headers"])
    post_id = post_res.json()["id"]

    # 2. Reply from student under pseudonym
    reply_res = client.post(f"/api/v1/ghost/posts/{post_id}/replies", json={
        "content": "Consult an employment lawyer immediately and document everything in writing."
    }, headers=student_auth["headers"])
    assert reply_res.status_code == 201
    reply_data = reply_res.json()
    assert reply_data["content"].startswith("Consult an employment lawyer")
    assert "author" in reply_data
    # Ensure student identity is protected
    assert student_auth["email"] not in str(reply_data)

    # 3. Toggle reaction on post
    react_res = client.post("/api/v1/ghost/reactions", json={
        "target_type": "post",
        "target_id": post_id,
        "reaction_type": "supportive"
    }, headers=student_auth["headers"])
    assert react_res.status_code == 200
    assert react_res.json()["active"] is True


def test_persona_muting_filters_feed(client, alumni_auth, student_auth):
    """Test that locally muting a persona hides their posts and replies from the muter's feed."""
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=student_auth["headers"])

    # Alumni posts
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Annoying spammy hot-take discussion",
        "content": "Content from an author that someone wants to mute locally.",
        "category": "general_anonymous"
    }, headers=alumni_auth["headers"])
    post_id = post_res.json()["id"]
    author_handle = post_res.json()["author"]["persona_handle"]

    # Student mutes the alumni's persona
    mute_res = client.post("/api/v1/ghost/mutes", json={
        "target_persona_handle": author_handle
    }, headers=student_auth["headers"])
    assert mute_res.status_code == 200
    assert mute_res.json()["success"] is True

    # Student lists posts: muted author's post is excluded!
    feed_res = client.get("/api/v1/ghost/posts", headers=student_auth["headers"])
    assert feed_res.status_code == 200
    post_ids = [p["id"] for p in feed_res.json()["items"]]
    assert post_id not in post_ids


# =============================================================================
# 5. Abuse Reporting & Audited Moderation Tests
# =============================================================================

def test_report_abuse_and_moderator_action(client, alumni_auth, student_auth, faculty_auth):
    """Test filing an abuse report and moderator taking action to hide harmful content."""
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])

    # 1. Post harmful content
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Defamatory discussion with personal attacks",
        "content": "Harmful content that violates community safety policies.",
        "category": "workplace_challenges"
    }, headers=alumni_auth["headers"])
    post_id = post_res.json()["id"]

    # 2. Student reports it
    report_res = client.post("/api/v1/ghost/reports", json={
        "target_type": "post",
        "target_id": post_id,
        "reason_category": "harassment",
        "explanation": "Contains targeted harassment and defamatory accusations."
    }, headers=student_auth["headers"])
    assert report_res.status_code == 201
    assert report_res.json()["status"] == "pending"

    # 3. Non-moderator cannot inspect reports
    unauth_reports = client.get("/api/v1/ghost/moderation/reports", headers=student_auth["headers"])
    assert unauth_reports.status_code == 403

    # 4. Moderator inspects reports
    mod_reports = client.get("/api/v1/ghost/moderation/reports", headers=faculty_auth["headers"])
    assert mod_reports.status_code == 200
    assert len(mod_reports.json()) >= 1

    # 5. Moderator hides the post
    hide_res = client.post("/api/v1/ghost/moderation/action", json={
        "target_type": "post",
        "target_id": post_id,
        "action": "hide",
        "moderator_notes": "Hidden due to verified policy violation"
    }, headers=faculty_auth["headers"])
    assert hide_res.status_code == 200
    assert hide_res.json()["status"] == "hidden"


def test_audited_identity_reveal_operation(client, alumni_auth, student_auth, faculty_auth, db):
    """
    Test emergency identity resolution:
    - Ordinary users cannot call identity reveal (403 Forbidden).
    - Faculty/moderator can reveal identity with documented audit reason.
    - Mandatory audit record is written to ghost_audit_logs.
    """
    client.post("/api/v1/ghost/entitlement/activate", json={"duration_days": 30}, headers=alumni_auth["headers"])
    post_res = client.post("/api/v1/ghost/posts", json={
        "title": "Serious incident report discussion",
        "content": "Emergency safety situation requiring legal compliance resolution.",
        "category": "ethical_dilemma"
    }, headers=alumni_auth["headers"])
    author_handle = post_res.json()["author"]["persona_handle"]

    # 1. Ordinary student attempts identity reveal (403 Forbidden)
    student_reveal = client.post("/api/v1/ghost/moderation/reveal-identity", json={
        "persona_handle": author_handle,
        "audit_reason": "I want to know who wrote this post"
    }, headers=student_auth["headers"])
    assert student_reveal.status_code == 403

    # 2. Moderator performs authorized reveal with documented legal/safety reason
    mod_reveal = client.post("/api/v1/ghost/moderation/reveal-identity", json={
        "persona_handle": author_handle,
        "audit_reason": "Investigating credible harassment complaint with campus security escalation",
        "incident_ticket": "CASE-SAFETY-7721"
    }, headers=faculty_auth["headers"])
    assert mod_reveal.status_code == 200
    reveal_data = mod_reveal.json()
    assert reveal_data["revealed_user_id"] == alumni_auth["user_id"]
    assert reveal_data["revealed_user_email"] == alumni_auth["email"]
    assert "audit_log_id" in reveal_data

    # 3. Verify audit log entry exists in database
    audit_entry = db.query(GhostAuditLog).filter(GhostAuditLog.id == reveal_data["audit_log_id"]).first()
    assert audit_entry is not None
    assert audit_entry.moderator_user_id == faculty_auth["user_id"]
    assert audit_entry.resolved_user_id == alumni_auth["user_id"]
    assert "campus security escalation" in audit_entry.audit_reason
