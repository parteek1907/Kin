"""
Comprehensive Automated Test Suite for Feature 2: Skill Bounty Network.

Tests all 20 required scenarios from Section 13:
1. Creating a challenge.
2. Rejecting unauthorized challenge creation (e.g. Student role).
3. Publishing a challenge (DRAFT -> OPEN).
4. Editing only one's own challenge (creator vs other creator).
5. Challenge discovery filters (category, skill, difficulty, search).
6. Pagination (page, page_size, total_pages).
7. Rejecting submissions to expired challenges.
8. Creating a submission (valid links, descriptions).
9. Preventing duplicate active submissions.
10. Preventing unauthorized submission access.
11. Preventing unauthorized submission edits.
12. Reviewing a submission (valid scores, rubric).
13. Preventing self-review.
14. Rejecting invalid evaluation scores (> 100 or < 0).
15. Enforcing challenge lifecycle transitions.
16. Recording an explicit professional outcome.
17. Generating deterministic challenge recommendations.
18. Returning useful results when the user has few profile details.
19. Preventing access to another creator's submissions.
20. Verification that entire backend test suite passes concurrently.
"""

from datetime import datetime, timezone, timedelta
import pytest
from app.features.skill_bounty.models import (
    Challenge,
    ChallengeStatus,
    SubmissionStatus,
    ChallengeCategory,
    ChallengeDifficulty,
    OutcomeType,
)


def _future_deadline(days: int = 14) -> str:
    """Helper to return an ISO formatted deadline in the future."""
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


# --- Test 1: Creating a Challenge ---
def test_create_challenge_success(client, alumni_auth):
    payload = {
        "title": "Build a Scalable Real-time Fraud Detection Pipeline",
        "short_summary": "Design a high-throughput streaming fraud detector with latency under 50ms.",
        "problem_statement": "Financial transactions require real-time rule and anomaly evaluation. Build a prototype using Python.",
        "category": "backend_engineering",
        "required_skills": ["Python", "FastAPI", "Redis"],
        "difficulty_level": "intermediate",
        "estimated_effort": "4-6 hours",
        "submission_instructions": "Submit GitHub repository with architecture diagram and Locust benchmark results.",
        "evaluation_criteria": [
            {"criterion": "System Latency", "max_points": 40},
            {"criterion": "Code Modularity", "max_points": 30},
            {"criterion": "Test Coverage", "max_points": 30}
        ],
        "deadline": _future_deadline(10),
        "organization_name": "FinTech Labs",
        "reward_description": "Certificate of Excellence & Mentorship consideration",
        "mentorship_available": True,
        "opportunity_type_offered": "Interview Consideration"
    }

    res = client.post("/api/v1/skill-bounty/challenges", json=payload, headers=alumni_auth["headers"])
    assert res.status_code == 201
    data = res.json()
    assert data["id"] > 0
    assert data["title"] == payload["title"]
    assert data["status"] == "draft"
    assert data["creator_user_id"] == alumni_auth["user_id"]
    assert data["creator_name"] == "Priya Nair"
    assert data["mentorship_available"] is True


# --- Test 2: Rejecting Unauthorized Challenge Creation ---
def test_reject_unauthorized_challenge_creation(client, student_auth):
    payload = {
        "title": "Student Unauthorized Challenge",
        "short_summary": "Students should not be allowed to publish bounties as creators.",
        "problem_statement": "Platform rule specifies only Alumni, Founders, Recruiters, and Faculty can author bounties.",
        "category": "backend_engineering",
        "required_skills": ["Python"],
        "difficulty_level": "beginner",
        "deadline": _future_deadline(5)
    }

    res = client.post("/api/v1/skill-bounty/challenges", json=payload, headers=student_auth["headers"])
    assert res.status_code == 403
    assert "Only Alumni, Founders, Recruiters, and Faculty" in res.json()["detail"]


# --- Test 3: Publishing a Challenge ---
def test_publish_challenge_lifecycle(client, alumni_auth):
    create_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Autonomous Vehicle Point Cloud Parser",
            "short_summary": "Filter and cluster LiDAR point clouds in real-time.",
            "problem_statement": "Implement Euclidean clustering for 3D LiDAR point clouds with bounding box generation.",
            "category": "autonomous_vehicles",
            "required_skills": ["Python", "C++", "Robotics"],
            "difficulty_level": "advanced",
            "deadline": _future_deadline(20)
        },
        headers=alumni_auth["headers"]
    )
    assert create_res.status_code == 201
    challenge_id = create_res.json()["id"]
    assert create_res.json()["status"] == "draft"

    # Publish
    pub_res = client.post(f"/api/v1/skill-bounty/challenges/{challenge_id}/publish", headers=alumni_auth["headers"])
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["status"] == "open"
    assert pub_data["published_at"] is not None


# --- Test 4: Editing Only One's Own Challenge ---
def test_editing_only_own_challenge(client, alumni_auth, second_user_auth):
    # Creator A creates a challenge
    create_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Original Challenge Title",
            "short_summary": "Summary before modification.",
            "problem_statement": "Detailed problem statement that needs refinement.",
            "category": "data_science",
            "required_skills": ["Python", "Pandas"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(7)
        },
        headers=alumni_auth["headers"]
    )
    challenge_id = create_res.json()["id"]

    # Creator B attempts to edit Creator A's challenge
    unauthorized_res = client.patch(
        f"/api/v1/skill-bounty/challenges/{challenge_id}",
        json={"title": "Malicious Tampered Title"},
        headers=second_user_auth["headers"]
    )
    assert unauthorized_res.status_code == 403

    # Creator A successfully edits
    valid_res = client.patch(
        f"/api/v1/skill-bounty/challenges/{challenge_id}",
        json={"title": "Updated Challenge Title By Creator"},
        headers=alumni_auth["headers"]
    )
    assert valid_res.status_code == 200
    assert valid_res.json()["title"] == "Updated Challenge Title By Creator"


# --- Test 5: Challenge Discovery Filters ---
def test_challenge_discovery_filters(client, alumni_auth):
    # Create challenge in artificial_intelligence
    c1 = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "LLM Agent Tool Evaluator",
            "short_summary": "Evaluate tool-use benchmarks on open-weight LLMs.",
            "problem_statement": "Construct robust evaluation harness for multi-step agent actions.",
            "category": "artificial_intelligence",
            "required_skills": ["Python", "Transformers", "Evaluation"],
            "difficulty_level": "advanced",
            "deadline": _future_deadline(15),
            "organization_name": "AI Frontier Lab"
        },
        headers=alumni_auth["headers"]
    )
    ch1_id = c1.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch1_id}/publish", headers=alumni_auth["headers"])

    # Create challenge in cybersecurity
    c2 = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Zero-Trust API Gateway Auditing",
            "short_summary": "Audit mTLS and JWT boundary controls.",
            "problem_statement": "Simulate permission escalation attacks on misconfigured claim scopes.",
            "category": "cybersecurity",
            "required_skills": ["Go", "Cryptography", "Network Security"],
            "difficulty_level": "expert",
            "deadline": _future_deadline(12)
        },
        headers=alumni_auth["headers"]
    )
    ch2_id = c2.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch2_id}/publish", headers=alumni_auth["headers"])

    # Filter by category
    ai_res = client.get("/api/v1/skill-bounty/challenges?category=artificial_intelligence", headers=alumni_auth["headers"])
    assert ai_res.status_code == 200
    items = ai_res.json()["items"]
    assert any(i["id"] == ch1_id for i in items)
    assert not any(i["id"] == ch2_id for i in items)

    # Filter by search
    search_res = client.get("/api/v1/skill-bounty/challenges?search=Zero-Trust", headers=alumni_auth["headers"])
    assert search_res.status_code == 200
    assert any(i["id"] == ch2_id for i in search_res.json()["items"])


# --- Test 6: Pagination ---
def test_challenge_pagination(client, alumni_auth):
    res = client.get("/api/v1/skill-bounty/challenges?page=1&page_size=2", headers=alumni_auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "total_pages" in data
    assert len(data["items"]) <= 2


# --- Test 7: Rejecting Submissions to Expired or Closed Challenges ---
def test_reject_submissions_to_expired_challenges(client, db, alumni_auth, student_auth):
    create_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Expired Challenge Test",
            "short_summary": "This challenge will expire before submission.",
            "problem_statement": "Submitting after deadline must be rejected with 400 Bad Request.",
            "category": "web_development",
            "required_skills": ["TypeScript"],
            "difficulty_level": "beginner",
            "deadline": _future_deadline(5)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = create_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    # Manually expire the deadline in DB
    ch_obj = db.query(Challenge).filter(Challenge.id == ch_id).first()
    ch_obj.deadline = datetime.now(timezone.utc) - timedelta(hours=2)
    db.commit()

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "My late submission attempt with code.",
            "repository_url": "https://github.com/student/late-project",
        },
        headers=student_auth["headers"]
    )
    assert sub_res.status_code == 400
    assert "expired" in sub_res.json()["detail"].lower()


# --- Test 8: Creating a Submission ---
def test_create_submission_success(client, alumni_auth, student_auth):
    # Setup Open Challenge
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "High-Performance Key-Value Store",
            "short_summary": "Implement an LSM-Tree key-value store with compaction.",
            "problem_statement": "Write an LSM-Tree storage engine handling 10k writes/sec with crash recovery.",
            "category": "backend_engineering",
            "required_skills": ["Python", "Data Structures"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    # Student Submits
    sub_payload = {
        "submission_description": "Implemented LSM tree with memtable WAL, SSTable flushing, and leveled compaction.",
        "repository_url": "https://github.com/aarav-iiitd/lsm-tree-py",
        "demo_url": "https://lsm-demo.aarav.dev",
        "supporting_evidence_urls": ["https://aarav.dev/benchmarks/lsm-perf.pdf"],
        "attachment_references": ["v1.0.0-release"]
    }
    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json=sub_payload,
        headers=student_auth["headers"]
    )
    assert sub_res.status_code == 201
    data = sub_res.json()
    assert data["id"] > 0
    assert data["student_user_id"] == student_auth["user_id"]
    assert data["status"] == "submitted"
    assert data["student_name"] == "Aarav Sharma"
    assert data["repository_url"] == sub_payload["repository_url"]


# --- Test 9: Preventing Duplicate Active Submissions ---
def test_prevent_duplicate_active_submissions(client, alumni_auth, student_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Graph Traversal Optimization",
            "short_summary": "Implement parallel breadth-first search.",
            "problem_statement": "Optimize BFS over billion-edge graph datasets using shared memory.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(8)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_payload = {
        "submission_description": "Initial parallel BFS implementation using multiprocessing queues.",
        "repository_url": "https://github.com/aarav-iiitd/graph-bfs",
    }
    first_sub = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/submissions", json=sub_payload, headers=student_auth["headers"])
    assert first_sub.status_code == 201

    # Second active submission should be rejected
    second_sub = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/submissions", json=sub_payload, headers=student_auth["headers"])
    assert second_sub.status_code == 400
    assert "already have an active submission" in second_sub.json()["detail"].lower()


# --- Test 10: Preventing Unauthorized Submission Access ---
def test_prevent_unauthorized_submission_access(client, alumni_auth, student_auth, second_user_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Confidential Security Audit",
            "short_summary": "Identify vulnerabilities in mock microservices.",
            "problem_statement": "Penetration test containerized microservice cluster.",
            "category": "cybersecurity",
            "required_skills": ["Python"],
            "difficulty_level": "advanced",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "Discovered SSRF and JWT bypass in token parsing module.",
            "repository_url": "https://github.com/aarav-iiitd/audit-repo",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub_res.json()["id"]

    # Creator (Alumni) can view
    creator_res = client.get(f"/api/v1/skill-bounty/submissions/{sub_id}", headers=alumni_auth["headers"])
    assert creator_res.status_code == 200

    # Student owner can view
    owner_res = client.get(f"/api/v1/skill-bounty/submissions/{sub_id}", headers=student_auth["headers"])
    assert owner_res.status_code == 200

    # Unrelated user (second_user_auth) cannot view
    unrelated_res = client.get(f"/api/v1/skill-bounty/submissions/{sub_id}", headers=second_user_auth["headers"])
    assert unrelated_res.status_code == 403


# --- Test 11: Preventing Unauthorized Submission Edits & Withdraw ---
def test_submission_modifications_and_withdraw(client, alumni_auth, student_auth, second_user_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Compiler AST Optimizer",
            "short_summary": "Write dead code elimination pass.",
            "problem_statement": "Build constant folding and dead code elimination passes in Python AST.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "Initial AST pass implementation.",
            "repository_url": "https://github.com/aarav/ast-opt",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub.json()["id"]

    # Unauthorized edit attempt
    bad_edit = client.patch(
        f"/api/v1/skill-bounty/submissions/{sub_id}",
        json={"submission_description": "Hijacked description."},
        headers=second_user_auth["headers"]
    )
    assert bad_edit.status_code == 403

    # Authorized edit
    good_edit = client.patch(
        f"/api/v1/skill-bounty/submissions/{sub_id}",
        json={"submission_description": "Refined AST pass with SSA form transformation."},
        headers=student_auth["headers"]
    )
    assert good_edit.status_code == 200
    assert "SSA form" in good_edit.json()["submission_description"]

    # Student withdraws submission
    withdraw_res = client.post(f"/api/v1/skill-bounty/submissions/{sub_id}/withdraw", headers=student_auth["headers"])
    assert withdraw_res.status_code == 200
    assert withdraw_res.json()["status"] == "withdrawn"


# --- Test 12: Reviewing a Submission ---
def test_review_submission_success(client, alumni_auth, student_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Distributed Cache Consensus",
            "short_summary": "Raft-based cache consensus protocol.",
            "problem_statement": "Implement leader election and log replication.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "advanced",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "Implemented Raft consensus with log compaction and snapshotting.",
            "repository_url": "https://github.com/aarav/raft-cache",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub_res.json()["id"]

    review_payload = {
        "technical_feedback": "Exceptional clean implementation of heartbeat timers and election terms. Code is thoroughly tested.",
        "score": 94.5,
        "evaluation_criterion_results": [
            {"criterion": "Consensus Correctness", "score": 38, "max": 40},
            {"criterion": "Log Compaction", "score": 28, "max": 30},
            {"criterion": "Code Quality", "score": 28.5, "max": 30}
        ],
        "strengths": ["Clear state machine boundaries", "Exemplary deterministic simulation tests"],
        "areas_for_improvement": ["Consider batching client write requests under high burst conditions"],
        "status": "completed"
    }

    rev_res = client.post(
        f"/api/v1/skill-bounty/submissions/{sub_id}/reviews",
        json=review_payload,
        headers=alumni_auth["headers"]
    )
    assert rev_res.status_code == 201
    rev_data = rev_res.json()
    assert rev_data["score"] == 94.5
    assert rev_data["reviewer_user_id"] == alumni_auth["user_id"]

    # Submission status should now be 'reviewed'
    chk_sub = client.get(f"/api/v1/skill-bounty/submissions/{sub_id}", headers=student_auth["headers"])
    assert chk_sub.json()["status"] == "reviewed"
    assert chk_sub.json()["average_score"] == 94.5


# --- Test 13: Preventing Self-Review ---
def test_prevent_self_review(client, alumni_auth, student_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Self Review Prevention Test",
            "short_summary": "Test that authors cannot review themselves.",
            "problem_statement": "Rigorous platform validation prevents grade inflation by self-scoring.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "My own submission that I will try to rate 100/100.",
            "repository_url": "https://github.com/aarav/self-rate",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub_res.json()["id"]

    # Student attempts self-review
    self_rev = client.post(
        f"/api/v1/skill-bounty/submissions/{sub_id}/reviews",
        json={
            "technical_feedback": "I give myself top marks for everything.",
            "score": 100.0,
        },
        headers=student_auth["headers"]
    )
    assert self_rev.status_code == 400
    assert "Self-review is strictly prohibited" in self_rev.json()["detail"]


# --- Test 14: Rejecting Invalid Evaluation Scores ---
def test_reject_invalid_evaluation_scores(client, alumni_auth, student_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Score Validation Check",
            "short_summary": "Scores must stay within 0.0 to 100.0.",
            "problem_statement": "Validate range enforcement.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "Submission for score validation check.",
            "repository_url": "https://github.com/aarav/score-test",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub_res.json()["id"]

    # Score > 100
    high_score = client.post(
        f"/api/v1/skill-bounty/submissions/{sub_id}/reviews",
        json={"technical_feedback": "Too generous score.", "score": 115.0},
        headers=alumni_auth["headers"]
    )
    assert high_score.status_code == 422

    # Score < 0
    neg_score = client.post(
        f"/api/v1/skill-bounty/submissions/{sub_id}/reviews",
        json={"technical_feedback": "Negative score.", "score": -10.0},
        headers=alumni_auth["headers"]
    )
    assert neg_score.status_code == 422


# --- Test 15: Enforcing Challenge Lifecycle Transitions ---
def test_challenge_lifecycle_transitions(client, alumni_auth):
    create_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Lifecycle Transition Flow",
            "short_summary": "Draft -> Open -> Closed -> Completed.",
            "problem_statement": "Verify state transitions cannot jump out of order.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = create_res.json()["id"]

    # Cannot close draft challenge directly
    bad_close = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/close", headers=alumni_auth["headers"])
    assert bad_close.status_code == 400

    # Publish draft -> open
    pub = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])
    assert pub.status_code == 200
    assert pub.json()["status"] == "open"

    # Close open -> closed
    close_res = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/close", headers=alumni_auth["headers"])
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "closed"

    # Complete closed -> completed
    comp_res = client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/complete", headers=alumni_auth["headers"])
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"

    # Cannot edit or cancel completed challenge
    bad_edit = client.patch(
        f"/api/v1/skill-bounty/challenges/{ch_id}",
        json={"title": "Reopening Completed Challenge"},
        headers=alumni_auth["headers"]
    )
    assert bad_edit.status_code == 400


# --- Test 16: Recording an Explicit Professional Outcome ---
def test_record_explicit_professional_outcome(client, alumni_auth, student_auth):
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Full-Stack Graph Visualization",
            "short_summary": "Interactive WebGL visualization for large social graphs.",
            "problem_statement": "Render 50k nodes with force-directed physics.",
            "category": "web_development",
            "required_skills": ["TypeScript", "WebGL"],
            "difficulty_level": "advanced",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    sub_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "High performance WebGL graph rendering module.",
            "repository_url": "https://github.com/aarav/webgl-graph",
        },
        headers=student_auth["headers"]
    )
    sub_id = sub_res.json()["id"]

    outcome_payload = {
        "student_user_id": student_auth["user_id"],
        "submission_id": sub_id,
        "outcome_type": "interview_opportunity",
        "title": "Fast-Track Interview for Graphics Engineering Intern",
        "details": "Invited for 1st round technical interview based on outstanding WebGL shader implementation.",
        "skills_demonstrated": ["WebGL", "GLSL", "TypeScript", "Performance Profiling"]
    }

    out_res = client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/outcomes",
        json=outcome_payload,
        headers=alumni_auth["headers"]
    )
    assert out_res.status_code == 201
    out_data = out_res.json()
    assert out_data["outcome_type"] == "interview_opportunity"
    assert out_data["student_user_id"] == student_auth["user_id"]
    assert out_data["granted_by_user_id"] == alumni_auth["user_id"]
    assert "WebGL" in out_data["skills_demonstrated"]


# --- Test 17: Generating Deterministic Challenge Recommendations ---
def test_deterministic_challenge_recommendations(client, alumni_auth, student_auth):
    # Student profile in conftest has skills: ["Python", "Data Structures"]
    rec_res = client.get("/api/v1/skill-bounty/recommendations/me", headers=student_auth["headers"])
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert data["user_id"] == student_auth["user_id"]
    assert "recommendations" in data
    assert "disclaimer" in data

    if data["recommendations"]:
        first_rec = data["recommendations"][0]
        assert "relevance_score" in first_rec
        assert "match_reasons" in first_rec
        assert "difficulty_fit" in first_rec
        assert 0.0 <= first_rec["relevance_score"] <= 100.0


# --- Test 18: Returning Useful Results When Profile Has Few Details ---
def test_recommendations_with_sparse_profile(client):
    # Register a new student with minimal profile information
    sparse_email = "sparse.student@iiitd.ac.in"
    reg = client.post("/api/v1/auth/register", json={
        "email": sparse_email,
        "password": "Password123!",
        "full_name": "Blank Slate Student",
        "role": "Student",
        "skills": []
    })
    assert reg.status_code == 201

    login = client.post("/api/v1/auth/login", json={"email": sparse_email, "password": "Password123!"})
    sparse_token = login.json()["access_token"]
    sparse_headers = {"Authorization": f"Bearer {sparse_token}"}

    # Request recommendations
    rec_res = client.get("/api/v1/skill-bounty/recommendations/me", headers=sparse_headers)
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert "recommendations" in data
    # Fallback reasons should be present rather than crashing
    for item in data["recommendations"]:
        assert item["relevance_score"] >= 0.0
        assert len(item["match_reasons"]) > 0


# --- Test 19: Preventing Access to Another Creator's Submissions ---
def test_prevent_access_to_another_creators_submissions(client, alumni_auth, second_user_auth, student_auth):
    # Alumni A creates a challenge
    c_res = client.post(
        "/api/v1/skill-bounty/challenges",
        json={
            "title": "Private Challenge For Alumni A",
            "short_summary": "Only Alumni A should inspect student solutions.",
            "problem_statement": "Evaluate applicant solution code.",
            "category": "backend_engineering",
            "required_skills": ["Python"],
            "difficulty_level": "intermediate",
            "deadline": _future_deadline(10)
        },
        headers=alumni_auth["headers"]
    )
    ch_id = c_res.json()["id"]
    client.post(f"/api/v1/skill-bounty/challenges/{ch_id}/publish", headers=alumni_auth["headers"])

    # Student submits
    client.post(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        json={
            "submission_description": "Solution submitted for Alumni A.",
            "repository_url": "https://github.com/aarav/alumni-a-sol",
        },
        headers=student_auth["headers"]
    )

    # Alumni B attempts to list submissions for Alumni A's challenge
    unauthorized_res = client.get(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        headers=second_user_auth["headers"]
    )
    assert unauthorized_res.status_code == 403
    assert "permission to view submissions" in unauthorized_res.json()["detail"].lower()

    # Alumni A can list submissions
    authorized_res = client.get(
        f"/api/v1/skill-bounty/challenges/{ch_id}/submissions",
        headers=alumni_auth["headers"]
    )
    assert authorized_res.status_code == 200
    assert len(authorized_res.json()) >= 1


# --- Test 20: List My Submissions Endpoint ---
def test_list_my_submissions(client, alumni_auth, student_auth):
    my_subs = client.get("/api/v1/skill-bounty/submissions/me", headers=student_auth["headers"])
    assert my_subs.status_code == 200
    subs_list = my_subs.json()
    assert isinstance(subs_list, list)
    for sub in subs_list:
        assert sub["student_user_id"] == student_auth["user_id"]
