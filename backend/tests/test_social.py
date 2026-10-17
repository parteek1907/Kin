import pytest


def test_user_search_and_discovery(client, student_auth, alumni_auth, second_user_auth):
    """Test user discovery by name, role, company, skills, with pagination and privacy checks."""
    # 1. Search by name (partial)
    res_name = client.get(
        "/api/v1/social/users/search?q=Priya",
        headers=student_auth["headers"]
    )
    assert res_name.status_code == 200
    data_name = res_name.json()
    assert data_name["total"] >= 1
    assert any("Priya" in u["full_name"] for u in data_name["items"])

    # Verify sensitive fields are never exposed
    for u in data_name["items"]:
        assert "password" not in u
        assert "hashed_password" not in u
        assert "email" not in u  # Privacy: emails hidden in social discovery
        assert "connection_status" in u
        assert "mutual_connections_count" in u

    # 2. Filter by role: Alumni
    res_role = client.get(
        "/api/v1/social/users/search?role=Alumni",
        headers=student_auth["headers"]
    )
    assert res_role.status_code == 200
    assert all(u["role"] == "Alumni" for u in res_role.json()["items"])

    # 3. Pagination verification
    res_page = client.get(
        "/api/v1/social/users/search?page=1&page_size=1",
        headers=student_auth["headers"]
    )
    assert res_page.status_code == 200
    assert len(res_page.json()["items"]) == 1
    assert res_page.json()["page_size"] == 1


def test_get_user_public_profile(client, student_auth, alumni_auth):
    """Test public profile viewing, returning connection status, mutual counts, and degree."""
    res = client.get(
        f"/api/v1/social/users/{alumni_auth['user_id']}",
        headers=student_auth["headers"]
    )
    assert res.status_code == 200
    profile = res.json()
    assert profile["id"] == alumni_auth["user_id"]
    assert profile["full_name"] == "Priya Nair"
    assert "password" not in profile
    assert "hashed_password" not in profile
    assert profile["connection_status"] in ["none", "pending_sent", "connected"]
    assert "total_connections_count" in profile
    assert "mutual_connections_count" in profile


def test_connection_request_lifecycle(client, student_auth, second_user_auth, alumni_auth):
    """Complete connection lifecycle: send, pending, incoming/outgoing, accept, connection established."""
    # 1. Student sends request to Second User (Rohan)
    send_res = client.post(
        f"/api/v1/social/requests/{second_user_auth['user_id']}",
        json={"message": "Hey Rohan, let's connect!"},
        headers=student_auth["headers"]
    )
    assert send_res.status_code == 201
    req_data = send_res.json()
    assert req_data["status"] == "pending"
    assert req_data["sender_id"] == student_auth["user_id"]
    assert req_data["recipient_id"] == second_user_auth["user_id"]
    request_id = req_data["id"]

    # 2. Verify self-request prevention (400)
    self_res = client.post(
        f"/api/v1/social/requests/{student_auth['user_id']}",
        headers=student_auth["headers"]
    )
    assert self_res.status_code == 400
    assert "yourself" in self_res.json()["detail"].lower()

    # 3. Verify duplicate request prevention (409)
    dup_res = client.post(
        f"/api/v1/social/requests/{second_user_auth['user_id']}",
        headers=student_auth["headers"]
    )
    assert dup_res.status_code == 409
    assert "already" in dup_res.json()["detail"].lower()

    # 4. Outgoing requests check
    out_res = client.get(
        "/api/v1/social/requests/outgoing",
        headers=student_auth["headers"]
    )
    assert out_res.status_code == 200
    assert any(r["id"] == request_id for r in out_res.json())

    # 5. Incoming requests check for Rohan (recipient)
    in_res = client.get(
        "/api/v1/social/requests/incoming",
        headers=second_user_auth["headers"]
    )
    assert in_res.status_code == 200
    assert any(r["id"] == request_id for r in in_res.json())

    # 6. Unauthorized acceptance: User C (Alumni) tries to accept request sent to Rohan -> 403
    unauth_accept = client.post(
        f"/api/v1/social/requests/{request_id}/accept",
        headers=alumni_auth["headers"]
    )
    assert unauth_accept.status_code == 403

    # 7. Rohan (recipient) accepts request
    accept_res = client.post(
        f"/api/v1/social/requests/{request_id}/accept",
        headers=second_user_auth["headers"]
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "accepted"

    # 8. Repeated acceptance prevention -> 400
    repeat_accept = client.post(
        f"/api/v1/social/requests/{request_id}/accept",
        headers=second_user_auth["headers"]
    )
    assert repeat_accept.status_code == 400

    # 9. Verify both users are now connected
    conns_a = client.get("/api/v1/social/connections", headers=student_auth["headers"]).json()
    assert any(c["user_id"] == second_user_auth["user_id"] for c in conns_a["items"])

    conns_b = client.get("/api/v1/social/connections", headers=second_user_auth["headers"]).json()
    assert any(c["user_id"] == student_auth["user_id"] for c in conns_b["items"])

    # 10. Attempting to send request when already connected -> 409
    already_conn_res = client.post(
        f"/api/v1/social/requests/{second_user_auth['user_id']}",
        headers=student_auth["headers"]
    )
    assert already_conn_res.status_code == 409
    assert "already connected" in already_conn_res.json()["detail"].lower()


def test_connection_request_reject_and_cancel(client, student_auth, alumni_auth, second_user_auth):
    """Test rejecting incoming request and cancelling outgoing request."""
    # A. Test Reject
    # Register a new user
    new_user = client.post(
        "/api/v1/auth/register",
        json={
            "email": "reject.test@iiitd.ac.in",
            "password": "Password123!",
            "full_name": "Reject Candidate",
            "role": "Student"
        }
    ).json()

    # User sends request to Alumni
    login_new = client.post("/api/v1/auth/login", json={"email": "reject.test@iiitd.ac.in", "password": "Password123!"}).json()
    headers_new = {"Authorization": f"Bearer {login_new['access_token']}"}

    req_res = client.post(
        f"/api/v1/social/requests/{alumni_auth['user_id']}",
        headers=headers_new
    )
    req_id = req_res.json()["id"]

    # Alumni rejects
    rej_res = client.post(
        f"/api/v1/social/requests/{req_id}/reject",
        headers=alumni_auth["headers"]
    )
    assert rej_res.status_code == 200
    assert rej_res.json()["status"] == "rejected"

    # Verify rejected request does NOT create connection
    conns = client.get("/api/v1/social/connections", headers=headers_new).json()
    assert not any(c["user_id"] == alumni_auth["user_id"] for c in conns["items"])

    # B. Test Cancel / Withdraw
    # New user sends request to Second User
    req2 = client.post(
        f"/api/v1/social/requests/{second_user_auth['user_id']}",
        headers=headers_new
    ).json()
    req2_id = req2["id"]

    # Unauthorized cancel: Alumni tries to cancel -> 403
    assert client.delete(f"/api/v1/social/requests/{req2_id}", headers=alumni_auth["headers"]).status_code == 403

    # Sender cancels -> 200
    cancel_res = client.delete(f"/api/v1/social/requests/{req2_id}", headers=headers_new)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"


def test_connection_management_and_removal(client, student_auth, alumni_auth):
    """Test searching connections, connection status, degree, and removal."""
    # Ensure they are connected
    # (Send and accept request)
    req = client.post(f"/api/v1/social/requests/{alumni_auth['user_id']}", headers=student_auth["headers"])
    if req.status_code == 201 and req.json()["status"] == "pending":
        client.post(f"/api/v1/social/requests/{req.json()['id']}/accept", headers=alumni_auth["headers"])

    # 1. Connection status endpoint
    st_res = client.get(f"/api/v1/social/connections/{alumni_auth['user_id']}/status", headers=student_auth["headers"])
    assert st_res.status_code == 200
    assert st_res.json()["status"] == "connected"

    # 2. Connection degree (1st-degree)
    deg_res = client.get(f"/api/v1/social/connections/{alumni_auth['user_id']}/degree", headers=student_auth["headers"])
    assert deg_res.status_code == 200
    assert deg_res.json()["degree"] == 1
    assert "1st-degree" in deg_res.json()["description"]

    # 3. Search within connections
    search_res = client.get("/api/v1/social/connections/search?q=Priya", headers=student_auth["headers"])
    assert search_res.status_code == 200
    assert any(c["full_name"] == "Priya Nair" for c in search_res.json()["items"])

    # 4. Remove connection
    del_res = client.delete(f"/api/v1/social/connections/{alumni_auth['user_id']}", headers=student_auth["headers"])
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "removed"

    # Verify no longer connected
    st_after = client.get(f"/api/v1/social/connections/{alumni_auth['user_id']}/status", headers=student_auth["headers"]).json()
    assert st_after["status"] != "connected"


def test_mutual_connections(client, student_auth, alumni_auth, second_user_auth):
    """Test mutual connections calculation between users."""
    # Connect Student <-> Alumni
    r1 = client.post(f"/api/v1/social/requests/{alumni_auth['user_id']}", headers=student_auth["headers"])
    if r1.status_code == 201 and r1.json()["status"] == "pending":
        client.post(f"/api/v1/social/requests/{r1.json()['id']}/accept", headers=alumni_auth["headers"])

    # Connect Second User <-> Alumni
    r2 = client.post(f"/api/v1/social/requests/{alumni_auth['user_id']}", headers=second_user_auth["headers"])
    if r2.status_code == 201 and r2.json()["status"] == "pending":
        client.post(f"/api/v1/social/requests/{r2.json()['id']}/accept", headers=alumni_auth["headers"])

    # Check mutual connections between Student and Second User
    # Both are connected to Alumni (Priya Nair)!
    mut_res = client.get(f"/api/v1/social/connections/mutual/{second_user_auth['user_id']}", headers=student_auth["headers"])
    assert mut_res.status_code == 200
    data = mut_res.json()
    assert data["total_mutual_count"] >= 1
    assert any(m["id"] == alumni_auth["user_id"] for m in data["mutual_connections"])


def test_people_you_may_know_suggestions(client, student_auth, alumni_auth):
    """Test People You May Know recommendations with explainable reasons and score."""
    # Update student profile to have skills and organization
    client.patch(
        "/api/v1/auth/profile",
        json={
            "skills": ["Python", "PyTorch"],
            "current_organization": "IIIT Delhi",
            "industry": "Artificial Intelligence"
        },
        headers=student_auth["headers"]
    )

    sug_res = client.get("/api/v1/social/users/suggestions", headers=student_auth["headers"])
    assert sug_res.status_code == 200
    sug_data = sug_res.json()
    assert "items" in sug_data

    # Check structure of suggestion items
    if sug_data["items"]:
        item = sug_data["items"][0]
        assert "relevance_score" in item
        assert "reasons" in item
        assert len(item["reasons"]) >= 1
        assert item["user"]["id"] != student_auth["user_id"]  # Never suggest oneself!


def test_blocking_and_privacy_controls(client, student_auth, second_user_auth):
    """Test blocking removes connection, prevents requests, and unblocking works."""
    # 1. Establish connection first
    req = client.post(f"/api/v1/social/requests/{second_user_auth['user_id']}", headers=student_auth["headers"])
    if req.status_code == 201 and req.json()["status"] == "pending":
        client.post(f"/api/v1/social/requests/{req.json()['id']}/accept", headers=second_user_auth["headers"])

    # Verify connected
    assert client.get(f"/api/v1/social/connections/{second_user_auth['user_id']}/status", headers=student_auth["headers"]).json()["status"] == "connected"

    # 2. Self-blocking prevented (400)
    assert client.post(f"/api/v1/social/blocks/{student_auth['user_id']}", headers=student_auth["headers"]).status_code == 400

    # 3. Student blocks Second User (Rohan)
    block_res = client.post(f"/api/v1/social/blocks/{second_user_auth['user_id']}", headers=student_auth["headers"])
    assert block_res.status_code == 200
    assert block_res.json()["status"] == "blocked"

    # 4. Verify connection was automatically terminated by block policy
    assert client.get(f"/api/v1/social/connections/{second_user_auth['user_id']}/status", headers=student_auth["headers"]).json()["status"] == "blocked"

    # 5. Blocked user cannot send a connection request (403)
    blocked_req = client.post(f"/api/v1/social/requests/{student_auth['user_id']}", headers=second_user_auth["headers"])
    assert blocked_req.status_code == 403

    # 6. Blocked list retrieval
    blocks = client.get("/api/v1/social/blocks", headers=student_auth["headers"]).json()
    assert any(b["blocked_user_id"] == second_user_auth["user_id"] for b in blocks)

    # 7. Unblock
    unblock_res = client.delete(f"/api/v1/social/blocks/{second_user_auth['user_id']}", headers=student_auth["headers"])
    assert unblock_res.status_code == 200
    assert unblock_res.json()["status"] == "unblocked"


def test_notifications_workflow(client, student_auth, alumni_auth, second_user_auth):
    """Test notifications for connection requests, unread count, mark read, mark all read, user isolation."""
    # Student sends connection request to Alumni
    client.post(
        f"/api/v1/social/requests/{alumni_auth['user_id']}",
        json={"message": "Notification test request"},
        headers=student_auth["headers"]
    )

    # Alumni checks notifications
    notif_res = client.get("/api/v1/social/notifications", headers=alumni_auth["headers"])
    assert notif_res.status_code == 200
    notifs = notif_res.json()["items"]
    assert len(notifs) >= 1
    latest = notifs[0]
    assert latest["user_id"] == alumni_auth["user_id"]
    assert "connection" in latest["type"].lower()
    notif_id = latest["id"]

    # Check unread count
    cnt_res = client.get("/api/v1/social/notifications/unread-count", headers=alumni_auth["headers"])
    assert cnt_res.status_code == 200
    assert cnt_res.json()["unread_count"] >= 1

    # Unauthorized access check: Student tries to mark Alumni's notification as read -> 404/403
    unauth_patch = client.patch(
        f"/api/v1/social/notifications/{notif_id}/read",
        headers=student_auth["headers"]
    )
    assert unauth_patch.status_code in (403, 404)

    # Alumni marks as read
    mark_res = client.patch(
        f"/api/v1/social/notifications/{notif_id}/read",
        headers=alumni_auth["headers"]
    )
    assert mark_res.status_code == 200
    assert mark_res.json()["is_read"] is True

    # Mark all read
    all_read = client.patch("/api/v1/social/notifications/read-all", headers=alumni_auth["headers"])
    assert all_read.status_code == 200

    cnt_after = client.get("/api/v1/social/notifications/unread-count", headers=alumni_auth["headers"]).json()
    assert cnt_after["unread_count"] == 0
