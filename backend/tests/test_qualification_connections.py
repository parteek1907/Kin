import pytest


def test_create_policy_success(client, alumni_auth):
    """Test 1: Professional can create a connection policy with default auto_accept disabled."""
    payload = {
        "policy_name": "ML Mentorship & Networking Policy",
        "required_skills": ["Python", "Machine Learning"],
        "preferred_skills": ["PyTorch", "MLOps"],
        "relevant_industries": ["Artificial Intelligence"],
        "min_project_count": 2,
        "min_years_experience": 1.0,
        "qualification_requirements": ["B.Tech", "M.S."],
        # auto_accept_enabled defaults to False
    }
    response = client.post(
        "/api/v1/qualification-connections/policies",
        json=payload,
        headers=alumni_auth["headers"]
    )
    assert response.status_code == 201
    data = response.json()
    assert data["policy_name"] == "ML Mentorship & Networking Policy"
    assert data["auto_accept_enabled"] is False  # Test 7: Disabled by default
    assert data["is_active"] is True
    assert "Python" in data["required_skills"]
    assert data["min_project_count"] == 2
    assert data["user_id"] == alumni_auth["user_id"]


def test_update_and_delete_own_policy(client, alumni_auth):
    """Test 2: User can update and delete their own connection policy."""
    # Create policy
    create_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Initial Policy",
            "required_skills": ["Java"],
            "auto_accept_enabled": False
        },
        headers=alumni_auth["headers"]
    )
    policy_id = create_res.json()["id"]

    # Update policy (enable auto-accept)
    patch_res = client.patch(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        json={
            "policy_name": "Updated Policy",
            "auto_accept_enabled": True
        },
        headers=alumni_auth["headers"]
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["policy_name"] == "Updated Policy"
    assert patch_res.json()["auto_accept_enabled"] is True

    # Delete policy
    del_res = client.delete(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        headers=alumni_auth["headers"]
    )
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        headers=alumni_auth["headers"]
    )
    assert get_res.status_code == 404


def test_prevent_access_to_another_users_policy(client, alumni_auth, second_user_auth):
    """Test 3: User B cannot view, modify, or delete User A's policy (403 Forbidden)."""
    # User A creates a policy
    create_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "User A Private Policy",
            "required_skills": ["Rust"]
        },
        headers=alumni_auth["headers"]
    )
    policy_id = create_res.json()["id"]

    # User B tries to view
    assert client.get(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        headers=second_user_auth["headers"]
    ).status_code == 403

    # User B tries to patch
    assert client.patch(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        json={"policy_name": "Compromised Policy"},
        headers=second_user_auth["headers"]
    ).status_code == 403

    # User B tries to delete
    assert client.delete(
        f"/api/v1/qualification-connections/policies/{policy_id}",
        headers=second_user_auth["headers"]
    ).status_code == 403


def test_evaluate_request_satisfies_all_mandatory_criteria(client, alumni_auth, student_auth):
    """Test 4: Candidate satisfying all mandatory criteria is evaluated as qualified."""
    # 1. Update student profile to satisfy criteria
    client.patch(
        "/api/v1/auth/profile",
        json={
            "skills": ["Python", "Machine Learning", "PyTorch"],
            "industry": "Artificial Intelligence",
            "years_of_experience": 1.5,
            "education": ["B.Tech Computer Science, IIITD"]
        },
        headers=student_auth["headers"]
    )
    # Add journey with 2 projects to student portfolio
    client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "ML Intern",
            "company": "AI StartUp",
            "industry": "Artificial Intelligence",
            "start_date": "2023-01-01",
            "projects_or_achievements": [
                "Built transformer fine-tuning pipeline",
                "Deployed ONNX model to edge devices"
            ],
            "skills_used": ["Python", "Machine Learning"],
            "visibility": "public"
        },
        headers=student_auth["headers"]
    )

    # 2. Alumni creates policy with auto_accept_enabled = True
    policy_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Strict ML Policy",
            "required_skills": ["Python", "Machine Learning"],
            "preferred_skills": ["PyTorch"],
            "relevant_industries": ["Artificial Intelligence"],
            "min_project_count": 2,
            "min_years_experience": 1.0,
            "qualification_requirements": ["B.Tech"],
            "auto_accept_enabled": True
        },
        headers=alumni_auth["headers"]
    )
    policy_id = policy_res.json()["id"]

    # 3. Evaluate student against alumni's policy
    eval_res = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={
            "policy_id": policy_id,
            "candidate_user_id": student_auth["user_id"]
        },
        headers=alumni_auth["headers"]
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["eligibility_status"] == "qualified"
    assert data["auto_accept_eligible"] is True
    assert data["manual_review_required"] is False
    assert data["match_score"] >= 80.0
    assert len(data["criteria_not_satisfied"]) == 0


def test_evaluate_request_fails_mandatory_criterion(client, alumni_auth, second_user_auth):
    """Test 5: Candidate missing a mandatory skill fails automatic qualification."""
    # Second user lacks "Machine Learning" (has only SQL, Apache Spark, Python)
    policy_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "ML Required Policy",
            "required_skills": ["Machine Learning", "Deep Learning"],
            "auto_accept_enabled": True
        },
        headers=alumni_auth["headers"]
    )
    policy_id = policy_res.json()["id"]

    eval_res = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={
            "policy_id": policy_id,
            "candidate_user_id": second_user_auth["user_id"]
        },
        headers=alumni_auth["headers"]
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["eligibility_status"] == "not_qualified"
    assert data["auto_accept_eligible"] is False
    assert data["manual_review_required"] is True
    assert any("Deep Learning" in err for err in data["criteria_not_satisfied"])


def test_handling_missing_profile_information(client, alumni_auth):
    """Test 6: Incomplete candidate profile marks criteria as missing rather than assuming satisfied."""
    # Register an empty profile user
    empty_user = client.post(
        "/api/v1/auth/register",
        json={
            "email": "empty.profile@iiitd.ac.in",
            "password": "Password123!",
            "full_name": "Blank Slate",
            "role": "Student"
        }
    ).json()

    policy_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Experience & Project Policy",
            "required_skills": ["Golang"],
            "min_project_count": 3,
            "min_years_experience": 2.0,
            "auto_accept_enabled": True
        },
        headers=alumni_auth["headers"]
    )
    policy_id = policy_res.json()["id"]

    eval_res = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={
            "policy_id": policy_id,
            "candidate_user_id": empty_user["id"]
        },
        headers=alumni_auth["headers"]
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["auto_accept_eligible"] is False
    assert len(data["missing_information"]) > 0
    assert any("skills" in msg.lower() for msg in data["missing_information"])


def test_disabled_policy_cannot_trigger_auto_acceptance(client, alumni_auth, student_auth):
    """Test 8: Inactive or disabled policy never auto-accepts; leaves request pending for manual review."""
    # Update student profile with required skills
    client.patch(
        "/api/v1/auth/profile",
        json={"skills": ["Python", "Kubernetes"]},
        headers=student_auth["headers"]
    )

    # Alumni creates an INACTIVE policy with auto_accept_enabled=True
    policy_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Inactive Policy",
            "required_skills": ["Python"],
            "auto_accept_enabled": True,
            "is_active": False  # Inactive!
        },
        headers=alumni_auth["headers"]
    )
    policy_id = policy_res.json()["id"]

    eval_res = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={
            "policy_id": policy_id,
            "candidate_user_id": student_auth["user_id"]
        },
        headers=alumni_auth["headers"]
    )
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["auto_accept_eligible"] is False
    assert data["manual_review_required"] is True


def test_auto_acceptance_flow_and_prevent_duplicate_requests(client, alumni_auth, student_auth):
    """Tests 9, 10, 13: Auto acceptance flow, duplicate prevention, and existing connection handling."""
    # Configure student profile
    client.patch(
        "/api/v1/auth/profile",
        json={"skills": ["Python", "Data Science", "SQL"]},
        headers=student_auth["headers"]
    )

    # Configure alumni policy: auto_accept_enabled = True
    client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Auto Connect Data Policy",
            "required_skills": ["Python"],
            "auto_accept_enabled": True,
            "is_active": True
        },
        headers=alumni_auth["headers"]
    )

    # Student sends connection request to Alumni
    req_res = client.post(
        "/api/v1/qualification-connections/requests",
        json={
            "recipient_id": alumni_auth["user_id"],
            "message": "Hi Priya, would love to connect and learn about your ML journey!"
        },
        headers=student_auth["headers"]
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    assert req_data["status"] == "accepted"
    assert req_data["auto_accepted"] is True

    # Verify connection was established
    conns_res = client.get(
        "/api/v1/qualification-connections/connections/me",
        headers=student_auth["headers"]
    )
    assert conns_res.status_code == 200
    connections = conns_res.json()
    assert any(c["connected_user_id"] == alumni_auth["user_id"] for c in connections)

    # Test 13: Attempting to connect when already connected -> 409 Conflict
    dup_conn_res = client.post(
        "/api/v1/qualification-connections/requests",
        json={"recipient_id": alumni_auth["user_id"]},
        headers=student_auth["headers"]
    )
    assert dup_conn_res.status_code == 409
    assert "already connected" in dup_conn_res.json()["detail"].lower()


def test_manual_review_flow_and_duplicate_pending_prevention(client, alumni_auth, second_user_auth):
    """Test 10 & manual review: When auto-accept disabled, request is pending and duplicate is rejected."""
    # Alumni creates policy with auto_accept_enabled = False (Manual Review)
    client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Manual Review Policy",
            "required_skills": ["SQL"],
            "auto_accept_enabled": False,
            "is_active": True
        },
        headers=alumni_auth["headers"]
    )

    # User B sends request
    req1 = client.post(
        "/api/v1/qualification-connections/requests",
        json={
            "recipient_id": alumni_auth["user_id"],
            "message": "Let's connect regarding Big Data architecture"
        },
        headers=second_user_auth["headers"]
    )
    assert req1.status_code == 201
    assert req1.json()["status"] == "pending"
    assert req1.json()["auto_accepted"] is False

    # Test 10: User B tries to send a second duplicate request while first is pending -> 409 Conflict
    req2 = client.post(
        "/api/v1/qualification-connections/requests",
        json={"recipient_id": alumni_auth["user_id"]},
        headers=second_user_auth["headers"]
    )
    assert req2.status_code == 409
    assert "already exists" in req2.json()["detail"].lower()


def test_prevent_unauthorized_acceptance(client, alumni_auth, student_auth, second_user_auth):
    """Test 11: User C cannot accept a request intended for User A."""
    # Student sends request to Alumni
    # (Alumni policy has auto_accept disabled)
    client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Review Only",
            "auto_accept_enabled": False
        },
        headers=alumni_auth["headers"]
    )
    req_res = client.post(
        "/api/v1/qualification-connections/requests",
        json={"recipient_id": alumni_auth["user_id"]},
        headers=student_auth["headers"]
    )
    request_id = req_res.json()["id"]

    # Second user (User C) tries to accept request sent to Alumni (User A) -> 403 Forbidden
    unauth_res = client.post(
        f"/api/v1/qualification-connections/requests/{request_id}/respond",
        json={"action": "accept"},
        headers=second_user_auth["headers"]
    )
    assert unauth_res.status_code == 403
    assert "not authorized" in unauth_res.json()["detail"].lower()

    # Intended recipient (Alumni) accepts -> 200 OK
    auth_res = client.post(
        f"/api/v1/qualification-connections/requests/{request_id}/respond",
        json={"action": "accept"},
        headers=alumni_auth["headers"]
    )
    assert auth_res.status_code == 200
    assert auth_res.json()["status"] == "accepted"


def test_consistent_evaluation_explanations(client, alumni_auth, student_auth):
    """Test 12: Evaluation generates consistent, transparent explanations."""
    policy_res = client.post(
        "/api/v1/qualification-connections/policies",
        json={
            "policy_name": "Standard AI Policy",
            "required_skills": ["Python"],
            "preferred_skills": ["TensorFlow"],
            "auto_accept_enabled": True
        },
        headers=alumni_auth["headers"]
    )
    policy_id = policy_res.json()["id"]

    eval1 = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={"policy_id": policy_id, "candidate_user_id": student_auth["user_id"]},
        headers=alumni_auth["headers"]
    ).json()

    eval2 = client.post(
        "/api/v1/qualification-connections/evaluate",
        json={"policy_id": policy_id, "candidate_user_id": student_auth["user_id"]},
        headers=alumni_auth["headers"]
    ).json()

    # Assert deterministic and identical output
    assert eval1["match_score"] == eval2["match_score"]
    assert eval1["eligibility_status"] == eval2["eligibility_status"]
    assert eval1["explanation"] == eval2["explanation"]
    assert "Policy Evaluation" in eval1["explanation"]
    assert "disclaimer" in eval1
