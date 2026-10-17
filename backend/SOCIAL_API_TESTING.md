# Social Networking & Connection Management API - Testing Checklist

This guide provides an endpoint-by-endpoint checklist and testing flow for the **LinkedIn-style Social Networking & Connection Management System** on Conduit Backend.

---

## 1. Environment & Setup

- **Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Header for Protected Endpoints**: `Authorization: Bearer <jwt_access_token>`

---

## 2. Test User Setup

Before testing social interactions, register and authenticate two test users:

### User A (Student)
- **Register**: `POST /api/v1/auth/register`
  ```json
  {
    "email": "aarav.sharma@iiitd.ac.in",
    "password": "Password123!",
    "full_name": "Aarav Sharma",
    "role": "Student",
    "institution": "IIIT Delhi",
    "department": "Computer Science",
    "graduation_year": 2026,
    "skills": ["Python", "FastAPI", "Machine Learning"]
  }
  ```
- **Login**: `POST /api/v1/auth/login` (retrieve `access_token` as `TOKEN_A`)

### User B (Alumni / Senior Professional)
- **Register**: `POST /api/v1/auth/register`
  ```json
  {
    "email": "priya.nair@anthropic.alumni.org",
    "password": "Password123!",
    "full_name": "Priya Nair",
    "role": "Alumni",
    "institution": "IIIT Delhi",
    "department": "Computer Science",
    "graduation_year": 2022,
    "current_organization": "Anthropic",
    "job_title": "Member of Technical Staff",
    "industry": "Artificial Intelligence",
    "skills": ["Python", "PyTorch", "Distributed Systems", "Machine Learning"]
  }
  ```
- **Login**: `POST /api/v1/auth/login` (retrieve `access_token` as `TOKEN_B`)

---

## 3. Endpoint-by-Endpoint Testing Checklist

### 1. User Discovery & Search

- [ ] **Search Users with Query and Filters**
  - **Method**: `GET /api/v1/social/users/search?q=Priya&role=Alumni&institution=IIIT%20Delhi&page=1&page_size=10`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns `Priya Nair` profile with safe public fields. Sensitive fields (`hashed_password`, email, tokens) are never exposed.

- [ ] **View Public Profile**
  - **Method**: `GET /api/v1/social/users/{user_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns User B's public profile, connection count, mutual connections count, and mutual connection preview.

- [ ] **People You May Know Recommendations**
  - **Method**: `GET /api/v1/social/users/suggestions?page=1&page_size=10`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns User B with an explainable breakdown:
    - `"shared_institution": "IIIT Delhi"`
    - `"shared_department": "Computer Science"`
    - `"shared_skills": ["Python", "Machine Learning"]`
    - `"explanation": "Suggested because you studied at the same institution, share 2 skills."`

---

### 2. Connection Request Lifecycle

- [ ] **Self-Connection Prevention**
  - **Method**: `POST /api/v1/social/requests/{user_a_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `400 Bad Request`
  - **Detail**: `"You cannot send a connection request to yourself."`

- [ ] **Send Connection Request**
  - **Method**: `POST /api/v1/social/requests/{user_b_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Body**:
    ```json
    {
      "message": "Hi Priya, I'd love to connect and follow your distributed systems work!"
    }
    ```
  - **Expected**: `201 Created`
  - **Verification**: `status: "pending"`, `sender_id: user_a_id`, `recipient_id: user_b_id`.

- [ ] **Duplicate Pending Request Prevention**
  - **Method**: `POST /api/v1/social/requests/{user_b_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `409 Conflict`
  - **Detail**: `"A pending connection request to this user already exists."`

- [ ] **View Outgoing Requests**
  - **Method**: `GET /api/v1/social/requests/outgoing`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns array with the pending request sent to User B.

- [ ] **View Incoming Requests**
  - **Method**: `GET /api/v1/social/requests/incoming`
  - **Auth**: `Bearer TOKEN_B`
  - **Expected**: `200 OK`
  - **Verification**: Returns array with the pending request from User A.

- [ ] **Unauthorized Accept Prevention**
  - **Method**: `POST /api/v1/social/requests/{request_id}/accept`
  - **Auth**: `Bearer TOKEN_A` (sender trying to accept their own request)
  - **Expected**: `403 Forbidden`
  - **Detail**: `"You are not authorized to accept this connection request."`

- [ ] **Accept Connection Request**
  - **Method**: `POST /api/v1/social/requests/{request_id}/accept`
  - **Auth**: `Bearer TOKEN_B` (recipient)
  - **Expected**: `200 OK`
  - **Verification**:
    - Request `status` updates to `"accepted"`.
    - Bidirectional `Connection` record atomically created.
    - User A receives an in-app notification.

- [ ] **Double Acceptance Prevention**
  - **Method**: `POST /api/v1/social/requests/{request_id}/accept`
  - **Auth**: `Bearer TOKEN_B`
  - **Expected**: `400 Bad Request`
  - **Detail**: `"This connection request has already been accepted."`

---

### 3. Connection Management & Network Graph

- [ ] **List Direct (1st-Degree) Connections**
  - **Method**: `GET /api/v1/social/connections`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Contains User B with `connected_since` timestamp.

- [ ] **Search Within Connections**
  - **Method**: `GET /api/v1/social/connections/search?q=Priya`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns User B.

- [ ] **Check Connection Status**
  - **Method**: `GET /api/v1/social/connections/{user_b_id}/status`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `"is_connected": true`, `"status": "connected"`.

- [ ] **Check Connection Degree**
  - **Method**: `GET /api/v1/social/connections/{user_b_id}/degree`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `"degree": 1`, `"degree_label": "1st"`.

- [ ] **Check Mutual Connections**
  - **Method**: `GET /api/v1/social/connections/mutual/{user_b_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns mutual connections count and list.

---

### 4. Notifications

- [ ] **Get Unread Count**
  - **Method**: `GET /api/v1/social/notifications/unread-count`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Returns `{"unread_count": 1}` (for request accepted notification).

- [ ] **List Notifications**
  - **Method**: `GET /api/v1/social/notifications`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Contains notification `type: "connection_request_accepted"`.

- [ ] **Mark Single Notification as Read**
  - **Method**: `PATCH /api/v1/social/notifications/{notification_id}/read`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `is_read: true`.

- [ ] **Mark All Notifications as Read**
  - **Method**: `PATCH /api/v1/social/notifications/read-all`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `status: "success"`.

---

### 5. Blocking, Privacy & Disconnection

- [ ] **Block User**
  - **Method**: `POST /api/v1/social/blocks/{user_b_id}?reason=spam`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `201 Created`
  - **Verification**:
    - Block record created.
    - **Existing connection between User A and User B is immediately severed/dissolved**.
    - Any pending requests between them are cancelled.

- [ ] **Verify Connection Removed Post-Block**
  - **Method**: `GET /api/v1/social/connections/{user_b_id}/status`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `"is_connected": false`, `"is_blocked_by_me": true`.

- [ ] **Blocked User Cannot Send Requests**
  - **Method**: `POST /api/v1/social/requests/{user_a_id}`
  - **Auth**: `Bearer TOKEN_B`
  - **Expected**: `403 Forbidden`
  - **Detail**: `"Unable to send connection request to this user."`

- [ ] **List Blocked Users**
  - **Method**: `GET /api/v1/social/blocks`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Lists User B.

- [ ] **Unblock User**
  - **Method**: `DELETE /api/v1/social/blocks/{user_b_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: `status: "success"`, `"message": "User unblocked successfully."`.

- [ ] **Remove Connection Manually**
  - **Method**: `DELETE /api/v1/social/connections/{user_b_id}`
  - **Auth**: `Bearer TOKEN_A`
  - **Expected**: `200 OK`
  - **Verification**: Connection severed gracefully.
