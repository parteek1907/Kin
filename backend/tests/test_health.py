def test_health_check_returns_healthy(client):
    """Test 1: Application health check endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "version" in data
    assert "project" in data


def test_root_discovery_endpoint(client):
    """Verify root discovery endpoint is accessible and references documentation."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "/docs" in data["docs_url"]
    assert "/health" in data["health_check"]


def test_openapi_docs_accessible(client):
    """Verify FastAPI generates valid OpenAPI schema."""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert "/health" in data["paths"] or "/api/v1/auth/register" in data["paths"]
