import pytest
from datetime import datetime, timezone, timedelta
from fastapi import status
from fastapi.testclient import TestClient

from app.features.mock_interviews.models import VerificationStatus, SessionStatus


@pytest.fixture
def student_auth_headers(student_auth):
    return student_auth["headers"]


@pytest.fixture
def alumni_auth_headers(alumni_auth):
    return alumni_auth["headers"]


@pytest.fixture
def faculty_auth_headers(client: TestClient):
    client.post("/api/v1/auth/register", json={
        "email": "faculty.board@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Faculty Board Member",
        "role": "Faculty",
        "institution": "IIIT Delhi",
        "department": "Computer Science"
    })
    fac_login = client.post("/api/v1/auth/login", json={
        "email": "faculty.board@iiitd.ac.in",
        "password": "Password123!"
    })
    token = fac_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_interviewer_application_and_verification_flow(client: TestClient, alumni_auth_headers: dict, student_auth_headers: dict, faculty_auth_headers: dict):
    # 1. Alumnus applies to be an interviewer
    apply_payload = {
        "institution_affiliation": "IIIT Delhi",
        "headline": "Senior Staff Engineer @ Google | Distributed Systems",
        "bio": "Mentoring students in backend engineering, distributed systems, and systems design.",
        "current_company": "Google",
        "job_title": "Senior Staff Engineer",
        "years_of_experience": 8.5,
        "primary_domain": "Distributed Systems",
        "categories": ["technical_fundamentals", "coding_problem_solving", "role_specific"],
        "evidence_links": ["https://linkedin.com/in/test-alumnus", "https://github.com/test-alumnus"],
        "available_slots": ["2026-10-20T14:00:00Z", "2026-10-21T16:00:00Z"],
        "preferred_capsule_duration_seconds": 90
    }
    r = client.post("/api/v1/mock-interviews/interviewers/apply", json=apply_payload, headers=alumni_auth_headers)
    assert r.status_code == status.HTTP_201_CREATED
    data = r.json()
    profile_id = data["id"]
    assert data["verification_status"] == VerificationStatus.PENDING.value
    assert data["institution_affiliation"] == "IIIT Delhi"
    assert "technical_fundamentals" in data["categories"]

    # 2. Acceptance Test 1: Unverified alumnus cannot advertise as approved interviewer
    search_r = client.get("/api/v1/mock-interviews/interviewers")
    assert search_r.status_code == status.HTTP_200_OK
    assert all(i["id"] != profile_id for i in search_r.json()["items"])

    # 3. Acceptance Test 2: Student cannot approve/verify interviewer (403 Forbidden)
    student_verify_r = client.patch(
        f"/api/v1/mock-interviews/interviewers/{profile_id}/verify",
        json={"status": "approved", "verification_notes": "Fake student approval"},
        headers=student_auth_headers
    )
    assert student_verify_r.status_code == status.HTTP_403_FORBIDDEN

    # 4. Faculty / Admin approves the interviewer
    approve_r = client.patch(
        f"/api/v1/mock-interviews/interviewers/{profile_id}/verify",
        json={"status": "approved", "verification_notes": "Credentials and alumni status verified via campus registrar records."},
        headers=faculty_auth_headers
    )
    assert approve_r.status_code == status.HTTP_200_OK
    assert approve_r.json()["verification_status"] == VerificationStatus.APPROVED.value

    # 5. Now approved interviewer appears in public search
    search_approved = client.get("/api/v1/mock-interviews/interviewers?domain=Distributed%20Systems")
    assert search_approved.status_code == status.HTTP_200_OK
    assert any(i["id"] == profile_id for i in search_approved.json()["items"])


def test_session_lifecycle_and_state_machine(client: TestClient, student_auth_headers: dict, alumni_auth_headers: dict, faculty_auth_headers: dict):
    # Setup approved interviewer
    alumni_me = client.get("/api/v1/auth/me", headers=alumni_auth_headers).json()
    alumni_user_id = alumni_me["id"]

    client.post("/api/v1/mock-interviews/interviewers/apply", json={
        "institution_affiliation": "IIIT Delhi",
        "primary_domain": "Backend Systems",
        "categories": ["technical_fundamentals"],
        "evidence_links": ["https://linkedin.com/in/alumnus"]
    }, headers=alumni_auth_headers)

    interviewer_prof = client.get("/api/v1/mock-interviews/interviewers/me", headers=alumni_auth_headers).json()
    prof_id = interviewer_prof["id"]

    client.patch(
        f"/api/v1/mock-interviews/interviewers/{prof_id}/verify",
        json={"status": "approved", "verification_notes": "Approved for testing"},
        headers=faculty_auth_headers
    )

    # 1. Acceptance Test 6: Self-interview prevention
    self_r = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_user_id,
        "interview_category": "technical_fundamentals",
        "target_role": "Backend Engineer"
    }, headers=alumni_auth_headers)
    assert self_r.status_code == status.HTTP_400_BAD_REQUEST

    # 2. Student requests session
    req_r = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_user_id,
        "interview_category": "technical_fundamentals",
        "target_role": "Backend Engineer",
        "experience_level": "entry_level",
        "student_note": "Want to practice distributed lock concepts",
        "recording_consent": True
    }, headers=student_auth_headers)
    assert req_r.status_code == status.HTTP_201_CREATED
    session = req_r.json()
    session_id = session["id"]
    assert session["status"] == SessionStatus.REQUESTED.value
    assert session["recording_consent"] is True

    # 3. Acceptance Test 5: Prevent duplicate pending session
    dup_r = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_user_id,
        "interview_category": "technical_fundamentals",
        "target_role": "Backend Engineer"
    }, headers=student_auth_headers)
    assert dup_r.status_code == status.HTTP_409_CONFLICT

    # 4. Acceptance Test 4: Invalid state transition (cannot skip from REQUESTED to COMPLETED)
    skip_complete_r = client.post(f"/api/v1/mock-interviews/sessions/{session_id}/complete", headers=alumni_auth_headers)
    assert skip_complete_r.status_code == status.HTTP_400_BAD_REQUEST

    # 5. Interviewer accepts request
    accept_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/respond",
        json={"action": "accept"},
        headers=alumni_auth_headers
    )
    assert accept_r.status_code == status.HTTP_200_OK
    assert accept_r.json()["status"] == SessionStatus.ACCEPTED.value

    # 6. Schedule session
    sched_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    sched_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/schedule",
        json={"scheduled_at": sched_time, "session_format": "virtual_capsule"},
        headers=student_auth_headers
    )
    assert sched_r.status_code == status.HTTP_200_OK
    assert sched_r.json()["status"] == SessionStatus.SCHEDULED.value

    # 7. Start session -> IN_PROGRESS
    start_r = client.post(f"/api/v1/mock-interviews/sessions/{session_id}/start", headers=alumni_auth_headers)
    assert start_r.status_code == status.HTTP_200_OK
    assert start_r.json()["status"] == SessionStatus.IN_PROGRESS.value
    assert start_r.json()["started_at"] is not None

    # 8. Complete session -> COMPLETED
    comp_r = client.post(f"/api/v1/mock-interviews/sessions/{session_id}/complete", headers=alumni_auth_headers)
    assert comp_r.status_code == status.HTTP_200_OK
    assert comp_r.json()["status"] == SessionStatus.COMPLETED.value
    assert comp_r.json()["completed_at"] is not None

    # 9. Acceptance Test 7: Student cannot submit interviewer feedback
    student_fb_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/feedback",
        json={
            "rubric_scores": {"conceptual_accuracy": 4.0},
            "overall_score": 4.0,
            "strengths": ["Self review strength"],
            "areas_for_improvement": ["Improvement"],
            "actionable_recommendations": "Student writing own feedback should fail"
        },
        headers=student_auth_headers
    )
    assert student_fb_r.status_code == status.HTTP_403_FORBIDDEN

    # 10. Acceptance Test 8: Meaningful human feedback required (insufficient length fails)
    weak_fb_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/feedback",
        json={
            "rubric_scores": {"conceptual_accuracy": 4.0},
            "overall_score": 4.0,
            "strengths": ["Good"],
            "areas_for_improvement": ["None"],
            "actionable_recommendations": "Too short"  # < 15 chars
        },
        headers=alumni_auth_headers
    )
    assert weak_fb_r.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 11. Interviewer submits valid feedback -> FEEDBACK_SUBMITTED & Karma Awarded
    good_fb_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/feedback",
        json={
            "rubric_scores": {
                "conceptual_accuracy": 4.5,
                "reasoning_approach": 4.0,
                "communication": 4.0,
                "practical_experience": 3.5
            },
            "overall_score": 4.2,
            "strengths": ["Clear articulation of database consistency models", "Strong explanation of CAP theorem trade-offs"],
            "areas_for_improvement": ["Frame edge cases on network partition before presenting final solution"],
            "actionable_recommendations": "Practice drafting 30-second architecture summaries using the BLUF format.",
            "ai_assisted": True,
            "ai_assistance_summary": "Transcript cadence analysis observed 135 words/minute steady pacing."
        },
        headers=alumni_auth_headers
    )
    assert good_fb_r.status_code == status.HTTP_201_CREATED
    fb_data = good_fb_r.json()
    assert fb_data["overall_score"] == 4.2
    assert fb_data["ai_assisted"] is True

    # Check session status and Karma
    sess_detail = client.get(f"/api/v1/mock-interviews/sessions/{session_id}", headers=student_auth_headers).json()
    assert sess_detail["status"] == SessionStatus.FEEDBACK_SUBMITTED.value
    # Acceptance Test 10: Karma awarded
    assert sess_detail["karma_awarded"] is True
    assert sess_detail["karma_points"] == 50

    # 12. Student submits review
    rev_r = client.post(
        f"/api/v1/mock-interviews/sessions/{session_id}/student-review",
        json={
            "rating": 5,
            "usefulness_feedback": "Extremely actionable 90-second feedback. Highlighted exact gaps.",
            "would_recommend": True
        },
        headers=student_auth_headers
    )
    assert rev_r.status_code == status.HTTP_201_CREATED
    assert rev_r.json()["rating"] == 5

    # Check interviewer metrics updated
    prof_after = client.get(f"/api/v1/mock-interviews/interviewers/{prof_id}").json()
    assert prof_after["total_completed_interviews"] >= 1
    assert prof_after["average_rating"] == 5.0
    assert prof_after["total_reviews_count"] >= 1


def test_private_records_access_control(client: TestClient, student_auth_headers: dict, alumni_auth_headers: dict, faculty_auth_headers: dict):
    # Approve interviewer
    client.post("/api/v1/mock-interviews/interviewers/apply", json={
        "institution_affiliation": "IIIT Delhi",
        "primary_domain": "Backend Systems",
        "categories": ["coding_problem_solving"],
        "evidence_links": ["https://linkedin.com/in/alumnus"]
    }, headers=alumni_auth_headers)
    prof = client.get("/api/v1/mock-interviews/interviewers/me", headers=alumni_auth_headers).json()
    client.patch(
        f"/api/v1/mock-interviews/interviewers/{prof['id']}/verify",
        json={"status": "approved"},
        headers=faculty_auth_headers
    )

    alumni_me = client.get("/api/v1/auth/me", headers=alumni_auth_headers).json()

    # Student requests a session
    s_r = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_me["id"],
        "interview_category": "coding_problem_solving",
        "target_role": "Backend Engineer"
    }, headers=student_auth_headers)
    assert s_r.status_code == status.HTTP_201_CREATED
    session_id = s_r.json()["id"]

    # Register third party unrelated student
    client.post("/api/v1/auth/register", json={
        "email": "thirdparty@student.org",
        "password": "Password123!",
        "full_name": "Third Party Student",
        "role": "Student",
        "institution": "IIIT Delhi"
    })
    tok = client.post("/api/v1/auth/login", json={"email": "thirdparty@student.org", "password": "Password123!"}).json()["access_token"]
    third_party_headers = {"Authorization": f"Bearer {tok}"}

    # Third party attempts to inspect session -> 403 Forbidden
    detail_r = client.get(f"/api/v1/mock-interviews/sessions/{session_id}", headers=third_party_headers)
    assert detail_r.status_code == status.HTTP_403_FORBIDDEN


def test_question_browsing_and_authoring(client: TestClient, alumni_auth_headers: dict):
    # 1. Browse curated questions
    q_r = client.get("/api/v1/mock-interviews/questions")
    assert q_r.status_code == status.HTTP_200_OK
    data = q_r.json()
    assert data["total"] >= 4
    first_q = data["items"][0]
    assert first_q["suggested_duration_seconds"] == 90
    assert "evaluation_rubric_template" in first_q

    # 2. Alumni authors a custom question
    create_r = client.post(
        "/api/v1/mock-interviews/questions",
        json={
            "title": "Machine Learning: Overfitting Detection under 90s",
            "question_text": "Explain how you distinguish between high variance and high bias from training and validation loss curves in 90 seconds.",
            "category": "technical_fundamentals",
            "target_role": "ML Engineer",
            "experience_level": "entry_level",
            "expected_answer_hints": ["Compare train vs val loss gap", "Regularization recommendations"]
        },
        headers=alumni_auth_headers
    )
    assert create_r.status_code == status.HTTP_201_CREATED
    assert create_r.json()["author_type"] == "alumni"
    assert create_r.json()["target_role"] == "ML Engineer"


def test_cancellation_and_dispute_workflow(client: TestClient, student_auth_headers: dict, alumni_auth_headers: dict, faculty_auth_headers: dict):
    # Approve interviewer
    client.post("/api/v1/mock-interviews/interviewers/apply", json={
        "institution_affiliation": "IIIT Delhi",
        "primary_domain": "Backend Systems",
        "categories": ["coding_problem_solving"],
        "evidence_links": ["https://linkedin.com/in/alumnus"]
    }, headers=alumni_auth_headers)
    prof = client.get("/api/v1/mock-interviews/interviewers/me", headers=alumni_auth_headers).json()
    client.patch(
        f"/api/v1/mock-interviews/interviewers/{prof['id']}/verify",
        json={"status": "approved"},
        headers=faculty_auth_headers
    )

    alumni_me = client.get("/api/v1/auth/me", headers=alumni_auth_headers).json()

    # Request session
    req = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_me["id"],
        "interview_category": "coding_problem_solving",
        "target_role": "Software Engineer"
    }, headers=student_auth_headers).json()
    s_id = req["id"]

    # Student cancels requested session before accept
    cancel_r = client.post(
        f"/api/v1/mock-interviews/sessions/{s_id}/cancel",
        json={"reason": "Scheduling conflict with midterms"},
        headers=student_auth_headers
    )
    assert cancel_r.status_code == status.HTTP_200_OK
    assert cancel_r.json()["status"] == SessionStatus.CANCELLED.value
    assert cancel_r.json()["cancellation_reason"] == "Scheduling conflict with midterms"

    # Request second session for dispute workflow
    req2 = client.post("/api/v1/mock-interviews/sessions/request", json={
        "interviewer_user_id": alumni_me["id"],
        "interview_category": "coding_problem_solving",
        "target_role": "Software Engineer"
    }, headers=student_auth_headers).json()
    s2_id = req2["id"]
    client.post(f"/api/v1/mock-interviews/sessions/{s2_id}/respond", json={"action": "accept"}, headers=alumni_auth_headers)
    sched_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    client.post(f"/api/v1/mock-interviews/sessions/{s2_id}/schedule", json={"scheduled_at": sched_time}, headers=student_auth_headers)
    client.post(f"/api/v1/mock-interviews/sessions/{s2_id}/start", headers=alumni_auth_headers)
    client.post(f"/api/v1/mock-interviews/sessions/{s2_id}/complete", headers=alumni_auth_headers)

    # Student disputes session
    disp_r = client.post(
        f"/api/v1/mock-interviews/sessions/{s2_id}/dispute",
        json={"reason": "Interviewer connection dropped repeatedly."},
        headers=student_auth_headers
    )
    assert disp_r.status_code == status.HTTP_200_OK
    assert disp_r.json()["status"] == SessionStatus.DISPUTED.value
    assert disp_r.json()["dispute_reason"] == "Interviewer connection dropped repeatedly."
