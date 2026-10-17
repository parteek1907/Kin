from datetime import date


def test_career_journey_creation(client, alumni_auth):
    """Test 6: Authorized user can create a valid career journey record."""
    payload = {
        "job_title": "Machine Learning Engineer",
        "company": "Anthropic",
        "industry": "Artificial Intelligence",
        "start_date": "2023-01-15",
        "end_date": None,
        "is_current": True,
        "description": "Leading model evaluation and fine-tuning pipelines.",
        "skills_used": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
        "projects_or_achievements": [
            "Optimized inference throughput by 35% using TensorRT",
            "Built automated evaluation pipeline with 99.8% uptime"
        ],
        "career_transition_notes": "Transitioned from Software Engineer by contributing to open-source LLM libraries.",
        "visibility": "public"
    }
    response = client.post(
        "/api/v1/career-time-machine/journeys",
        json=payload,
        headers=alumni_auth["headers"]
    )
    assert response.status_code == 201
    data = response.json()
    assert data["job_title"] == "Machine Learning Engineer"
    assert data["company"] == "Anthropic"
    assert data["is_current"] is True
    assert data["user_id"] == alumni_auth["user_id"]
    assert "PyTorch" in data["skills_used"]
    assert len(data["projects_or_achievements"]) == 2
    assert data["author_name"] == "Priya Nair"


def test_retrieve_user_own_journeys(client, alumni_auth):
    """Test 7: Authenticated user can retrieve their own submitted career journeys."""
    # Create journey 1
    j1 = {
        "job_title": "Junior ML Developer",
        "company": "DeepTech Labs",
        "industry": "Artificial Intelligence",
        "start_date": "2021-06-01",
        "end_date": "2022-12-31",
        "is_current": False,
        "skills_used": ["Python", "Scikit-Learn"],
        "visibility": "public"
    }
    client.post("/api/v1/career-time-machine/journeys", json=j1, headers=alumni_auth["headers"])

    # Fetch /journeys/me
    response = client.get("/api/v1/career-time-machine/journeys/me", headers=alumni_auth["headers"])
    assert response.status_code == 200
    journeys = response.json()
    assert len(journeys) >= 1
    assert any(j["company"] == "DeepTech Labs" for j in journeys)


def test_invalid_date_range_rejection(client, alumni_auth):
    """Test 8: System rejects career records where end_date is before start_date."""
    payload = {
        "job_title": "Data Scientist",
        "company": "Invalid Dates Inc",
        "industry": "Analytics",
        "start_date": "2023-01-01",
        "end_date": "2022-01-01",  # Invalid: 1 year prior to start
        "is_current": False,
        "skills_used": ["Python"],
        "visibility": "public"
    }
    response = client.post(
        "/api/v1/career-time-machine/journeys",
        json=payload,
        headers=alumni_auth["headers"]
    )
    assert response.status_code in (400, 422)


def test_unauthorized_modification_prevention(client, alumni_auth, second_user_auth):
    """Test 9: User B cannot modify a career journey owned by User A (403 Forbidden)."""
    # User A creates a journey
    create_res = client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "AI Researcher",
            "company": "FairAI Org",
            "industry": "Artificial Intelligence",
            "start_date": "2022-01-01",
            "is_current": True,
            "skills_used": ["Python", "PyTorch"],
            "visibility": "public"
        },
        headers=alumni_auth["headers"]
    )
    journey_id = create_res.json()["id"]

    # User B attempts to patch User A's journey
    patch_res = client.post if False else client.patch(
        f"/api/v1/career-time-machine/journeys/{journey_id}",
        json={"job_title": "Hacked Title"},
        headers=second_user_auth["headers"]
    )
    assert patch_res.status_code == 403
    assert "permission" in patch_res.json()["detail"].lower()


def test_unauthorized_deletion_prevention(client, alumni_auth, second_user_auth):
    """Test 10: User B cannot delete a career journey owned by User A (403 Forbidden)."""
    # User A creates a journey
    create_res = client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "Platform Engineer",
            "company": "SecureNet",
            "industry": "Cloud Computing",
            "start_date": "2021-01-01",
            "is_current": True,
            "visibility": "public"
        },
        headers=alumni_auth["headers"]
    )
    journey_id = create_res.json()["id"]

    # User B attempts to delete User A's journey
    del_res = client.delete(
        f"/api/v1/career-time-machine/journeys/{journey_id}",
        headers=second_user_auth["headers"]
    )
    assert del_res.status_code == 403
    assert "permission" in del_res.json()["detail"].lower()


def test_career_exploration_filtering(client, alumni_auth):
    """Test 11: Explore endpoint filters accurately by job title, industry, and skills."""
    # Seed specific journeys
    client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "Bioinformatics Specialist",
            "company": "Genomics Lab",
            "industry": "HealthTech",
            "start_date": "2022-03-01",
            "skills_used": ["Python", "BioPython", "R"],
            "visibility": "public"
        },
        headers=alumni_auth["headers"]
    )
    client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "Quantitative Researcher",
            "company": "Alpha Capital",
            "industry": "FinTech",
            "start_date": "2022-03-01",
            "skills_used": ["C++", "Python", "Stochastic Calculus"],
            "visibility": "public"
        },
        headers=alumni_auth["headers"]
    )

    # Filter by industry: HealthTech
    res_ind = client.get("/api/v1/career-time-machine/explore?industry=HealthTech")
    assert res_ind.status_code == 200
    items_ind = res_ind.json()["items"]
    assert any(j["industry"] == "HealthTech" for j in items_ind)
    assert not any(j["industry"] == "FinTech" for j in items_ind)

    # Filter by skill: BioPython
    res_skill = client.get("/api/v1/career-time-machine/explore?skill=BioPython")
    assert res_skill.status_code == 200
    items_skill = res_skill.json()["items"]
    assert len(items_skill) >= 1
    assert all("BioPython" in j["skills_used"] for j in items_skill)


def test_chronological_timeline_ordering(client, alumni_auth):
    """Test 12: Timeline endpoint returns stages strictly ordered by start_date ascending."""
    # Insert 3 stages in non-chronological order
    stage_latest = {
        "job_title": "Principal Architect",
        "company": "Tech Corp",
        "industry": "Tech",
        "start_date": "2024-01-01",
        "is_current": True,
        "visibility": "public"
    }
    stage_earliest = {
        "job_title": "Software Intern",
        "company": "Startup Co",
        "industry": "Tech",
        "start_date": "2020-01-01",
        "end_date": "2020-06-30",
        "is_current": False,
        "visibility": "public"
    }
    stage_middle = {
        "job_title": "Software Engineer",
        "company": "Startup Co",
        "industry": "Tech",
        "start_date": "2020-07-01",
        "end_date": "2023-12-31",
        "is_current": False,
        "visibility": "public"
    }

    client.post("/api/v1/career-time-machine/journeys", json=stage_latest, headers=alumni_auth["headers"])
    client.post("/api/v1/career-time-machine/journeys", json=stage_earliest, headers=alumni_auth["headers"])
    res_mid = client.post("/api/v1/career-time-machine/journeys", json=stage_middle, headers=alumni_auth["headers"])
    journey_id = res_mid.json()["id"]

    # Request timeline using journey_id
    timeline_res = client.get(f"/api/v1/career-time-machine/journeys/{journey_id}/timeline")
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    stages = timeline_data["stages"]
    assert len(stages) >= 3

    # Check chronological ordering
    start_dates = [s["start_date"] for s in stages]
    assert start_dates == sorted(start_dates), f"Stages not chronological: {start_dates}"


def test_skill_gap_analysis(client, alumni_auth):
    """Test 13: Skill gap analysis compares student skills against real alumni records."""
    # Seed an ML role with verified skills and projects
    ml_seed = {
        "job_title": "Senior ML Engineer",
        "company": "Hugging Face",
        "industry": "Artificial Intelligence",
        "start_date": "2023-01-01",
        "is_current": True,
        "skills_used": ["Python", "PyTorch", "Transformers", "Kubernetes", "MLOps"],
        "projects_or_achievements": [
            "Designed distributed transformer training cluster saving 40% compute costs"
        ],
        "career_transition_notes": "Focused heavily on mastering PyTorch and distributed training.",
        "visibility": "public"
    }
    client.post("/api/v1/career-time-machine/journeys", json=ml_seed, headers=alumni_auth["headers"])

    # Student requests skill-gap analysis
    gap_request = {
        "target_role": "Senior ML Engineer",
        "current_skills": ["Python", "SQL"]  # Knows Python, lacks PyTorch, Transformers, Kubernetes, MLOps
    }
    response = client.post("/api/v1/career-time-machine/skill-gap", json=gap_request)
    assert response.status_code == 200
    data = response.json()

    assert data["target_role"] == "Senior ML Engineer"
    assert "Python" in data["matching_skills"]
    assert "PyTorch" in data["potential_skill_gaps"]
    assert "Kubernetes" in data["potential_skill_gaps"]
    assert data["analyzed_records_count"] >= 1

    # Check priority items
    priorities = {p["skill"]: p["priority"] for p in data["suggested_priorities"]}
    assert "PyTorch" in priorities
    assert priorities["PyTorch"] == "High"

    # Verify real project evidence is returned
    assert len(data["relevant_projects_or_experiences"]) >= 1
    assert any("transformer" in p["project_or_achievement"].lower() for p in data["relevant_projects_or_experiences"])

    # Verify disclaimer is attached
    assert "not guaranteed" in data["disclaimer"].lower() or "historical" in data["disclaimer"].lower()


def test_visibility_and_privacy_enforcement(client, alumni_auth, student_auth):
    """Test 14: Private records are strictly hidden from others; network_only requires login."""
    # 1. Create a private record for Alumni
    priv_res = client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "Stealth Co-Founder",
            "company": "Confidential Stealth Venture",
            "industry": "Confidential",
            "start_date": "2024-01-01",
            "is_current": True,
            "visibility": "private"
        },
        headers=alumni_auth["headers"]
    )
    priv_id = priv_res.json()["id"]

    # 2. Create a network_only record for Alumni
    net_res = client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "Internal Advisory Fellow",
            "company": "IIITD Research Park",
            "industry": "Academia",
            "start_date": "2023-01-01",
            "is_current": True,
            "visibility": "network_only"
        },
        headers=alumni_auth["headers"]
    )
    net_id = net_res.json()["id"]

    # Unauthenticated visitor tries to view private -> 403
    assert client.get(f"/api/v1/career-time-machine/journeys/{priv_id}").status_code == 403

    # Student (logged in) tries to view private -> 403
    assert client.get(f"/api/v1/career-time-machine/journeys/{priv_id}", headers=student_auth["headers"]).status_code == 403

    # Author (Alumni) views private -> 200 OK
    assert client.get(f"/api/v1/career-time-machine/journeys/{priv_id}", headers=alumni_auth["headers"]).status_code == 200

    # Unauthenticated visitor tries to view network_only -> 401
    assert client.get(f"/api/v1/career-time-machine/journeys/{net_id}").status_code == 401

    # Student (logged in) views network_only -> 200 OK
    assert client.get(f"/api/v1/career-time-machine/journeys/{net_id}", headers=student_auth["headers"]).status_code == 200


def test_empty_results_when_no_career_data_exists(client):
    """Test 15: System returns honest empty results without fabricating data when records do not exist."""
    # 1. Explore non-existent role
    exp_res = client.get("/api/v1/career-time-machine/explore?target_title=NonExistentUnderwaterWelderRole")
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert exp_data["total"] == 0
    assert exp_data["items"] == []

    # 2. Skill gap on non-existent role
    gap_res = client.post(
        "/api/v1/career-time-machine/skill-gap",
        json={
            "target_role": "NonExistentUnderwaterWelderRole",
            "current_skills": ["Python"]
        }
    )
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert gap_data["analyzed_records_count"] == 0
    assert gap_data["potential_skill_gaps"] == []
    assert "no matching historical career records" in gap_data["disclaimer"].lower()


def test_operation_without_ai_api_key(client, alumni_auth):
    """Test 16: Insights and skill gap analysis function deterministically without an AI API key."""
    # Seed data
    client.post(
        "/api/v1/career-time-machine/journeys",
        json={
            "job_title": "DevOps Engineer",
            "company": "CloudScale",
            "industry": "Infrastructure",
            "start_date": "2022-01-01",
            "is_current": True,
            "skills_used": ["Terraform", "AWS", "Docker", "Linux"],
            "visibility": "public"
        },
        headers=alumni_auth["headers"]
    )

    # Request insights
    response = client.get("/api/v1/career-time-machine/insights?query=DevOps")
    assert response.status_code == 200
    data = response.json()
    assert data["ai_enhanced"] is False
    assert data["total_journeys_analyzed"] >= 1
    assert len(data["observed_facts"]) >= 1
    assert "methodology" in data
    assert any("DevOps" in fact or "CloudScale" in fact or "Terraform" in str(data["in_demand_skills"]) for fact in data["observed_facts"])
