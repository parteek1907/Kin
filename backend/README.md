# Conduit Backend - Alumni Network & Professional Connections Platform

A high-performance, modular backend built with FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and Pydantic v2.

---

## 1. Overview & Vision

**Conduit** bridges the gap between university students and alumni. Rather than relying on static profiles or generic advice, Conduit introduces empirical, data-driven career navigation powered by authentic alumni career journeys.

### First Differentiating Feature: Career Time Machine
The **Career Time Machine** enables students to explore real historical career pathways submitted by alumni and professionals.
- **Authentic Journeys**: Real records with dates, companies, skills used, projects, and career transition notes.
- **Chronological Timelines**: Explore complete stage-by-stage transitions (e.g. Intern -> Junior Dev -> Senior ML Engineer).
- **Deterministic Skill-Gap Analysis**: Compares a student's current skill profile against real alumni who actually hold the target role, computing objective priority rankings and empirical learning evidence.
- **Grounded Insights**: Transparently distinguishes *observed historical facts* from *inferred progression patterns* without AI hallucination or fabricated guarantees.
- **AI-Ready Architecture**: Built with an `AIServiceInterface` protocol and deterministic fallback, ready for future LLM integration without code rewrites.

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

The backend lives entirely inside `backend/` and follows a domain-driven, modular structure designed to accommodate 4 additional major features in subsequent phases:

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point, CORS, health check
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py                  # Register, login, /me, profile management routes
│   │   └── router.py                # Central API v1 router mounting all features
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                # Centralized settings via pydantic-settings
│   │   ├── database.py              # SQLAlchemy 2.x engine, SessionLocal, get_db dependency
│   │   └── security.py              # bcrypt password hashing, JWT creation & verification
│   ├── models/
│   │   ├── __init__.py              # Central declarative models export
│   │   ├── user.py                  # User account model
│   │   └── profile.py               # User profile & PlatformRole enums
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                  # Auth request/response schemas
│   │   └── profile.py               # Profile request/response schemas
│   ├── services/
│   │   └── __init__.py              # Cross-cutting service abstractions
│   └── features/
│       └── career_time_machine/     # Feature Module: Career Time Machine
│           ├── __init__.py
│           ├── models.py            # CareerJourney database model & enums
│           ├── schemas.py           # Journey, Timeline, SkillGap, Insights schemas
│           ├── repository.py        # Database queries, visibility filters, pagination
│           ├── service.py           # Domain logic, ownership auth, skill gap engine
│           └── insights.py          # Empirical facts vs inferred patterns, AI-ready interface
├── alembic/
│   ├── env.py                       # Alembic migration environment
│   ├── script.py.mako               # Migration template
│   └── versions/
│       └── 0001_initial_schema.py   # Baseline migration for users, profiles, career_journeys
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  # Pytest fixtures & isolated in-memory test database
│   ├── test_auth.py                 # Registration, login, duplicate email, JWT, profile tests
│   ├── test_career_time_machine.py  # 11 comprehensive tests for Career Time Machine
│   └── test_health.py               # Health check and root discovery tests
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules for Python, virtualenv, and IDE files
├── alembic.ini                      # Alembic CLI configuration
├── docker-compose.yml               # Optional local PostgreSQL container
├── requirements.txt                 # Pinned, tested dependencies
└── README.md                        # Documentation
```

---

## 4. Local Development Setup

### Step 1: Create and Activate Virtual Environment
Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:
- **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  .venv\Scripts\activate.bat
  ```
- **Linux / macOS**:
  ```bash
  source .venv/bin/activate
  ```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy the example environment configuration:

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

You have two options to run PostgreSQL:

#### Option A: Docker (Quickest)
If you have Docker installed, start the local PostgreSQL container:
```bash
docker compose up -d
```
This spins up PostgreSQL 16 on port `5432` with user `postgres` and database `alumni_network`.

#### Option B: Native PostgreSQL Installation
1. Start your local PostgreSQL server service.
2. Open `psql` or pgAdmin and create the database:
   ```sql
   CREATE DATABASE alumni_network;
   ```
3. Update `DATABASE_URL` in `.env` to match your local credentials.

### Step 5: Run Database Migrations
Apply the initial schema to PostgreSQL using Alembic:

```bash
alembic upgrade head
```

To roll back a migration:
```bash
alembic downgrade -1
```

### Step 6: Start the Development Server
```bash
uvicorn app.main:app --reload
```

The server will be available at:
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 5. Running Automated Tests

The test suite runs against an isolated in-memory SQLite database and requires **zero external services or AI API keys**.

Run all tests:
```bash
python -m pytest -v
```

Run tests with test summary:
```bash
python -m pytest -v --tb=short
```

---

## 6. API Reference & Examples

### Health & Discovery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Service health check |
| `GET` | `/` | None | API root discovery with links |

### Authentication & Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | Register account (Student, Alumni, Faculty, Founder, Recruiter) |
| `POST` | `/api/v1/auth/login` | None | Authenticate with email/password; returns JWT token |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Fetch authenticated user details and profile |
| `PATCH` | `/api/v1/auth/profile` | Bearer JWT | Update authenticated user profile |

### Career Time Machine
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

---

## 7. Request & Response Examples

### A. Register User (`POST /api/v1/auth/register`)
**Request:**
```json
{
  "email": "priya.nair@iiitd.ac.in",
  "password": "SecurePassword123!",
  "full_name": "Priya Nair",
  "role": "Alumni",
  "headline": "Senior Machine Learning Engineer at Anthropic",
  "skills": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
  "industry": "Artificial Intelligence"
}
```
**Response (`201 Created`):**
```json
{
  "id": 1,
  "email": "priya.nair@iiitd.ac.in",
  "is_active": true,
  "created_at": "2026-10-17T10:30:00Z",
  "profile": {
    "id": 1,
    "user_id": 1,
    "full_name": "Priya Nair",
    "role": "Alumni",
    "headline": "Senior Machine Learning Engineer at Anthropic",
    "skills": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
    "industry": "Artificial Intelligence",
    "years_of_experience": 0.0,
    "visibility": "public"
  }
}
```

### B. User Login (`POST /api/v1/auth/login`)
**Request:**
```json
{
  "email": "priya.nair@iiitd.ac.in",
  "password": "SecurePassword123!"
}
```
**Response (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "priya.nair@iiitd.ac.in",
    "is_active": true,
    "profile": { ... }
  }
}
```

### C. Create Career Journey (`POST /api/v1/career-time-machine/journeys`)
*Requires `Authorization: Bearer <TOKEN>` header.*

**Request:**
```json
{
  "job_title": "Machine Learning Engineer",
  "company": "Anthropic",
  "industry": "Artificial Intelligence",
  "start_date": "2023-01-15",
  "end_date": null,
  "is_current": true,
  "description": "Leading model evaluation and fine-tuning pipelines.",
  "skills_used": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
  "projects_or_achievements": [
    "Optimized inference throughput by 35% using TensorRT",
    "Built automated continuous evaluation pipeline"
  ],
  "career_transition_notes": "Transitioned from Software Engineer by mastering PyTorch and distributed training.",
  "visibility": "public"
}
```
**Response (`201 Created`):**
```json
{
  "id": 1,
  "user_id": 1,
  "job_title": "Machine Learning Engineer",
  "company": "Anthropic",
  "industry": "Artificial Intelligence",
  "start_date": "2023-01-15",
  "end_date": null,
  "is_current": true,
  "skills_used": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
  "projects_or_achievements": [
    "Optimized inference throughput by 35% using TensorRT",
    "Built automated continuous evaluation pipeline"
  ],
  "career_transition_notes": "Transitioned from Software Engineer by mastering PyTorch and distributed training.",
  "visibility": "public",
  "verification_status": "unverified",
  "author_name": "Priya Nair",
  "author_role": "Alumni",
  "author_headline": "Senior Machine Learning Engineer at Anthropic"
}
```

### D. Chronological Timeline (`GET /api/v1/career-time-machine/journeys/1/timeline`)
**Response (`200 OK`):**
```json
{
  "user_id": 1,
  "professional_name": "Priya Nair",
  "professional_headline": "Senior Machine Learning Engineer at Anthropic",
  "current_role": "Machine Learning Engineer at Anthropic",
  "total_stages": 2,
  "stages": [
    {
      "stage_number": 1,
      "journey_id": 2,
      "job_title": "Software Development Intern",
      "company": "StartUp Labs",
      "industry": "Software Engineering",
      "start_date": "2021-06-01",
      "end_date": "2022-12-31",
      "is_current": false,
      "duration_months": 18,
      "skills_used": ["Python", "Django", "SQL"],
      "projects_or_achievements": ["Built customer analytics dashboard"],
      "career_transition_notes": "First professional engineering role during college.",
      "verification_status": "unverified"
    },
    {
      "stage_number": 2,
      "journey_id": 1,
      "job_title": "Machine Learning Engineer",
      "company": "Anthropic",
      "industry": "Artificial Intelligence",
      "start_date": "2023-01-15",
      "end_date": null,
      "is_current": true,
      "duration_months": 45,
      "skills_used": ["Python", "PyTorch", "Kubernetes", "Transformers", "MLOps"],
      "projects_or_achievements": [
        "Optimized inference throughput by 35% using TensorRT"
      ],
      "career_transition_notes": "Transitioned from Software Engineer by mastering PyTorch and distributed training.",
      "verification_status": "unverified"
    }
  ]
}
```

### E. Deterministic Skill Gap Analysis (`POST /api/v1/career-time-machine/skill-gap`)
**Request:**
```json
{
  "target_role": "Machine Learning Engineer",
  "current_skills": ["Python", "SQL"]
}
```
**Response (`200 OK`):**
```json
{
  "target_role": "Machine Learning Engineer",
  "current_skills": ["Python", "SQL"],
  "matching_skills": ["Python"],
  "potential_skill_gaps": ["PyTorch", "Transformers", "Kubernetes", "MLOps"],
  "suggested_priorities": [
    {
      "skill": "PyTorch",
      "priority": "High",
      "reason": "Essential core skill observed in 100.0% (1/1) of alumni records in this role.",
      "frequency_in_target_records": 1,
      "percentage_of_profiles": 100.0
    },
    {
      "skill": "Transformers",
      "priority": "High",
      "reason": "Essential core skill observed in 100.0% (1/1) of alumni records in this role.",
      "frequency_in_target_records": 1,
      "percentage_of_profiles": 100.0
    }
  ],
  "relevant_projects_or_experiences": [
    {
      "project_or_achievement": "Optimized inference throughput by 35% using TensorRT",
      "context_role": "Machine Learning Engineer",
      "context_company": "Anthropic"
    }
  ],
  "observed_transition_notes": [
    "Transitioned from Software Engineer by mastering PyTorch and distributed training."
  ],
  "analyzed_records_count": 1,
  "disclaimer": "Analysis derived from 1 verified or alumni-submitted record(s) matching 'Machine Learning Engineer'. These suggestions highlight observed historical trends and are not guarantees of career outcomes."
}
```

### F. Career Insights (`GET /api/v1/career-time-machine/insights?query=Machine Learning`)
**Response (`200 OK`):**
```json
{
  "target_query": "Machine Learning",
  "total_journeys_analyzed": 1,
  "common_entry_roles": ["Software Development Intern"],
  "common_transitions": [
    {
      "from_role": "Software Development Intern",
      "to_role": "Machine Learning Engineer",
      "frequency": 1
    }
  ],
  "in_demand_skills": [
    { "skill": "Python", "count": 2, "prevalence_percentage": 100.0 },
    { "skill": "PyTorch", "count": 1, "prevalence_percentage": 50.0 },
    { "skill": "Transformers", "count": 1, "prevalence_percentage": 50.0 }
  ],
  "average_duration_per_stage_months": 31.5,
  "observed_facts": [
    "Analyzed 1 historical record(s) matching 'Machine Learning' across 1 distinct professional profile(s).",
    "Most frequent entry-level stepping stone observed: 'Software Development Intern' (1 alumni started here).",
    "Top observed skill across associated roles is 'Python' appearing in 2 career stages."
  ],
  "inferred_patterns": [
    "Empirical progression indicates a pathway from 'Software Development Intern' to 'Machine Learning Engineer' observed 1 times.",
    "Professionals spend an average of 31.5 months in a given career stage before advancing or pivoting."
  ],
  "methodology": "Empirical Bayesian aggregation over stored PostgreSQL career journey records.",
  "ai_enhanced": false,
  "disclaimer": "All conclusions are derived strictly from actual platform records and do not guarantee personal outcomes."
}
```

---

## 8. Current Limitations & Roadmap

### Current Version (v1.0.0)
- **Data Grounding**: All insights and skill gap analyses are strictly backed by records in the database. If no alumni have submitted records for a specific role, the system returns an honest empty result.
- **AI Integration**: AI Provider interface is scaffolded and tested; default operation is 100% deterministic and requires no external API keys.

### Upcoming Features Roadmap
The backend architecture is structured to support 4 upcoming major feature modules in subsequent iterations:
1. **Module 2: Mentorship Matching & Session Booking** (`app/features/mentorship/`)
2. **Module 3: Mock Technical Interviews & Feedback Loop** (`app/features/mock_interviews/`)
3. **Module 4: Verified Alumni Directory & Referral Board** (`app/features/alumni_directory/`)
4. **Module 5: University Chapters & Networking Events** (`app/features/networking_events/`)
