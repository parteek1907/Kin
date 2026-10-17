# Kin Backend - Intelligent Alumni Network & Professional Connections Platform

A high-performance, modular backend built with FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and Pydantic v2.

---

## 1. Overview & Vision

**Kin** bridges the gap between university students, alumni, faculty, founders, and recruiters. Rather than relying on static profiles or generic advice, Kin introduces empirical, data-driven career navigation, intelligent qualification-based auto connections, a comprehensive LinkedIn-style professional social networking system, and a robust contribution-based reputation engine.

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

### Major Feature 4: Skill Bounty Network
The **Skill Bounty Network** connects students with alumni, startup founders, recruiters, and faculty through real-world challenges.
- **Demonstrated Ability Over Unverified Claims**: Gives students an authentic platform to demonstrate technical competencies rather than merely claiming skills on a static resume.
- **Role-Enforced Marketplace**: Alumni, Founders, Recruiters, and Faculty author real problem bounties; Students build and submit verified evidence.
- **Deterministic Challenge Recommendations**: Ranks bounties via explainable signals (skill overlap, category relevance, difficulty tier alignment, deadline runway) without requiring AI API keys.
- **Professional Outcomes Tracking**: Verified records of mentorship, interviews, collaboration, portfolio pieces, and technical feedback without fabricated compensation or guaranteed hiring.

### Major Feature 5: Unclaimed Talent Radar
The **Unclaimed Talent Radar** discovers high-value opportunities that students and alumni might not think to search for themselves. Rather than merely matching declared career aspirations or current narrow job titles, the system identifies **transferable skills** and bridges candidates to adjacent and emerging industries.

### Major Feature 6: Kin Reputation Engine (Contribution-Based Reputation System)
The **Kin Reputation Engine** provides an immutable, auditable, contribution-based reputation ledger. It rewards genuine, useful, verified contributions to the community rather than raw clicks, vanity popularity, or meaningless engagement.
- **Configurable Server-Side Points Policy**: Covers 8 core community contributions including mentoring sessions, portfolio reviews, mock interviews, accepted community answers, 20-Minute Doorway sessions, verified introductions, Wisdom Capsules, and confirmed positive feedback.
- **Append-Only Immutable Ledger**: Every points award, adjustment, and reversal is written to `kin_ledger_entries` with an enforced unique `idempotency_key`, preventing duplicate credits on network retries.
- **Reversible Audit Corrections**: Mistakes and disputed interactions are corrected exclusively through linked negative adjustment records (`reversal_of_entry_id`), preserving the complete chronological audit history without mutating past transactions.
- **Multi-Tier & Rolling Velocity**: Computes distinct lifetime points, net balances, rolling 30-day velocity, rolling 90-day velocity, and 5 reputation tiers (Bronze, Silver, Gold, Platinum, Fellow).
- **Hardened Anti-Abuse Controls**: Built-in safeguards against self-awarding, cooldown violations, daily category point caps, rapid point farming, and pairwise reciprocal collusion rings between colluding members.
- **Zero Information Leakage**: Public reputation cards strictly enforce profile visibility settings (public, network-only, private) and never expose private fraud flags, dispute references, or internal moderation logs.


---

## 2. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Language** | Python 3.11+ / 3.12 | Modern type-annotated Python |
| **Framework** | FastAPI 0.115+ | High-performance async/sync REST API with auto OpenAPI docs |
| **Database** | PostgreSQL 16+ (Neon Cloud PostgreSQL / SQLite for local tests) | Enterprise cloud relational database |
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

## 8. Major Feature 5: Unclaimed Talent Radar

### 8.1 Overview & Vision
The **Unclaimed Talent Radar** discovers high-value opportunities that students and alumni might not think to search for themselves. Rather than merely matching declared career aspirations or current narrow job titles, the system identifies **transferable skills** and bridges candidates to adjacent and emerging industries (e.g., Computer Vision -> Autonomous Vehicles, Medical Image Analysis, or Industrial Quality Inspection).

Recommendations are grounded in authentic platform profile evidence and real stored database records, providing explainable reasoning, eligibility verification, and actionable learning suggestions.

### 8.2 Architecture & Module Structure
The feature is fully modular and resides in `backend/app/features/unclaimed_talent_radar/`:
```text
backend/app/features/unclaimed_talent_radar/
├── __init__.py           # Package exports (models, service, router)
├── models.py             # Opportunity and TalentRadarFeedback database models
├── schemas.py            # Pydantic v2 schemas for discovery, feedback, and skill maps
├── skill_graph.py        # Deterministic Transferable Skill Graph registry
├── matching.py           # Cross-industry matching engine with configurable weights
├── explanations.py       # Grounded explanation synthesizer & learning path generator
├── feedback.py           # Feedback manager and ranking adjustment signals
├── repository.py         # Database query layer and modular integration adapters
├── service.py            # Main business logic orchestrator
└── router.py             # FastAPI REST endpoints
```

### 8.3 Data Sources & Reuse
The feature reuses existing models without duplication:
- **`User`** (`app.models.user`): Identity, authentication, ownership.
- **`Profile`** (`app.models.profile`): Declared skills, education history, years of experience, primary industry.
- **`CareerJourney`** (`app.features.career_time_machine.models`): Historical projects, achievements, skills used, and official verification statuses (`alumni_verified`, `official_verified`).
- **`Opportunity`** (`app.features.unclaimed_talent_radar.models`): Real database records with deadlines, visibility, experience levels, and eligibility criteria.
- **`TalentRadarFeedback`** (`app.features.unclaimed_talent_radar.models`): Recommendation feedback records with unique constraint on `(user_id, opportunity_id)`.
- **Modular Adapters**: `SkillBountyAdapter` interface defined for future integration when the Skill Bounty challenge module is deployed.

### 8.4 Skill Evidence Tiering
To avoid assuming that merely mentioning a skill proves proficiency, skills are rigorously classified:
1. **Self-Declared (`self_declared`)**: Skills stated on the user's profile without project or verified history.
2. **Project-Evidenced (`project_evidenced`)**: Skills demonstrated in documented achievements or projects in historical career stages.
3. **Verified Evidence (`verified_evidence`)**: Skills supported by alumni-verified or official-verified career records.
4. **Inferred (`inferred`)**: Directional skill potentials derived through the transferable skill graph. Inferred skills are never presented as proven facts or counted as direct matches.

### 8.5 Transferable Skill Graph
A deterministic, expandable knowledge graph:
- **Canonical Skills & Aliases**: Normalizes variations (e.g. `opencv`, `cv2`, `computer-vision` -> `Computer Vision`; `py`, `python3` -> `Python`).
- **Associated Domains**: Maps skills to target industries (Autonomous Vehicles, Healthcare & Medical Imaging, Aerospace & Geospatial, Fintech, Industrial Automation).
- **Transferable Edges**: Explicit directional bridges with confidence ratings, transparent reasons, and boundary limits:
  - *Example*: `Computer Vision` -> `Autonomous Vehicle Perception` (Confidence: 0.88).
  - *Reason*: "Both domains rely on feature extraction, semantic segmentation, and 3D bounding box detection across camera sensor feeds."
  - *Limits*: "Does not imply expertise in vehicle kinematics, CAN bus protocols, or hard real-time ISO 26262 automotive safety standards."

### 8.6 Recommendation Scoring & Signals
Scores are normalized on a 0–100 scale:
- **Direct Skill Match (35%)**: Proportional overlap of required skills, weighted higher for verified or project-backed skills.
- **Transferable Skill Match (25%)**: Satisfied requirements via transferable edges with confidence weighting.
- **Project Evidence (15%)**: Grounded evidence from past projects and achievements.
- **Industry Exploration (10%)**: Bonus for adjacent domains offering cross-industry career mobility.
- **Experience Compatibility (10%)**: Compares user experience against required minimums.
- **Interest Relevance (5%)**: Overlap with stated profile headline, biography, and career interests.
- **Feedback Adjustments**: Deterministic boosts/penalties from user reactions (`relevant` +8, `not_relevant` -35, `interested_in_industry` +10, `not_interested_in_industry` -25).
- **Eligibility Filter**: Candidates failing explicit criteria (`ineligible`) receive severe score capping. Missing credentials are transparently marked as `unknown`.

### 8.7 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/unclaimed-talent-radar/discover` | Discover opportunities (supports `discovery_mode`, pagination, filters) |
| `GET` | `/api/v1/unclaimed-talent-radar/recommendations/me` | Personalized dashboard: Direct, Adjacent, and Exploratory feeds |
| `GET` | `/api/v1/unclaimed-talent-radar/recommendations/{id}` | Detailed reasoning and learning suggestions for a specific opportunity |
| `GET` | `/api/v1/unclaimed-talent-radar/profile-analysis` | Evidence tier breakdown for authenticated user |
| `GET` | `/api/v1/unclaimed-talent-radar/skill-map` | Query canonical skills, aliases, and transferable relationships |
| `POST` | `/api/v1/unclaimed-talent-radar/feedback` | Record recommendation feedback (upsert prevents duplicates) |
| `POST` | `/api/v1/unclaimed-talent-radar/opportunities` | Create/seed empirical platform opportunities |

#### Example: Discover Adjacent-Industry Opportunities
**Request:**
```http
GET /api/v1/unclaimed-talent-radar/discover?discovery_mode=cross_industry_only&page=1&page_size=5
Authorization: Bearer <JWT>
```

**Response (`200 OK`):**
```json
{
  "items": [
    {
      "opportunity_id": 2,
      "title": "Autonomous Vehicle Perception Researcher",
      "organization": "DriveAI Robotics",
      "industry": "Autonomous Vehicles",
      "opportunity_type": "research_project",
      "location": "Bangalore",
      "workplace_type": "hybrid",
      "deadline": "2026-11-16T12:00:00Z",
      "match_type": "adjacent_industry",
      "relevance_score": 78.4,
      "matched_skills": ["Python"],
      "transferable_skills": [
        {
          "user_skill": "Computer Vision",
          "related_domain": "Autonomous Vehicles",
          "reason": "Both domains rely on feature extraction, semantic segmentation, and 3D bounding box detection across camera sensor feeds.",
          "limits": "Does not imply expertise in vehicle kinematics, CAN bus protocols, or hard real-time ISO 26262 automotive safety standards.",
          "confidence": 0.88
        }
      ],
      "missing_skills": ["ROS 2"],
      "eligibility_status": "eligible",
      "eligibility_details": "Satisfies all specified eligibility criteria.",
      "recommendation_reasons": [
        "Directly matches 1 required skill(s): Python.",
        "Demonstrated relevant project evidence in documented historical achievements.",
        "Transferable skill connection: 'Computer Vision' is applicable to 'Autonomous Vehicles' - Both domains rely on feature extraction...",
        "Opportunity is in the 'Autonomous Vehicles' sector, an adjacent industry offering cross-domain mobility beyond Information Technology."
      ],
      "learning_suggestions": [
        {
          "missing_skill": "ROS 2",
          "anchor_skill": "Python",
          "suggested_action": "Explore ROS 2 rclpy node architecture, publishers, subscribers, and launch files via simulation in Gazebo.",
          "addressed_gap": "Bridges Python/C++ skills into modular robotics perception and node communication standards.",
          "platform_resources": [
            {
              "skill": "ROS 2",
              "title": "ROS 2 rclpy Architecture Lab",
              "type": "lab"
            }
          ],
          "disclaimer": "Preparation suggestions are deterministic learning guides and do not guarantee hiring or admission."
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 5,
  "total_pages": 1,
  "discovery_mode": "cross_industry_only"
}
```

---

## 9. Major Feature 2: Skill Bounty Network

### 9.1 Overview & Core Idea
**STOP ASKING STUDENTS TO CLAIM THEY HAVE SKILLS. GIVE THEM AN OPPORTUNITY TO DEMONSTRATE THOSE SKILLS.**

The **Skill Bounty Network** is a real-world technical challenge marketplace connecting students with alumni, founders, recruiters, and faculty. Platform professionals post practical problem statements reflecting actual engineering and research tasks (e.g., building an LSM tree, profiling LiDAR point clouds, optimizing API latency, or auditing container security).

Students discover challenges, submit verifiable evidence (open-source git repositories, live demos, benchmarks, architecture documentation), and receive rigorous rubric-based technical reviews.

A completed challenge may lead to:
- Deep technical code reviews
- 1-on-1 mentorship
- High-signal portfolio proof of competency
- Professional network connections
- Collaboration and interview invitations, when explicitly offered by the creator

> **Disclaimer**: All optional rewards and professional opportunities are explicitly defined by challenge creators and are distinguished from guaranteed employment or legal compensation. No real companies or sponsors are pre-populated or fabricated.

---

### 9.2 Challenge Lifecycle & State Machine
Challenges follow an explicit, enforced state machine:
```text
  [ DRAFT ]  ───────────►  [ OPEN ]  ───────────►  [ CLOSED ]  ───────────►  [ COMPLETED ]
      │                       │
      └───────────────────────┴─────────────────►  [ CANCELLED ]
```

1. **DRAFT**: Created by an authorized professional (Alumni, Founder, Recruiter, Faculty). Not visible in public discovery feeds.
2. **OPEN**: Published challenge with a future deadline. Accepting student submissions.
3. **CLOSED**: Deadline passed or closed manually by the creator. Submissions are frozen; active reviews proceed.
4. **COMPLETED**: All evaluations, feedback, and verified outcomes have been finalized.
5. **CANCELLED**: Aborted by the creator. Sealed from future edits or submissions.

*Automatic Expiration Guard*: Any challenge whose UTC deadline has passed is automatically treated as unavailable for new submissions, even in the absence of an external cron worker.

---

### 9.3 Submission & Evidence Verification
Students submit empirical proof of work without server-side arbitrary code execution risks:
- **Repository URL**: Links to GitHub, GitLab, etc. (strictly validated against HTTP/HTTPS syntax).
- **Demo URL**: Optional live deployment preview.
- **Supporting Evidence URLs**: Links to performance benchmarks, design documents, or technical writeups.
- **Attachment References**: External artifact or release tags.
- **Duplicate Prevention**: A student can hold only **one active submission** per challenge at a time. To resubmit, the student must update their existing submission or withdraw it first.
- **Ownership Security**: Only the authoring student can edit or withdraw their submission prior to the challenge deadline. Unrelated creators cannot view or access another creator's submissions.

---

### 9.4 Review & Rubric Evaluation Workflow
Challenge creators review submissions using structured evaluation criteria:
- **Configurable Rubric**: Per-criterion scores and evaluation breakdowns.
- **Technical Feedback**: Comprehensive code critique and architectural suggestions.
- **Strengths & Areas for Improvement**: Actionable feedback items.
- **Score Bounds**: Validated numeric score range (0.0 to 100.0). Scores represent assessment of the submitted artifact, not a complete measure of the human candidate.
- **Self-Review Prevention**: Challenge authors and submitters are strictly prohibited from reviewing their own submissions (`HTTP 400 Bad Request`).

---

### 9.5 Verified Professional Outcomes
Creators can award explicit, verifiable outcomes to high-performing submissions:
- `feedback_received`: In-depth code review delivered.
- `portfolio_project`: Verified high-quality work suitable for public portfolio evidence.
- `mentorship_offered`: 1-on-1 career or technical mentorship extended.
- `collaboration_offered`: Invitation to open-source or startup collaboration.
- `interview_opportunity`: Fast-track or consideration for an interview stage.
- `referral_offered`: Direct internal referral consideration.

These records are explicitly granted and queryable across features (such as feeding into the `UnclaimedTalentRadar` skill evidence graph via `SkillBountyAdapter`).

---

### 9.6 AI-Ready Challenge Matching Engine
The challenge recommendation system ranks open bounties deterministically without requiring an external AI API key:
- **Direct Skill Overlap (45%)**: Overlap between student's profile skills and challenge required skills.
- **Domain & Interest Relevance (25%)**: Alignment between challenge category and user biography, headline, and industry.
- **Difficulty Compatibility (20%)**: Years of experience calibrated against difficulty tier (`Beginner`: 0–1.5 yrs, `Intermediate`: 1–4 yrs, `Advanced`: 3–6 yrs, `Expert`: 5+ yrs).
- **Deadline Runway (10%)**: Remaining time window to ensure students have adequate development time.
- **Extensible AI Protocol**: Defined via `ChallengeAIExplanationInterface(Protocol)`, enabling drop-in LLM explanation generation in future iterations.

---

### 9.7 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/skill-bounty/challenges` | Create a new challenge in draft status | Alumni, Founder, Recruiter, Faculty |
| `GET` | `/api/v1/skill-bounty/challenges` | Discover challenges (filters, search, pagination) | Authenticated Users |
| `GET` | `/api/v1/skill-bounty/challenges/{id}` | Get full challenge details and rubric | Authenticated Users |
| `PATCH` | `/api/v1/skill-bounty/challenges/{id}` | Edit challenge fields (draft or open only) | Challenge Creator |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/publish` | Transition challenge from DRAFT to OPEN | Challenge Creator |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/close` | Transition challenge from OPEN to CLOSED | Challenge Creator |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/cancel` | Cancel challenge | Challenge Creator |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/complete` | Complete challenge | Challenge Creator |
| `GET` | `/api/v1/skill-bounty/challenges/{id}/submissions` | List submissions for a challenge | Challenge Creator Only |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/submissions` | Submit solution to an open challenge | Students / Platform Users |
| `GET` | `/api/v1/skill-bounty/submissions/me` | List submissions made by current user | Authenticated User |
| `GET` | `/api/v1/skill-bounty/submissions/{id}` | Get single submission | Student Author or Creator |
| `PATCH` | `/api/v1/skill-bounty/submissions/{id}` | Update active submission | Student Author Only |
| `POST` | `/api/v1/skill-bounty/submissions/{id}/withdraw` | Withdraw active submission | Student Author Only |
| `POST` | `/api/v1/skill-bounty/submissions/{id}/reviews` | Review and score a submission | Challenge Creator |
| `GET` | `/api/v1/skill-bounty/submissions/{id}/reviews` | List reviews for a submission | Student Author or Creator |
| `POST` | `/api/v1/skill-bounty/challenges/{id}/outcomes` | Award verified professional outcome | Challenge Creator |
| `GET` | `/api/v1/skill-bounty/recommendations/me` | Get explainable challenge recommendations | Authenticated User |

---

### 9.8 Example API Requests & Responses

#### 1. Create a Challenge
**Request:**
```http
POST /api/v1/skill-bounty/challenges
Authorization: Bearer <JWT_ALUMNI>
Content-Type: application/json

{
  "title": "Build a High-Throughput Fraud Detection Engine",
  "short_summary": "Design a real-time rule and anomaly evaluation service in Python.",
  "problem_statement": "Financial transactions require real-time rule evaluation under 50ms latency. Build a prototype handling 5k req/sec with Redis caching.",
  "category": "backend_engineering",
  "required_skills": ["Python", "FastAPI", "Redis"],
  "difficulty_level": "intermediate",
  "estimated_effort": "4-6 hours",
  "submission_instructions": "Submit GitHub repository with architecture diagram and Locust benchmark results.",
  "evaluation_criteria": [
    {"criterion": "System Latency (<50ms)", "max_points": 40},
    {"criterion": "Code Modularity & Tests", "max_points": 30},
    {"criterion": "Fault Tolerance", "max_points": 30}
  ],
  "deadline": "2026-11-20T23:59:59Z",
  "organization_name": "FinTech Labs",
  "mentorship_available": true,
  "opportunity_type_offered": "Interview Consideration"
}
```

**Response (`201 Created`):**
```json
{
  "id": 1,
  "creator_user_id": 1,
  "title": "Build a High-Throughput Fraud Detection Engine",
  "short_summary": "Design a real-time rule and anomaly evaluation service in Python.",
  "problem_statement": "Financial transactions require real-time rule evaluation under 50ms latency...",
  "category": "Backend Engineering",
  "required_skills": ["Python", "FastAPI", "Redis"],
  "difficulty_level": "Intermediate",
  "estimated_effort": "4-6 hours",
  "submission_instructions": "Submit GitHub repository with architecture diagram and Locust benchmark results.",
  "evaluation_criteria": [
    {"criterion": "System Latency (<50ms)", "max_points": 40},
    {"criterion": "Code Modularity & Tests", "max_points": 30},
    {"criterion": "Fault Tolerance", "max_points": 30}
  ],
  "deadline": "2026-11-20T23:59:59Z",
  "organization_name": "FinTech Labs",
  "reward_description": null,
  "mentorship_available": true,
  "opportunity_type_offered": "Interview Consideration",
  "opportunity_details": null,
  "status": "draft",
  "published_at": null,
  "closed_at": null,
  "completed_at": null,
  "created_at": "2026-10-17T11:30:00Z",
  "updated_at": "2026-10-17T11:30:00Z",
  "submissions_count": 0,
  "creator_name": "Priya Nair",
  "creator_role": "Alumni"
}
```

#### 2. Get Challenge Recommendations for Authenticated Student
**Request:**
```http
GET /api/v1/skill-bounty/recommendations/me?limit=5
Authorization: Bearer <JWT_STUDENT>
```

**Response (`200 OK`):**
```json
{
  "user_id": 2,
  "total": 1,
  "recommendations": [
    {
      "challenge": {
        "id": 1,
        "creator_user_id": 1,
        "title": "Build a High-Throughput Fraud Detection Engine",
        "short_summary": "Design a real-time rule and anomaly evaluation service in Python.",
        "problem_statement": "Financial transactions require real-time rule evaluation...",
        "category": "Backend Engineering",
        "required_skills": ["Python", "FastAPI", "Redis"],
        "difficulty_level": "Intermediate",
        "status": "open",
        "deadline": "2026-11-20T23:59:59Z",
        "mentorship_available": true,
        "opportunity_type_offered": "Interview Consideration"
      },
      "relevance_score": 82.5,
      "matched_skills": ["Python"],
      "missing_skills": ["FastAPI", "Redis"],
      "match_reasons": [
        "Demonstrates your experience in Python.",
        "Calibrated for intermediate level builders.",
        "Creator offers 1-on-1 mentorship for top submissions.",
        "Opportunity for: Interview Consideration."
      ],
      "difficulty_fit": "Moderate stretch challenge to accelerate growth."
    }
  ],
  "disclaimer": "Challenge recommendations are deterministic indicators of skill and category alignment, not guarantees of selection or employment."
}
```

---

---

## 10. Database Migrations, Tests & Roadmap

### Database Migrations
Migrations are managed with Alembic. The migration history is strictly linear:
1. `0001_initial_schema`: Users, Profiles, and Career Journey models.
2. `0002_qualification_connections`: Connection Policies, Connection Requests, and Connections.
3. `0003_social_networking`: User Blocks and Persistent Notifications.
4. `0004_unclaimed_talent_radar`: Opportunities and Talent Radar Feedback.
5. `0005_skill_bounty_network`: Challenges, Submissions, Reviews, and Outcomes.
6. `0006_kin_reputation_engine`: Points Policies, Reputation Summaries, Immutable Ledger Entries, and Abuse Audit Logs.

Apply all migrations:
```bash
cd backend
alembic upgrade head
```

Verify migration heads:
```bash
alembic heads
# Expected: 0006_kin_reputation_engine (head)
```

### Running Automated Tests
The backend features 96 automated tests across all 6 core features:
- `tests/test_auth.py`: Authentication, JWT, and user management (7 tests).
- `tests/test_career_time_machine.py`: Feature 1 - Career pathways, timelines, skill gaps (11 tests).
- `tests/test_health.py`: System health checks and routing (3 tests).
- `tests/test_qualification_connections.py`: Feature 2 - Automated connection policies & evaluation (11 tests).
- `tests/test_social.py`: Feature 3 - Social networking, search, blocks, notifications (9 tests).
- `tests/test_skill_bounty.py`: Feature 4 - Challenges, submissions, rubrics, outcomes (20 tests).
- `tests/test_unclaimed_talent_radar.py`: Feature 5 - Cross-industry discovery, transferable skill graph (20 tests).
- `tests/test_kin_reputation.py`: Feature 6 - Kin Reputation Engine, immutable ledger, anti-abuse, reversals (15 tests).

Run the complete test suite:
```bash
cd backend
python -m pytest
# Expected: 96 passed
```

Run Kin Reputation tests exclusively:
```bash
python -m pytest tests/test_kin_reputation.py
# Expected: 15 passed
```

---

## 11. Major Feature 6: Kin Reputation Engine API Reference

### 11.1 Reputation Tiers & Points Allocation
| Tier | Point Threshold | Community Standing |
|---|---|---|
| **Bronze** | 0 – 99 pts | New / Entry Contributor |
| **Silver** | 100 – 299 pts | Active Contributor |
| **Gold** | 300 – 699 pts | Senior Community Pillar |
| **Platinum** | 700 – 1499 pts | Eminent Mentor & Leader |
| **Fellow** | 1500+ pts | Distinguished Community Fellow |

### 11.2 Core Contribution Categories & Default Policy
| Category (`event_type`) | Base Points | Daily Cap | Cooldown | Counterparty Required |
|---|---|---|---|---|
| `mentoring_session` | 35 | 70 | 30 min | Yes (Student / Mentee) |
| `portfolio_feedback` | 20 | 60 | 10 min | Yes (Student) |
| `mock_interview` | 40 | 80 | 30 min | Yes (Candidate) |
| `community_answer` | 15 | 45 | 5 min | No |
| `twenty_minute_doorway` | 50 | 100 | 20 min | Yes (Guest) |
| `successful_introduction` | 25 | 50 | 60 min | Yes (Recipient) |
| `wisdom_capsule` | 30 | 60 | 30 min | No |
| `positive_feedback` | 10 | 30 | 5 min | Yes (Rater) |

### 11.3 Endpoints Reference
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/reputation/me` | Authenticated | Retrieve own reputation summary, tier, and rolling velocity |
| `GET` | `/api/v1/reputation/history` | Authenticated | Paginated immutable contribution ledger transactions |
| `GET` | `/api/v1/reputation/users/{user_id}` | Public / Auth | Sanitized public reputation card respecting profile visibility |
| `GET` | `/api/v1/reputation/leaderboard` | Public | Permitted community leaderboard (`lifetime`, `30d`, `90d`) |
| `GET` | `/api/v1/reputation/breakdown` | Authenticated | Category-by-category contribution percentage breakdown |
| `GET` | `/api/v1/reputation/policies` | Public | List active contribution policies, point values, and caps |
| `POST` | `/api/v1/reputation/events` | Privileged | Record verified contribution (Faculty/Admin or Service Key) |
| `POST` | `/api/v1/reputation/reversals` | Privileged | Reverse an awarded ledger row creating linked negative adjustment |
| `POST` | `/api/v1/reputation/admin/policies` | Privileged | Create or update points policy configuration |

### 11.4 Example: Record Verified Contribution
```http
POST /api/v1/reputation/events
Authorization: Bearer <FACULTY_JWT_TOKEN>
Content-Type: application/json

{
  "user_id": 42,
  "event_type": "mentoring_session",
  "source_reference": "session:mentoring-oct-17-001",
  "counterparty_user_id": 88,
  "quality_score": 4.8,
  "metadata_payload": {
    "session_topic": "Career Transition to Autonomous Robotics",
    "duration_minutes": 45
  }
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "transaction_id": 104,
  "idempotency_key": "mentoring_session:session:mentoring-oct-17-001:42",
  "points_awarded": 35,
  "new_current_points": 210,
  "new_tier": "Silver",
  "verification_status": "verified",
  "message": "Successfully credited 35 points for verified 'mentoring_session'."
}
```

### 11.5 Example: Linked Reversal of Disputed Award
```http
POST /api/v1/reputation/reversals
Authorization: Bearer <FACULTY_JWT_TOKEN>
Content-Type: application/json

{
  "entry_id": 104,
  "reason": "Host did not attend scheduled session",
  "dispute_reference": "DISPUTE-TICKET-4401"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "transaction_id": 105,
  "idempotency_key": "rev:mentoring_session:session:mentoring-oct-17-001:42",
  "points_awarded": -35,
  "new_current_points": 175,
  "new_tier": "Silver",
  "verification_status": "verified",
  "message": "Successfully reversed transaction #104. Adjusted points by -35."
}
```

### Known Limitations
- **No Payment Processing**: In accordance with platform design, monetary reward processing is excluded. Rewards are limited to mentorship, portfolio evidence, interviews, and referrals.
- **No Server-Side Code Execution**: For security reasons, submitted repositories are not executed or downloaded on the backend server. Evaluation is performed by authorized professional creators inspecting the repository links and live demos.
- **Non-Guaranteed Opportunities**: All recommendations and professional outcomes are deterministic indicators and verifiable awards, not promises or legal guarantees of employment.

