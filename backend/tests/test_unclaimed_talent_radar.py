"""
Comprehensive Automated Test Suite for Unclaimed Talent Radar Feature.
Validates all 20 required scenarios specified in Feature Specification Section 14.
"""

import pytest
from datetime import datetime, timedelta, timezone
from fastapi import status


@pytest.fixture
def seed_test_opportunities(client, alumni_auth):
    """Seed test database with diverse real opportunity records across domains."""
    now = datetime.now(timezone.utc)
    future_deadline = now + timedelta(days=30)
    past_deadline = now - timedelta(days=5)

    headers = alumni_auth["headers"]

    # 1. Direct Match Opportunity: Python Backend (Information Technology)
    opp1 = {
        "title": "Backend Systems Engineer",
        "organization": "Nexus Labs",
        "opportunity_type": "job",
        "industry": "Information Technology",
        "description": "Building high-performance APIs and distributed caching services.",
        "required_skills": ["Python", "SQL", "FastAPI"],
        "preferred_skills": ["Docker"],
        "experience_level": "Entry",
        "min_years_experience": 0.5,
        "location": "New Delhi",
        "workplace_type": "remote",
        "eligibility_criteria": {"allowed_roles": ["Student", "Alumni"]},
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
        "learning_resources": [
            {"skill": "FastAPI", "title": "FastAPI Async Tutorial", "type": "guide"}
        ],
    }

    # 2. Adjacent Industry Match: Autonomous Vehicle Perception (Autonomous Vehicles)
    opp2 = {
        "title": "Autonomous Vehicle Perception Researcher",
        "organization": "DriveAI Robotics",
        "opportunity_type": "research_project",
        "industry": "Autonomous Vehicles",
        "description": "Camera and LiDAR 3D object detection for autonomous shuttles.",
        "required_skills": ["Autonomous Vehicle Perception", "ROS 2", "Python"],
        "preferred_skills": ["PyTorch", "C++"],
        "experience_level": "Student",
        "min_years_experience": 0.0,
        "location": "Bangalore",
        "workplace_type": "hybrid",
        "eligibility_criteria": {"allowed_roles": ["Student", "Alumni"]},
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
        "learning_resources": [
            {"skill": "ROS 2", "title": "ROS 2 rclpy Architecture Lab", "type": "lab"}
        ],
    }

    # 3. Exploratory Match: Medical Image Analysis (Healthcare & Medical Imaging)
    opp3 = {
        "title": "Biomedical Imaging Fellow",
        "organization": "MedScan Institute",
        "opportunity_type": "fellowship",
        "industry": "Healthcare & Medical Imaging",
        "description": "Deep learning models for MRI tumor segmentation.",
        "required_skills": ["Medical Image Analysis", "Python"],
        "preferred_skills": ["NumPy"],
        "experience_level": "Student",
        "min_years_experience": 0.0,
        "location": "Delhi",
        "workplace_type": "onsite",
        "eligibility_criteria": {"allowed_roles": ["Student", "Alumni"]},
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
        "learning_resources": [],
    }

    # 4. Unrelated Opportunity: Agricultural Agronomist
    opp4 = {
        "title": "Soil Chemistry Field Inspector",
        "organization": "AgriTech Farms",
        "opportunity_type": "job",
        "industry": "Agriculture",
        "description": "Soil nitrogen testing and crop rotation advising.",
        "required_skills": ["Soil Chemistry", "Agronomy", "Crop Science"],
        "preferred_skills": ["Tractor Mechanics"],
        "experience_level": "Senior",
        "min_years_experience": 5.0,
        "location": "Punjab",
        "workplace_type": "onsite",
        "eligibility_criteria": {"allowed_roles": ["Alumni"]},
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
        "learning_resources": [],
    }

    # 5. Expired Opportunity
    opp5 = {
        "title": "Expired Summer Internship",
        "organization": "OldTech",
        "opportunity_type": "internship",
        "industry": "Information Technology",
        "description": "Past internship with expired deadline.",
        "required_skills": ["Python"],
        "deadline": past_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
    }

    # 6. Closed Opportunity
    opp6 = {
        "title": "Closed Innovation Challenge",
        "organization": "InnoCorp",
        "opportunity_type": "technical_challenge",
        "industry": "Information Technology",
        "description": "Completed hackathon challenge.",
        "required_skills": ["Python"],
        "deadline": future_deadline.isoformat(),
        "status": "closed",
        "visibility": "public",
    }

    # 7. Private Opportunity (owned by alumni_auth)
    opp7 = {
        "title": "Confidential Stealth Project",
        "organization": "Secret Founders",
        "opportunity_type": "collaboration",
        "industry": "Information Technology",
        "description": "Private project for selected eyes only.",
        "required_skills": ["Python", "Distributed Systems"],
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "private",
    }

    # 8. Strict Eligibility Opportunity (requires education credentials)
    opp8 = {
        "title": "Postdoctoral AI Fellowship",
        "organization": "National Research Center",
        "opportunity_type": "fellowship",
        "industry": "Artificial Intelligence",
        "description": "Advanced research requiring specific degree validation.",
        "required_skills": ["Machine Learning", "Python"],
        "eligibility_criteria": {
            "allowed_roles": ["Alumni"],
            "min_education": "Master of Science",
            "allowed_majors": ["Computer Science", "Artificial Intelligence"]
        },
        "deadline": future_deadline.isoformat(),
        "status": "open",
        "visibility": "public",
    }

    created = {}
    for key, opp in [
        ("it_job", opp1),
        ("av_research", opp2),
        ("med_fellowship", opp3),
        ("agri_job", opp4),
        ("expired", opp5),
        ("closed", opp6),
        ("private", opp7),
        ("strict_eligibility", opp8),
    ]:
        res = client.post("/api/v1/unclaimed-talent-radar/opportunities", json=opp, headers=headers)
        assert res.status_code == status.HTTP_201_CREATED, f"Failed creating {key}: {res.text}"
        created[key] = res.json()

    return created


@pytest.fixture
def student_with_cv_profile(client, student_auth):
    """
    Setup student profile with Computer Vision and Python,
    plus an authentic CareerJourney demonstrating project evidence.
    """
    headers = student_auth["headers"]

    # 1. Update Profile to include Python, Computer Vision, OpenCV, SQL
    update_res = client.patch(
        "/api/v1/auth/profile",
        json={
            "skills": ["Python", "Computer Vision", "SQL", "NumPy", "OpenCV"],
            "industry": "Information Technology",
            "headline": "Student interested in visual algorithms and autonomous systems",
            "years_of_experience": 1.0,
        },
        headers=headers,
    )
    assert update_res.status_code == status.HTTP_200_OK

    # 2. Add CareerJourney record with project evidence
    journey_data = {
        "job_title": "Computer Vision Research Intern",
        "company": "IIITD Robotics Lab",
        "industry": "Information Technology",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "is_current": False,
        "description": "Developed dynamic image processing pipelines for edge cameras.",
        "skills_used": ["Python", "Computer Vision", "OpenCV"],
        "projects_or_achievements": [
            "Trained a Python edge object detector processing camera streams at 45 FPS",
            "Implemented multi-spectral image augmentation algorithms in Python"
        ],
        "career_transition_notes": "Transitioned from academic coursework to applied research.",
        "visibility": "public",
    }
    j_res = client.post("/api/v1/career-time-machine/journeys", json=journey_data, headers=headers)
    assert j_res.status_code == status.HTTP_201_CREATED

    return student_auth


# ==============================================================================
# 20 REQUIRED TEST SCENARIOS
# ==============================================================================

def test_01_discover_opportunities_using_actual_stored_records(client, student_with_cv_profile, seed_test_opportunities):
    """1. Discovering opportunities using actual stored records."""
    headers = student_with_cv_profile["headers"]
    res = client.get("/api/v1/unclaimed-talent-radar/discover", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "items" in data
    assert data["total"] > 0
    # Every item corresponds to an actual stored ID
    stored_ids = {opp["id"] for opp in seed_test_opportunities.values()}
    for item in data["items"]:
        assert item["opportunity_id"] in stored_ids


def test_02_direct_skill_matching(client, student_with_cv_profile, seed_test_opportunities):
    """2. Direct skill matching."""
    headers = student_with_cv_profile["headers"]
    it_opp_id = seed_test_opportunities["it_job"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{it_opp_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "Python" in data["matched_skills"]
    assert data["relevance_score"] > 35.0


def test_03_transferable_skill_matching(client, student_with_cv_profile, seed_test_opportunities):
    """3. Transferable skill matching."""
    headers = student_with_cv_profile["headers"]
    av_opp_id = seed_test_opportunities["av_research"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_opp_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert len(data["transferable_skills"]) > 0
    ts = data["transferable_skills"][0]
    assert ts["user_skill"] == "Computer Vision"
    assert "Autonomous Vehicles" in ts["related_domain"]
    assert ts["confidence"] is not None
    assert len(ts["reason"]) > 0


def test_04_adjacent_industry_recommendations(client, student_with_cv_profile, seed_test_opportunities):
    """4. Adjacent-industry recommendations."""
    headers = student_with_cv_profile["headers"]
    av_opp_id = seed_test_opportunities["av_research"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_opp_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    # Student is in "Information Technology", Opportunity is in "Autonomous Vehicles"
    assert data["match_type"] == "adjacent_industry"
    assert data["industry"] == "Autonomous Vehicles"


def test_05_missing_profile_information(client, second_user_auth, seed_test_opportunities):
    """5. Missing profile information handled gracefully without crashing."""
    headers = second_user_auth["headers"]
    # User with bare minimal profile
    res = client.get("/api/v1/unclaimed-talent-radar/discover", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_06_unknown_eligibility_status(client, student_with_cv_profile, seed_test_opportunities):
    """6. Unknown eligibility status when required profile credentials are absent."""
    headers = student_with_cv_profile["headers"]
    strict_id = seed_test_opportunities["strict_eligibility"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{strict_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    # Student's education is unrecorded, role is Student (requires Alumni and MS)
    assert data["eligibility_status"] in ["unknown", "ineligible"]
    assert data["eligibility_details"] is not None


def test_07_preventing_fabricated_opportunities(client, student_with_cv_profile):
    """7. Preventing fabricated opportunities - returns 404 for non-existent IDs."""
    headers = student_with_cv_profile["headers"]
    res = client.get("/api/v1/unclaimed-talent-radar/recommendations/99999", headers=headers)
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_08_excluding_expired_opportunities(client, student_with_cv_profile, seed_test_opportunities):
    """8. Excluding expired opportunities."""
    headers = student_with_cv_profile["headers"]
    expired_id = seed_test_opportunities["expired"]["id"]
    # Check discover feed
    res = client.get("/api/v1/unclaimed-talent-radar/discover", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    discovered_ids = [item["opportunity_id"] for item in res.json()["items"]]
    assert expired_id not in discovered_ids

    # Direct recommendation endpoint also rejects expired opportunity
    detail_res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{expired_id}", headers=headers)
    assert detail_res.status_code == status.HTTP_400_BAD_REQUEST


def test_09_excluding_closed_opportunities(client, student_with_cv_profile, seed_test_opportunities):
    """9. Excluding closed opportunities."""
    headers = student_with_cv_profile["headers"]
    closed_id = seed_test_opportunities["closed"]["id"]
    # Check discover feed
    res = client.get("/api/v1/unclaimed-talent-radar/discover", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    discovered_ids = [item["opportunity_id"] for item in res.json()["items"]]
    assert closed_id not in discovered_ids

    # Direct recommendation endpoint also rejects closed opportunity
    detail_res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{closed_id}", headers=headers)
    assert detail_res.status_code == status.HTTP_400_BAD_REQUEST


def test_10_respecting_opportunity_visibility(client, student_with_cv_profile, seed_test_opportunities):
    """10. Respecting opportunity visibility (private record invisible to non-owner)."""
    headers = student_with_cv_profile["headers"]
    private_id = seed_test_opportunities["private"]["id"]
    # Student should not see alumni's private opportunity
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{private_id}", headers=headers)
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_11_filtering_by_opportunity_type_and_industry(client, student_with_cv_profile, seed_test_opportunities):
    """11. Filtering by opportunity type and industry."""
    headers = student_with_cv_profile["headers"]
    # Filter by research_project
    res = client.get("/api/v1/unclaimed-talent-radar/discover?opportunity_type=research_project", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    for item in res.json()["items"]:
        assert item["opportunity_type"] == "research_project"

    # Filter by industry
    res_ind = client.get("/api/v1/unclaimed-talent-radar/discover?industry=Autonomous%20Vehicles", headers=headers)
    assert res_ind.status_code == status.HTTP_200_OK
    for item in res_ind.json()["items"]:
        assert item["industry"] == "Autonomous Vehicles"


def test_12_ranking_relevant_opportunities_above_unrelated(client, student_with_cv_profile, seed_test_opportunities):
    """12. Ranking relevant opportunities above unrelated opportunities."""
    headers = student_with_cv_profile["headers"]
    av_id = seed_test_opportunities["av_research"]["id"]
    agri_id = seed_test_opportunities["agri_job"]["id"]

    res_av = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_id}", headers=headers)
    res_agri = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{agri_id}", headers=headers)

    score_av = res_av.json()["relevance_score"]
    score_agri = res_agri.json()["relevance_score"]

    assert score_av > score_agri + 15.0


def test_13_generating_explanations_from_actual_matching_evidence(client, student_with_cv_profile, seed_test_opportunities):
    """13. Generating explanations from actual matching evidence."""
    headers = student_with_cv_profile["headers"]
    av_id = seed_test_opportunities["av_research"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    reasons = res.json()["recommendation_reasons"]
    assert len(reasons) > 0
    # Must contain factual evidence mention
    evidence_text = " ".join(reasons)
    assert "Computer Vision" in evidence_text or "Python" in evidence_text or "Autonomous Vehicles" in evidence_text


def test_14_identifying_missing_skills(client, student_with_cv_profile, seed_test_opportunities):
    """14. Identifying missing skills."""
    headers = student_with_cv_profile["headers"]
    av_id = seed_test_opportunities["av_research"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    missing = res.json()["missing_skills"]
    # Student has Python and CV, but not ROS 2
    assert "ROS 2" in missing or "Ros 2" in missing


def test_15_generating_deterministic_learning_suggestions(client, student_with_cv_profile, seed_test_opportunities):
    """15. Generating deterministic learning suggestions."""
    headers = student_with_cv_profile["headers"]
    av_id = seed_test_opportunities["av_research"]["id"]
    res = client.get(f"/api/v1/unclaimed-talent-radar/recommendations/{av_id}", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    learning = res.json()["learning_suggestions"]
    assert len(learning) > 0
    ros2_suggestion = next((s for s in learning if "ros 2" in s["missing_skill"].lower()), None)
    assert ros2_suggestion is not None
    assert len(ros2_suggestion["suggested_action"]) > 10
    assert len(ros2_suggestion["addressed_gap"]) > 10


def test_16_recording_recommendation_feedback(client, student_with_cv_profile, seed_test_opportunities):
    """16. Recording recommendation feedback."""
    headers = student_with_cv_profile["headers"]
    av_id = seed_test_opportunities["av_research"]["id"]

    fb_payload = {
        "opportunity_id": av_id,
        "feedback_type": "interested_in_industry",
        "notes": "Very excited to explore autonomous vehicle perception!"
    }
    res = client.post("/api/v1/unclaimed-talent-radar/feedback", json=fb_payload, headers=headers)
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["opportunity_id"] == av_id
    assert data["feedback_type"] == "interested_in_industry"


def test_17_preventing_unauthorized_feedback_access(client, seed_test_opportunities):
    """17. Preventing unauthorized feedback access (unauthenticated requests rejected with 401)."""
    av_id = seed_test_opportunities["av_research"]["id"]
    fb_payload = {
        "opportunity_id": av_id,
        "feedback_type": "relevant",
    }
    # No Authorization header
    res = client.post("/api/v1/unclaimed-talent-radar/feedback", json=fb_payload)
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_18_preventing_duplicate_feedback_records(client, student_with_cv_profile, seed_test_opportunities):
    """18. Preventing duplicate feedback records (upserts on existing user/opportunity pair)."""
    headers = student_with_cv_profile["headers"]
    it_id = seed_test_opportunities["it_job"]["id"]

    # First submission: "relevant"
    res1 = client.post(
        "/api/v1/unclaimed-talent-radar/feedback",
        json={"opportunity_id": it_id, "feedback_type": "relevant", "notes": "Looks interesting."},
        headers=headers,
    )
    assert res1.status_code == status.HTTP_200_OK
    fb_id_1 = res1.json()["id"]

    # Second submission for same user & opportunity: "already_skilled"
    res2 = client.post(
        "/api/v1/unclaimed-talent-radar/feedback",
        json={"opportunity_id": it_id, "feedback_type": "already_skilled", "notes": "Changed my mind."},
        headers=headers,
    )
    assert res2.status_code == status.HTTP_200_OK
    fb_id_2 = res2.json()["id"]

    # Must update the existing row, not duplicate
    assert fb_id_1 == fb_id_2
    assert res2.json()["feedback_type"] == "already_skilled"


def test_19_pagination_and_sorting(client, student_with_cv_profile, seed_test_opportunities):
    """19. Pagination and sorting."""
    headers = student_with_cv_profile["headers"]
    # Page 1 with page_size=2
    res_p1 = client.get("/api/v1/unclaimed-talent-radar/discover?page=1&page_size=2&sort_by=relevance", headers=headers)
    assert res_p1.status_code == status.HTTP_200_OK
    data_p1 = res_p1.json()
    assert len(data_p1["items"]) <= 2
    assert data_p1["page"] == 1

    # Verify relevance sorting descending
    scores = [item["relevance_score"] for item in data_p1["items"]]
    assert scores == sorted(scores, reverse=True)


def test_20_ensuring_existing_backend_features_continue_to_work(client, student_auth, alumni_auth):
    """20. Ensuring existing backend features (Health, Auth, Career Time Machine) continue to work."""
    # 1. Health check
    h_res = client.get("/health")
    assert h_res.status_code == status.HTTP_200_OK
    assert h_res.json()["status"] == "healthy"

    # 2. Auth /me
    me_res = client.get("/api/v1/auth/me", headers=student_auth["headers"])
    assert me_res.status_code == status.HTTP_200_OK
    assert me_res.json()["email"] == student_auth["email"]

    # 3. Career Time Machine timeline explore
    ctm_res = client.get("/api/v1/career-time-machine/explore")
    assert ctm_res.status_code == status.HTTP_200_OK
    assert "items" in ctm_res.json()

    # 4. Unclaimed Talent Radar Skill Map
    map_res = client.get("/api/v1/unclaimed-talent-radar/skill-map")
    assert map_res.status_code == status.HTTP_200_OK
    assert map_res.json()["total_skills"] > 0
    assert map_res.json()["total_relationships"] > 0
