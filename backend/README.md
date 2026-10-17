# Conduit Backend - Alumni Network & Professional Connections Platform

A high-performance, modular backend built with FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and Pydantic v2.

---

## 1. Overview & Vision

**Conduit** bridges the gap between university students and alumni. Rather than relying on static profiles or generic advice, Conduit introduces empirical, data-driven career navigation and intelligent, qualification-based professional networking.

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

---

## 2. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Language** | Python 3.11+ / 3.12 | Modern type-annotated Python |
| **Framework** | FastAPI 0.115+ | High-performance async/sync REST API with auto OpenAPI docs |
| **Database** | PostgreSQL 16+ | Enterprise relational database |
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
│   │   └── router.py                                # Central API v1 router mounting all features
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                                # Centralized settings via pydantic-settings
│   │   ├── database.py                              # SQLAlchemy 2.x engine, SessionLocal, get_db dependency
│   │   └── security.py                              # bcrypt password hashing, JWT creation & verification
│   ├── models/
│   │   ├── __init__.py                              # Central declarative models export
│   │   ├── user.py                                  # User account model & connection relationships
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
│       └── qualification_connections/               # FEATURE 2: Qualification-Based Auto Connections
│           ├── __init__.py
│           ├── models.py                            # ConnectionPolicy, ConnectionRequest, Connection, EvaluationLog
│           ├── schemas.py                           # Policy, Request, Evaluation, Connection schemas
│           ├── repository.py                        # DB queries, policy lookups & connection transactions
│           ├── service.py                           # Request workflow, auto-acceptance & manual review logic
│           ├── evaluator.py                         # Deterministic rule-based evaluation engine
│           ├── permissions.py                       # Ownership, authorization & duplicate checks
│           └── router.py                            # REST endpoints for policies, evaluations, requests
├── alembic/
│   ├── env.py                                       # Alembic migration environment
│   ├── script.py.mako                               # Migration template
│   └── versions/
│       ├── 0001_initial_schema.py                   # Migration 1: users, profiles, career_journeys
│       └── 0002_qualification_connections.py       # Migration 2: policies, requests, connections, logs
├── tests/
│   ├── __init__.py
│   ├── conftest.py                                  # Pytest fixtures & isolated in-memory test database
│   ├── test_health.py                               # Health check and root discovery tests
│   ├── test_auth.py                                 # Registration, login, duplicate email, JWT, profile tests
│   ├── test_career_time_machine.py                  # 11 tests for Career Time Machine
│   └── test_qualification_connections.py           # 11 tests for Qualification-Based Auto Connections
├── .env.example                                     # Environment variable template
├── .gitignore                                       # Git ignore rules for Python, virtualenv, and IDE files
├── alembic.ini                                      # Alembic CLI configuration
├── docker-compose.yml                               # Optional local PostgreSQL container
├── requirements.txt                                 # Pinned, tested dependencies
└── README.md                                        # Documentation
```

---

## 4. Local Development Setup

### Step 1: Create and Activate Virtual Environment
```bash
cd backend
python -m venv .venv
```

Activate:
- **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
- **Linux / macOS**: `source .venv/bin/activate`

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Ensure `.env` contains your desired settings:
```env
ENVIRONMENT=development
PROJECT_NAME="Conduit Alumni Network API"
API_V1_STR="/api/v1"
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/alumni_network
SECRET_KEY=generate-a-secure-random-32-byte-hex-string-for-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### Step 4: Database Setup (PostgreSQL)

#### Option A: Docker Compose (Quickest)
```bash
docker compose up -d
```
Spins up PostgreSQL 16 on port `5432` with database `alumni_network`.

#### Option B: Native PostgreSQL Installation
1. Start PostgreSQL server.
2. Create the database:
   ```sql
   CREATE DATABASE alumni_network;
   ```
3. Update `DATABASE_URL` in `.env`.

### Step 5: Run Database Migrations
Apply migrations to PostgreSQL using Alembic:

```bash
alembic upgrade head
```

### Step 6: Start the Development Server
```bash
uvicorn app.main:app --reload
```

- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 5. Running Automated Tests

The automated test suite runs against an isolated in-memory SQLite database and requires **zero external services or AI API keys**.

Run all 32 tests:
```bash
python -m pytest -v
```

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
| `POST` | `/api/v1/auth/login` | None | Authenticate with email/password; returns JWT token |
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
| `POST` | `/api/v1/qualification-connections/policies` | Bearer JWT | Create connection acceptance policy (auto_accept disabled by default) |
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

---

## 7. Request & Response Examples: Qualification Connections

### A. Create Connection Acceptance Policy (`POST /api/v1/qualification-connections/policies`)
*Recipient configures their criteria. `auto_accept_enabled` defaults to `false` and must be explicitly enabled.*

**Request:**
```json
{
  "policy_name": "ML Mentorship & Connections Policy",
  "required_skills": ["Python", "Machine Learning"],
  "preferred_skills": ["PyTorch", "MLOps"],
  "relevant_industries": ["Artificial Intelligence"],
  "min_project_count": 2,
  "min_years_experience": 1.0,
  "qualification_requirements": ["B.Tech", "M.S."],
  "auto_accept_enabled": true,
  "is_active": true
}
```

**Response (`201 Created`):**
```json
{
  "id": 1,
  "user_id": 2,
  "policy_name": "ML Mentorship & Connections Policy",
  "required_skills": ["Python", "Machine Learning"],
  "preferred_skills": ["PyTorch", "MLOps"],
  "relevant_industries": ["Artificial Intelligence"],
  "min_project_count": 2,
  "min_years_experience": 1.0,
  "qualification_requirements": ["B.Tech", "M.S."],
  "auto_accept_enabled": true,
  "is_active": true,
  "created_at": "2026-10-17T11:00:00Z",
  "updated_at": "2026-10-17T11:00:00Z"
}
```

### B. Evaluate Candidate Against Policy (`POST /api/v1/qualification-connections/evaluate`)
**Request:**
```json
{
  "policy_id": 1,
  "candidate_user_id": 1
}
```

**Response (`200 OK`):**
```json
{
  "policy_id": 1,
  "policy_name": "ML Mentorship & Connections Policy",
  "evaluator_user_id": 2,
  "candidate_user_id": 1,
  "eligibility_status": "qualified",
  "auto_accept_eligible": true,
  "manual_review_required": false,
  "match_score": 90.0,
  "criteria_satisfied": [
    "Required skill 'Python' verified.",
    "Required skill 'Machine Learning' verified.",
    "Preferred skill 'PyTorch' matched (+bonus).",
    "Domain alignment verified: 'Artificial Intelligence'.",
    "Project criterion met: 2 project(s) documented (minimum: 2).",
    "Experience criterion met: 1.5 years (minimum: 1.0).",
    "Qualification verified: 'B.Tech'."
  ],
  "criteria_not_satisfied": [],
  "missing_information": [],
  "explanation": "Policy Evaluation for 'ML Mentorship & Connections Policy' (Score: 90.0/100.0):\n- Status: QUALIFIED\n- Decision: Automatically accepted (all mandatory criteria satisfied and recipient explicitly enabled auto-acceptance).",
  "disclaimer": "Policy evaluations are empirical matching assessments and do not constitute job offers or referrals."
}
```

### C. Send Request with Automatic Acceptance (`POST /api/v1/qualification-connections/requests`)
*When all mandatory criteria are satisfied and the recipient enabled `auto_accept_enabled`, the connection request is accepted immediately and added to mutual connections.*

**Request:**
```json
{
  "recipient_id": 2,
  "message": "Hi Priya, I'd love to connect and learn about your distributed training work at Anthropic!"
}
```

**Response (`201 Created`):**
```json
{
  "id": 1,
  "sender_id": 1,
  "recipient_id": 2,
  "policy_id": 1,
  "status": "accepted",
  "auto_accepted": true,
  "message": "Hi Priya, I'd love to connect and learn about your distributed training work at Anthropic!",
  "evaluation_summary": {
    "eligibility_status": "qualified",
    "auto_accept_eligible": true,
    "match_score": 90.0
  },
  "created_at": "2026-10-17T11:05:00Z",
  "updated_at": "2026-10-17T11:05:00Z",
  "sender_name": "Aarav Sharma",
  "sender_headline": "Junior year CS student at IIITD",
  "recipient_name": "Priya Nair"
}
```

---

## 8. Current Limitations & Roadmap

### Current Version (v1.1.0)
- **Deterministic Transparency**: Qualification decisions are based entirely on verifiable profile entries, documented projects, and historical career journeys.
- **Safety First**: AI models are never allowed to override human policy settings or auto-accept requests without human consent.

### Upcoming Features Roadmap
The backend architecture is structured to support the remaining major feature modules:
1. **Module 3: Mentorship Matching & Session Booking** (`app/features/mentorship/`)
2. **Module 4: Mock Technical Interviews & Feedback Loop** (`app/features/mock_interviews/`)
3. **Module 5: University Chapters & Networking Events** (`app/features/networking_events/`)
