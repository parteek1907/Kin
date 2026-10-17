# Conduit Backend - Alumni Network & Professional Connections Platform

A high-performance, modular backend built with FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and Pydantic v2.

---

## 1. Overview & Vision

**Conduit** bridges the gap between university students, alumni, faculty, founders, and recruiters. Rather than relying on static profiles or generic advice, Conduit introduces empirical, data-driven career navigation, intelligent qualification-based auto connections, and a comprehensive LinkedIn-style professional social networking system.

### Major Feature 1: Career Time Machine
The **Career Time Machine** enables students to explore real historical career pathways submitted by alumni and professionals.
- **Authentic Journeys**: Real records with dates, companies, skills used, projects, and career transition notes.
- **Chronological Timelines**: Explore complete stage-by-stage transitions (e.g. Intern -> Junior Dev -> Senior ML Engineer).
- **Deterministic Skill-Gap Analysis**: Compares a student's current skill profile against real alumni who actually hold the target role, computing objective priority rankings and empirical learning evidence.
- **Grounded Insights**: Transparently distinguishes *observed historical facts* from *inferred progression patterns* without AI hallucination or fabricated guarantees.
- **AI-Ready Architecture**: Built with an `AIServiceInterface` protocol and deterministic fallback, ready for future LLM integration without code rewrites.

### Major Feature 2: Qualification-Based Auto Connections
The **Qualification-Based Auto Connections** module allows alumni, recruiters, founders, and professionals to configure customizable acceptance policies for incoming connection requests.
- **Deterministic Evaluation Engine**: Evaluates incoming requests against mandatory skills, preferred skills, domain alignment, project counts, years of experience, and degrees.
- **Explicit Auto-Acceptance Control**: Automatic acceptance must always be explicitly enabled by the recipient (`auto_accept_enabled`). It is disabled by default. An AI or heuristic model is never permitted to auto-connect without explicit recipient authorization.
- **Explainable Transparent Breakdowns**: Returns transparent match scores, criteria satisfied vs not satisfied, missing candidate data, and human-readable decision summaries.
- **Pending Queue & Manual Review**: Qualifying requests under disabled auto-acceptance or requests requiring subjective evaluation remain cleanly queued for manual review.
- **Transaction & Concurrency Safety**: Enforces database-level constraints preventing duplicate connection requests, self-requests, and duplicate established connections.

### Major Feature 3: Complete Social Networking & Connection Management System
The **Social Networking & Connection Management System** provides a professional networking engine inspired by LinkedIn:
- **Multi-Attribute User Discovery & Search**: Fast search across full name, role, institution, department, graduation year, company, job title, industry, and skills with pagination and safe public profile redaction.
- **Full Connection Request Lifecycle**: Send requests with personalized notes, view incoming/outgoing requests, accept, reject, withdraw/cancel pending requests, preventing self-requests, duplicates, and reverse-direction duplicates.
- **Direct & N-Degree Connection Management**: List 1st-degree connections, filter/search within connections, view mutual connections, inspect connection status, and calculate connection degree (1st, 2nd, 3rd+).
- **Intelligent "People You May Know" Engine**: Deterministic, explainable recommendation scoring based on shared institution (+35), department (+25), mutual connections (+30 each), shared skills (+15 each), and shared industry (+20) with human-readable rationale without external AI dependencies.
- **Safety, Blocking & Disconnection**: Bidirectional user blocking with automatic connection dissolution, request cancellation, exclusion from suggestions, and owner-only unblocking.
- **In-App Persistent Notifications**: Event-driven notification tracking for connection requests, acceptances, and social updates with unread counts and read-state management.

---

## 2. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Language** | Python 3.11+ / 3.12 | Modern type-annotated Python |
| **Framework** | FastAPI 0.115+ | High-performance async/sync REST API with auto OpenAPI docs |
| **Database** | PostgreSQL 16+ (SQLite for tests) | Enterprise relational database |
| **ORM** | SQLAlchemy 2.0+ | Modern declarative models with strict relationship integrity |
| **Migrations** | Alembic 1.14+ | Version-controlled, reproducible database schema migrations |
| **Validation** | Pydantic v2 | High-speed data parsing and validation |
| **Security** | PyJWT & bcrypt | RFC 7519 JWT access tokens + salted bcrypt password hashing |
| **Testing** | Pytest & HTTPX | Isolated automated integration and unit test suite |
| **Dev Server** | Uvicorn 0.32+ | ASGI server with live reloading |

---

## 3. Project Architecture

The backend lives entirely inside `backend/` and follows a domain-driven, modular structure:

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                                      # FastAPI application entry point, CORS, health check
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py                                  # Register, login, /me, profile management routes
│   │   └── router.py                                # Central API v1 router mounting all feature routes
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                                # Centralized settings via pydantic-settings
│   │   ├── database.py                              # SQLAlchemy 2.x engine, SessionLocal, get_db dependency
│   │   └── security.py                              # bcrypt password hashing, JWT creation & verification
│   ├── models/
│   │   ├── __init__.py                              # Central declarative models export
│   │   ├── user.py                                  # User account model & connection/block/notification relationships
│   │   └── profile.py                               # User profile & PlatformRole enums
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                                  # Auth request/response schemas
│   │   └── profile.py                               # Profile request/response schemas
│   ├── services/
│   │   └── __init__.py                              # Cross-cutting service abstractions
│   └── features/
│       ├── career_time_machine/                     # FEATURE 1: Career Time Machine
│       │   ├── __init__.py
│       │   ├── models.py                            # CareerJourney database model & enums
│       │   ├── schemas.py                           # Journey, Timeline, SkillGap, Insights schemas
│       │   ├── repository.py                        # Database queries, visibility filters, pagination
│       │   ├── service.py                           # Domain logic, ownership auth, skill gap engine
│       │   └── insights.py                          # Empirical facts vs inferred patterns, AI-ready interface
│       ├── qualification_connections/               # FEATURE 2: Qualification-Based Auto Connections
│       │   ├── __init__.py
│       │   ├── models.py                            # ConnectionPolicy, ConnectionRequest, Connection, EvaluationLog
│       │   ├── schemas.py                           # Policy, Request, Evaluation, Connection schemas
│       │   ├── repository.py                        # DB queries, policy lookups & connection transactions
│       │   ├── service.py                           # Request workflow, auto-acceptance & manual review logic
│       │   ├── evaluator.py                         # Deterministic rule-based evaluation engine
│       │   ├── permissions.py                       # Ownership, authorization & duplicate checks
│       │   └── router.py                            # REST endpoints for policies, evaluations, requests
│       └── social/                                  # FEATURE 3: Social Networking & Connection Management
│           ├── __init__.py
│           ├── models.py                            # UserBlock, Notification models (re-exports Connection models)
│           ├── schemas.py                           # Pydantic v2 schemas for search, requests, connections, suggestions, blocks, notifications
│           ├── repository.py                        # Query layer: search, graph degree traversal, mutual connections, blocks, notifications
│           ├── recommendations.py                   # Deterministic People You May Know recommendation engine
│           ├── service.py                           # Business logic for requests, connections, blocks, notifications
│           └── router.py                            # REST API endpoints for /social/users, /requests, /connections, /blocks, /notifications
├── alembic/
│   ├── env.py                                       # Alembic migration environment
│   ├── script.py.mako                               # Migration template
│   └── versions/
│       ├── 0001_initial_schema.py                   # Migration 1: users, profiles, career_journeys
│       ├── 0002_qualification_connections.py       # Migration 2: policies, requests, connections, logs
│       └── 0003_social_networking.py                # Migration 3: user_blocks, notifications, connection indexes
├── tests/
│   ├── __init__.py
│   ├── conftest.py                                  # Pytest fixtures & isolated in-memory test database
│   ├── test_health.py                               # Health check and root discovery tests (3 tests)
│   ├── test_auth.py                                 # Registration, login, duplicate email, JWT, profile tests (7 tests)
│   ├── test_career_time_machine.py                  # Career Time Machine tests (11 tests)
│   ├── test_qualification_connections.py           # Qualification-Based Auto Connections tests (11 tests)
│   └── test_social.py                               # Social Networking, Requests, Connections, Suggestions, Blocking, Notifications tests (9 tests)
├── .env.example                                     # Environment variable template
├── .gitignore                                       # Git ignore rules for Python, virtualenv, and IDE files
├── alembic.ini                                      # Alembic CLI configuration
├── docker-compose.yml                               # Optional local PostgreSQL container
├── requirements.txt                                 # Pinned, tested dependencies
├── SOCIAL_API_TESTING.md                            # Practical endpoint-by-endpoint testing checklist
└── README.md                                        # Documentation
```

---

## 4. Local Development Setup (Windows PowerShell & Linux/macOS)

### Prerequisites
- **Python**: Version 3.11 or 3.12 installed (`python --version`)
- **Database**: PostgreSQL 14+ running locally OR Docker installed (SQLite is automatically used for tests)
- **Git**: Installed for version control

### Step 1: Open PowerShell and Navigate to the Backend Directory
```powershell
cd d:\PROJECTS\IIITD\HackShift-IIITD\backend
```

### Step 2: Create a Python Virtual Environment
```powershell
python -m venv .venv
```

### Step 3: Activate the Environment on Windows PowerShell
```powershell
.\.venv\Scripts\Activate.ps1
```
*(If you encounter execution policy restrictions on Windows PowerShell, run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`)*

On Linux / macOS:
```bash
source .venv/bin/activate
```

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 5: Configure the `.env` File
Create `.env` from `.env.example`:
```powershell
Copy-Item .env.example .env
```

Ensure `.env` contains your settings:
```env
ENVIRONMENT=development
PROJECT_NAME="Conduit Alumni Network API"
API_V1_STR="/api/v1"
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/alumni_network
SECRET_KEY=change-this-in-production-to-a-very-secure-random-32-byte-hex-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### Step 6: Start Database (PostgreSQL)

#### Option A: Docker Compose (Recommended)
```powershell
docker compose up -d
```
Spins up PostgreSQL 16 on port `5432` with database `alumni_network`.

#### Option B: Native PostgreSQL
In psql or pgAdmin:
```sql
CREATE DATABASE alumni_network;
```

### Step 7: Run Database Migrations
Apply all version-controlled migrations up to head (`0001`, `0002`, `0003`):
```powershell
alembic upgrade head
```

### Step 8: Start the Backend Server
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Local Server Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 5. Running Automated Tests

The automated test suite runs against an isolated in-memory SQLite database and requires **zero external services, database installations, or AI API keys**.

```powershell
python -m pytest -v
```

**Expected output:**
```text
============================= 41 passed in ~50s =============================
```

All 41 integration and unit tests will run and pass cleanly:
- 3 health & discovery tests
- 7 authentication, JWT & profile tests
- 11 Career Time Machine tests
- 11 Qualification-Based Auto Connection tests
- 9 Social Networking, Requests, Connections, Suggestions, Blocking & Notification tests

---

## 6. Complete API Reference

### Health & Discovery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Service health check |
| `GET` | `/` | None | API root discovery |

### Authentication & Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Register account (`Student`, `Alumni`, `Faculty`, `Founder`, `Recruiter`) |
| `POST` | `/api/v1/auth/login` | None | Authenticate with email/password; returns JWT access token |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Fetch authenticated user details and profile |
| `PATCH` | `/api/v1/auth/profile` | Bearer JWT | Update authenticated user profile |

### Feature 1: Career Time Machine
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/career-time-machine/journeys` | Bearer JWT | Create a new career journey stage |
| `GET` | `/api/v1/career-time-machine/journeys/me` | Bearer JWT | Get all career journeys of the logged-in user |
| `GET` | `/api/v1/career-time-machine/journeys/{id}` | Optional | Get single journey (respects privacy settings) |
| `PATCH` | `/api/v1/career-time-machine/journeys/{id}` | Bearer JWT | Update journey (owner only) |
| `DELETE` | `/api/v1/career-time-machine/journeys/{id}` | Bearer JWT | Delete journey (owner only) |
| `GET` | `/api/v1/career-time-machine/explore` | Optional | Search & filter alumni journeys with pagination |
| `GET` | `/api/v1/career-time-machine/journeys/{id}/timeline` | Optional | Get full chronological timeline of the user |
| `POST` | `/api/v1/career-time-machine/skill-gap` | None | Deterministic skill-gap analysis backed by real records |
| `GET` | `/api/v1/career-time-machine/insights` | None | Empirical progression trends, facts vs inferences |

### Feature 2: Qualification-Based Auto Connections
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/qualification-connections/policies` | Bearer JWT | Create connection acceptance policy (`auto_accept_enabled` defaults to false) |
| `GET` | `/api/v1/qualification-connections/policies/me` | Bearer JWT | List current user's policies |
| `GET` | `/api/v1/qualification-connections/policies/{id}` | Bearer JWT | Get policy details (owner only) |
| `PATCH` | `/api/v1/qualification-connections/policies/{id}` | Bearer JWT | Update policy criteria or toggle auto-accept (owner only) |
| `DELETE` | `/api/v1/qualification-connections/policies/{id}` | Bearer JWT | Delete policy (owner only) |
| `POST` | `/api/v1/qualification-connections/evaluate` | Bearer JWT | Evaluate a candidate profile against policy criteria |
| `GET` | `/api/v1/qualification-connections/evaluations/me` | Bearer JWT | View evaluation logs for current user |
| `POST` | `/api/v1/qualification-connections/requests` | Bearer JWT | Send connection request with auto evaluation & acceptance |
| `GET` | `/api/v1/qualification-connections/requests/received` | Bearer JWT | List received connection requests with evaluation breakdowns |
| `GET` | `/api/v1/qualification-connections/requests/sent` | Bearer JWT | List sent connection requests |
| `POST` | `/api/v1/qualification-connections/requests/{id}/respond` | Bearer JWT | Manually accept or reject a pending request (recipient only) |
| `GET` | `/api/v1/qualification-connections/connections/me` | Bearer JWT | List active established connections |

### Feature 3: Complete Social Networking & Connection Management System
| Category | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| **Discovery** | `GET` | `/api/v1/social/users/search` | Bearer JWT | Multi-attribute search across users (name, role, institution, skills, etc.) |
| **Discovery** | `GET` | `/api/v1/social/users/{user_id}` | Bearer JWT | View a user's safe public profile, connection count & mutual connections |
| **Discovery** | `GET` | `/api/v1/social/users/suggestions` | Bearer JWT | "People You May Know" explainable recommendation engine |
| **Requests** | `POST` | `/api/v1/social/requests/{recipient_id}` | Bearer JWT | Send a connection request with optional personalized note |
| **Requests** | `GET` | `/api/v1/social/requests/incoming` | Bearer JWT | List received pending connection requests |
| **Requests** | `GET` | `/api/v1/social/requests/outgoing` | Bearer JWT | List sent pending connection requests |
| **Requests** | `POST` | `/api/v1/social/requests/{request_id}/accept` | Bearer JWT | Atomically accept incoming connection request |
| **Requests** | `POST` | `/api/v1/social/requests/{request_id}/reject` | Bearer JWT | Reject incoming connection request |
| **Requests** | `DELETE` | `/api/v1/social/requests/{request_id}` | Bearer JWT | Cancel / withdraw outgoing pending connection request |
| **Connections** | `GET` | `/api/v1/social/connections` | Bearer JWT | List authenticated user's 1st-degree direct connections |
| **Connections** | `GET` | `/api/v1/social/connections/search` | Bearer JWT | Search & filter within authenticated user's direct connections |
| **Connections** | `GET` | `/api/v1/social/connections/mutual/{user_id}` | Bearer JWT | List mutual connections shared with another user |
| **Connections** | `GET` | `/api/v1/social/connections/{user_id}/status` | Bearer JWT | Check connection, pending request, or block status with a user |
| **Connections** | `DELETE` | `/api/v1/social/connections/{user_id}` | Bearer JWT | Remove an established connection |
| **Connections** | `GET` | `/api/v1/social/connections/{user_id}/degree` | Bearer JWT | Get connection degree (1st, 2nd, 3rd+) relative to current user |
| **Safety & Privacy**| `POST` | `/api/v1/social/blocks/{user_id}` | Bearer JWT | Block a user (severs connections & cancels pending requests) |
| **Safety & Privacy**| `DELETE` | `/api/v1/social/blocks/{user_id}` | Bearer JWT | Unblock a user |
| **Safety & Privacy**| `GET` | `/api/v1/social/blocks` | Bearer JWT | List users currently blocked by the authenticated user |
| **Notifications** | `GET` | `/api/v1/social/notifications` | Bearer JWT | Get user's in-app notifications |
| **Notifications** | `GET` | `/api/v1/social/notifications/unread-count` | Bearer JWT | Get unread notification count |
| **Notifications** | `PATCH` | `/api/v1/social/notifications/{notification_id}/read` | Bearer JWT | Mark specific notification as read |
| **Notifications** | `PATCH` | `/api/v1/social/notifications/read-all` | Bearer JWT | Mark all user notifications as read |

---

## 7. Step-by-Step Social Networking Flow (Swagger UI / Postman)

### Step 1: Register User A (Student)
- **POST** `/api/v1/auth/register`
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

### Step 2: Register User B (Alumni)
- **POST** `/api/v1/auth/register`
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

### Step 3: Login as Both Users
- **POST** `/api/v1/auth/login`
```json
{
  "email": "aarav.sharma@iiitd.ac.in",
  "password": "Password123!"
}
```
Copy `access_token` and click **Authorize** in Swagger UI (`Bearer <token>`).

### Step 4: Search for User B as User A
- **GET** `/api/v1/social/users/search?q=Priya&institution=IIIT%20Delhi`
Returns Priya Nair's public profile (safely excluding email, password, and sensitive tokens).

### Step 5: Send Connection Request from User A to User B
- **POST** `/api/v1/social/requests/{user_b_id}`
```json
{
  "message": "Hi Priya, I'd love to connect and follow your distributed systems work at Anthropic!"
}
```
Returns `status: "pending"`.

### Step 6: View Incoming Requests as User B
Switch authorization token in Swagger to User B's token.
- **GET** `/api/v1/social/requests/incoming`
Returns the pending request from Aarav Sharma with his profile summary and personalized message.

### Step 7: Accept Request as User B
- **POST** `/api/v1/social/requests/{request_id}/accept`
Returns `status: "accepted"`. An atomic transaction creates the bidirectional `Connection` record and dispatches an in-app notification to Aarav.

### Step 8: Verify Connections as User A
Switch back to User A's token.
- **GET** `/api/v1/social/connections` -> Lists Priya Nair as a 1st-degree connection.
- **GET** `/api/v1/social/connections/{user_b_id}/status` -> Returns `is_connected: true`, `status: "connected"`.
- **GET** `/api/v1/social/connections/{user_b_id}/degree` -> Returns `degree: 1`, `degree_label: "1st"`.

### Step 9: Check Notifications as User A
- **GET** `/api/v1/social/notifications/unread-count` -> Returns `unread_count: 1`.
- **GET** `/api/v1/social/notifications` -> Returns `"Priya Nair accepted your connection request."`
- **PATCH** `/api/v1/social/notifications/read-all` -> Marks notifications as read.

### Step 10: Test Safety & Blocking
- **POST** `/api/v1/social/blocks/{user_b_id}`
Blocks User B. The established connection is immediately severed, pending requests are removed, and User B is excluded from suggestions.
- **DELETE** `/api/v1/social/blocks/{user_b_id}`
Unblocks User B.

---

## 8. Troubleshooting Common Issues

### 1. Database Connection Failure (`OperationalError: could not connect to server`)
- Verify PostgreSQL is running: `docker compose ps` or `Get-Service postgresql*` in PowerShell.
- Ensure the database exists: `CREATE DATABASE alumni_network;`.
- Check credentials in `.env`: `DATABASE_URL=postgresql://user:password@localhost:5432/alumni_network`.
- If testing only, SQLite in-memory is used automatically by pytest with zero configuration.

### 2. Missing Environment Variables (`ValidationError: Field required`)
- Ensure `.env` exists in `backend/` by running `Copy-Item .env.example .env`.
- Ensure `SECRET_KEY` is at least 32 characters long.

### 3. Missing Python Packages (`ModuleNotFoundError`)
- Verify your virtual environment is active (prompt will show `(.venv)`).
- Run `pip install -r requirements.txt`.

### 4. Migration Failures (`alembic.util.exc.CommandError`)
- Ensure your database connection is active.
- Run `alembic current` to check the current revision.
- To re-apply clean migrations: `alembic upgrade head`.

### 5. Port Already in Use (`OSError: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`)
- Find and terminate the process holding port 8000 in PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
  ```
- Alternatively, start Uvicorn on port 8001:
  ```powershell
  python -m uvicorn app.main:app --reload --port 8001
  ```

### 6. Authentication Errors (`401 Unauthorized` or `403 Forbidden`)
- In Swagger UI, make sure to prefix your token with `Bearer `: `Bearer eyJhbGci...`.
- Tokens expire after 1440 minutes (24 hours). Re-authenticate via `POST /api/v1/auth/login`.

---

## 9. Current Limitations & Roadmap

### Current Version (v1.2.0)
- **Deterministic Transparency**: Recommendations and qualifications are backed by concrete profile evidence and graph topology, completely free from black-box hallucination.
- **Safety First**: Bidirectional blocks immediately dissolve established connections and nullify pending interactions.

### Teammate Features Reserved for Future Integration
The architecture cleanly reserves room for upcoming modules:
1. **Module 4: Mentorship Matching & Session Booking** (`app/features/mentorship/`)
2. **Module 5: Mock Technical Interviews & Feedback Loop** (`app/features/mock_interviews/`)
