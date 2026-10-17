import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, get_db
from app.main import app

# Test in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables in memory once for the test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """Provides a transactional database session rolled back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    """Provides a FastAPI TestClient with the database dependency overridden."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def student_auth(client):
    """Registers and authenticates a test student user."""
    reg_data = {
        "email": "student@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Aarav Sharma",
        "role": "Student",
        "headline": "CS Undergrad at IIITD",
        "skills": ["Python", "Data Structures"],
        "industry": "Information Technology"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@iiitd.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": "student@iiitd.ac.in"
    }


@pytest.fixture
def alumni_auth(client):
    """Registers and authenticates a test alumni user."""
    reg_data = {
        "email": "alumni@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Priya Nair",
        "role": "Alumni",
        "headline": "Senior ML Engineer at Anthropic",
        "skills": ["Python", "PyTorch", "Kubernetes", "Transformers"],
        "industry": "Artificial Intelligence"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "alumni@iiitd.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": "alumni@iiitd.ac.in"
    }


@pytest.fixture
def second_user_auth(client):
    """Registers and authenticates a second test alumni user for authorization tests."""
    reg_data = {
        "email": "second.user@iiitd.ac.in",
        "password": "Password123!",
        "full_name": "Rohan Gupta",
        "role": "Alumni",
        "headline": "Staff Data Engineer",
        "skills": ["SQL", "Apache Spark", "Python"],
        "industry": "Big Data"
    }
    client.post("/api/v1/auth/register", json=reg_data)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "second.user@iiitd.ac.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    return {
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": "second.user@iiitd.ac.in"
    }
