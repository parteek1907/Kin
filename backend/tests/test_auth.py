def test_user_registration_success(client):
    """Test 2: User registration creates active user with profile and role."""
    payload = {
        "email": "new.student@iiitd.ac.in",
        "password": "SecurePassword123!",
        "full_name": "Siddharth Verma",
        "role": "Student",
        "headline": "Junior year CS student",
        "skills": ["C++", "Python", "Algorithms"],
        "industry": "Software Engineering"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new.student@iiitd.ac.in"
    assert data["is_active"] is True
    assert "id" in data
    assert "hashed_password" not in data  # Never expose hashed passwords
    assert data["profile"]["full_name"] == "Siddharth Verma"
    assert data["profile"]["role"] == "Student"
    assert "Python" in data["profile"]["skills"]


def test_duplicate_email_rejection(client):
    """Test 3: System rejects duplicate email registrations with HTTP 409 Conflict."""
    payload = {
        "email": "duplicate.test@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Test User",
        "role": "Alumni"
    }
    # First registration
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with exact same email
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


def test_login_and_jwt_authentication(client):
    """Test 4: Login with valid credentials returns a valid JWT access token."""
    reg_payload = {
        "email": "login.test@iiitd.ac.in",
        "password": "CorrectPassword123!",
        "full_name": "Login Tester",
        "role": "Founder"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "login.test@iiitd.ac.in",
        "password": "CorrectPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login.test@iiitd.ac.in"


def test_login_invalid_credentials_rejected(client):
    """Test login failure with incorrect password returns 401."""
    reg_payload = {
        "email": "wrongpwd.test@iiitd.ac.in",
        "password": "CorrectPassword123!",
        "full_name": "Wrong Pwd Tester",
        "role": "Student"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrongpwd.test@iiitd.ac.in",
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_unauthorized_access_rejection(client):
    """Test 5: Protected endpoints reject requests with missing or invalid tokens."""
    # Missing token
    res_no_token = client.get("/api/v1/auth/me")
    assert res_no_token.status_code == 401

    # Invalid / garbage token
    res_bad_token = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.garbage.token"}
    )
    assert res_bad_token.status_code == 401


def test_authenticated_user_profile_retrieval_and_update(client, student_auth):
    """Verify authenticated user can fetch /me and update their profile."""
    # Fetch /me
    me_res = client.get("/api/v1/auth/me", headers=student_auth["headers"])
    assert me_res.status_code == 200
    assert me_res.json()["email"] == student_auth["email"]

    # Update profile
    patch_payload = {
        "headline": "Updated Headline: Future ML Researcher",
        "skills": ["Python", "FastAPI", "SQLAlchemy", "PyTorch"],
        "years_of_experience": 1.5
    }
    patch_res = client.patch(
        "/api/v1/auth/profile",
        json=patch_payload,
        headers=student_auth["headers"]
    )
    assert patch_res.status_code == 200
    updated_profile = patch_res.json()
    assert updated_profile["headline"] == "Updated Headline: Future ML Researcher"
    assert "FastAPI" in updated_profile["skills"]
    assert updated_profile["years_of_experience"] == 1.5


def test_invalid_role_escalation_rejected(client, student_auth):
    """Verify users cannot set arbitrary or admin roles."""
    patch_payload = {
        "role": "SuperAdministrator"
    }
    patch_res = client.patch(
        "/api/v1/auth/profile",
        json=patch_payload,
        headers=student_auth["headers"]
    )
    assert patch_res.status_code in (400, 422)
