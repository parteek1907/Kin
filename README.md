# KIN — The Living Proof-of-Work & Verified Talent Network

> **Track:** Alumni Network & Professional Connections  
> **Brand:** KIN (Minimalist geometric "K" anchor pillar with terracotta connection node)  
> **Core Thesis:** *"A Network, Not A Directory."* Replacing static keyword resumes, cold LinkedIn spam, and unverified claims with empirical career progression, artifact verification, multi-hop warm routing, and privacy-preserving discourse.

---

## ⚡ 1. The Core Philosophy: "A Network, Not A Directory"

Traditional alumni portals fail because they are static directories where users manually type unverified keywords (`React, AI, Python`) and spam alumni with cold messages that get ignored.

**KIN is NOT a directory.** It replaces static profile forms, generic job boards, and cold-DM walls with an **Artifact-Verified Intent & Multi-Hop Warm Routing Network**:

1. **EXPERTISE (Zero-Form Proof-of-Work):** Automatically extracted and verified from real GitHub repositories, commits, dependencies, and research papers—never self-reported keywords.
2. **INTENT (Live Broadcast Capsules):** Time-bound, high-signal problem statements and opportunities broadcast via the Web UI or WhatsApp.
3. **OPPORTUNITIES (Multi-Hop Warm Trust Paths):** Every connection is routed through the shortest verified campus trust path (e.g., `Student -> Faculty Advisor -> Alumnus Founder`) via a 1-tap WhatsApp/Web Vouch handshake.
4. **PRIVACY & REPUTATION:** Built-in contribution-based reputation ledger and cryptographically separated Ghost Mode discussions.

---

## 🚀 2. Two Primary User Surfaces

### Surface A: The Kinetic Frontline (`/`)
The visual, interactive entry point to campus intelligence:
- **Interactive Force-Directed Physics Graph (`<LivingNetworkCanvas />`)**: 60fps HTML5 Canvas physics engine with node repulsion, traveling signal particles, and dynamic glow/dimming based on active intents.
- **Natural Language Intent Router (`<IntentRouterPanel />`)**: Broadcasts hiring, research, and collaboration problem statements parsed against verified repository ASTs.
- **Citation-Grounded Evidence Dossier (`<NodeEvidenceDrawer />`)**: Pinpoints exact commit hashes, code citations, and the shortest verified campus trust path.
- **Zero-Login WhatsApp Action Bridge (`<WhatsAppBridgeDrawer />`)**: Smartphone chassis simulator enabling voice/text intent drops and 1-tap mutual vouches that turn graph edges solid glowing gold (`#FACC15`).
- **Firebase Auth & Gemini Vision AI Verification Modal (`<AuthModal />`)**: Multi-step onboarding with Firebase authentication, role selection (Student vs. Professional), document upload dropzone, and **Gemini Vision AI OCR** scanning.

### Surface B: The Spatial Glassmorphic Dashboard (`/dashboard`)
A panoramic daylight VisionOS-style workspace featuring 6 interactive feature environments accessible via a floating frosted bottom dock:
1. **Overview Panorama:** Metric counters (76k+ verified builders, 1.5M+ commits, $3.6k volume), intent pulse streamer, and recent verified activities.
2. **Career Time Machine:** Milestone progression scrubber, empirical pathway timelines, and deterministic skill-gap analyzer.
3. **Skill Bounty Network:** Challenge marketplace, difficulty filters, PR submission drawer, rubric scoring, and verified outcomes.
4. **Qualification Auto-Connect:** Acceptance threshold slider (0–100), policy criteria breakdown, auto-accept toggle, and pending queue.
5. **Unclaimed Talent Radar:** Bipartite transferable skill graph, cross-industry bridge scoring, and candidate feedback loop.
6. **Community, Reputation & Ghost Hub:** Multi-attribute directory, People You May Know (PYMK), Kin Contribution Karma ledger, and Ghost Mode privacy discussions.

---

## 🌟 3. Core Feature Engines

### 1. Firebase Auth & Gemini Vision ID Verification (New)
- **Firebase Authentication:** Multi-provider authentication supporting Email/Password and Google One-Tap Popup (`signInWithPopup`).
- **Student vs. Professional Onboarding Wizard:**
  - **Student Path:** Collects official Student ID / University Roll Number and Institution.
  - **Professional Path:** Collects Business ID / Corporate Registration / Work ID and Company.
- **Gemini Vision AI OCR Scanner:** Built-in document upload dropzone supporting images and PDFs. Users can click `"✨ AI Scan & Auto-Fill with Gemini"` to automatically extract credentials via Google's Gemini Vision API (`gemini-1.5-flash`).
- **Direct Database Persistence:** Synchronizes with backend `POST /api/v1/auth/firebase-sync` to store verified credentials in the database with status `verified_student` or `verified_professional`.

### 2. Career Time Machine (Feature 1)
- **Authentic Timelines:** Real historical career pathway records with companies, dates, verified skills acquired, and transition milestones.
- **Interactive Milestone Scrubber:** Scrub through career chapters to see what technical skills were required at each stage.
- **Deterministic Skill-Gap Analysis:** Compares candidate skills against alumni in the target role, ranking missing skills by market frequency and priority (`HIGH`, `MEDIUM`, `LOW`).
- **Grounded Insights:** Partitions *observed historical facts* from *inferred progression patterns*, preventing AI hallucinations.

### 3. Qualification-Based Auto Connections (Feature 2)
- **Rule-Based Acceptance Policies:** Configurable rules based on years of experience, verified project/commit counts, required skills, and target institutions.
- **Explainable Scoring Engine:** Evaluates incoming connection requests against the recipient's policy, generating transparent match breakdowns.
- **Explicit Recipient Control:** Automatic acceptance must be explicitly enabled (`auto_accept_enabled`). Borderline requests wait cleanly in a manual review queue.

### 4. Complete Social Networking & Connection Management (Feature 3)
- **Multi-Attribute Discovery:** Search across full name, role, institution, department, graduation year, company, job title, industry, and skills.
- **Graph Distance Traversal:** Visual indicators for 1st-degree, 2nd-degree, and 3rd+ degree connections.
- **People You May Know (PYMK):** Explainable recommendation scoring (+35 institution, +25 department, +30 per mutual connection, +15 per shared skill, +20 industry).
- **Bidirectional Blocking & Dissolution:** Instantly dissolves connections, cancels pending requests, and filters blocked members from search and suggestions.
- **Persistent In-App Notifications:** Real-time event tracking for connection requests, acceptances, and replies.

### 5. Skill Bounty Network (Feature 4)
- **Proof-of-Work Over Claims:** Students demonstrate real capabilities by solving engineering challenges authored by founders, alumni, and recruiters.
- **Structured Rubric Evaluations:** Submissions include GitHub repositories and live demos evaluated on correctness, architecture, and code quality.
- **Verified Professional Outcomes:** Earn confirmed mentorship sessions, interview fast-tracks, and portfolio pieces.

### 6. Unclaimed Talent Radar (Feature 5)
- **Transferable Skills Graph:** Connects adjacent disciplines (e.g., *Game Physics -> Autonomous Robotics Simulation*; *Distributed Systems -> High-Frequency Trading*).
- **Cross-Industry Bridge Scoring:** Computes match scores and reveals the exact bridge skills a candidate already possesses for roles they wouldn't think to search for.

### 7. Kin Reputation Engine (Feature 6)
- **Contribution-Based Karma:** Rewards verified value creation rather than vanity engagement.
- **8 Contribution Categories:** Mentoring sessions (35 pts), portfolio reviews (20 pts), mock interviews (40 pts), verified community answers (15 pts), 20-minute doorway chats (50 pts), introductions (25 pts), wisdom capsules (30 pts), and positive feedback (10 pts).
- **Immutable Append-Only Ledger:** Every transaction is written to `kin_ledger_entries` with an enforced unique `idempotency_key`.
- **Reversible Audit Corrections:** Disputed interactions are corrected through linked negative adjustment records (`reversal_of_entry_id`).
- **5 Standing Tiers:** Bronze (0-99), Silver (100-299), Gold (300-699), Platinum (700-1499), and Fellow (1500+).
- **Hardened Anti-Abuse Defenses:** Built-in safeguards against rapid farming, cooldown violations, daily caps, and collusion rings.

### 8. Kin Ghost Mode (Feature 7)
- **Genuine Privacy Boundary:** Allows eligible members with active entitlements to participate in sensitive career discussions under an opaque persona (`ghost-usr-xxxx`).
- **Four-Layer Identity Separation:** Separates Authenticated Accounts (`users`), Personas (`ghost_personas`), Content (`ghost_posts`, `ghost_replies`), and the Restricted Mapping (`ghost_identity_mappings`).
- **Independent Server-Side Entitlement:** Verifies subscription status in the database on every action. Previously published content is never deleted when entitlements expire.
- **Audited Moderator De-Anonymization:** High-severity abuse reports permit moderators to resolve identities only with a mandatory, documented justification stored in permanent `ghost_audit_logs`.

### 9. Wisdom Capsule & 90-Second Mock Interviews (Feature 8)
- **Alumni Mock Interviews:** Interviewer profiles, customizable availability slots, and structured evaluation rubrics.
- **Automated Feedback & Scores:** Structured technical evaluation across problem-solving, system design, and communication.

---

## 🛠️ 4. Full Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **Next.js 14.2 (App Router)** | React 18, TypeScript, Server & Client Components |
| **Styling & Design System** | **Tailwind CSS** | VisionOS daylight glassmorphism, terracotta accents (`#E25C38`) |
| **Motion & Physics** | **Framer Motion & HTML5 Canvas** | 60fps force-directed graph with traveling particle signals |
| **Client Auth & AI** | **Firebase SDK & Gemini Vision API** | Firebase Auth (`akin-1024c`) + Gemini 1.5 Flash Vision OCR |
| **Backend Framework** | **FastAPI 0.115+** | High-performance Python 3.11/3.12 REST API |
| **Database & ORM** | **PostgreSQL 16+ & SQLAlchemy 2.0+** | Declarative relational schema with strict relationship cascades |
| **Database Migrations** | **Alembic 1.14+** | 9 linear, reproducible migrations (`0001` to `0009`) |
| **Security & Tokens** | **PyJWT & Salted bcrypt** | RFC 7519 access tokens, secure password hashing, IDOR protection |
| **Test Suite** | **Pytest 9.1+ & HTTPX** | 114 automated integration and unit tests (100% pass rate) |

---

## 🗄️ 5. Database Schema & Migrations (Alembic 0001–0009)

The database schema is strictly version-controlled with Alembic:
1. `0001_initial_schema`: Users, Profiles, and Career Journey models.
2. `0002_qualification_connections`: Connection Policies, Connection Requests, and Connections.
3. `0003_social_networking`: User Blocks and Persistent Notifications.
4. `0004_unclaimed_talent_radar`: Opportunities and Talent Radar Feedback.
5. `0005_skill_bounty_network`: Challenges, Submissions, Reviews, and Outcomes.
6. `0006_kin_reputation_engine`: Points Policies, Summaries, Immutable Ledger Entries, and Audit Logs.
7. `0007_kin_ghost_mode`: Ghost Entitlements, Personas, Identity Mappings, Posts, Replies, Reactions, and Audit Logs.
8. `0008_mock_interviews`: Interviewer Profiles, Slots, Mock Bookings, and Evaluation Rubrics.
9. `0009_firebase_auth_verification`: Firebase Auth UID, student roll numbers / IDs, business / corporate IDs, and verification statuses.

---

## 🧪 6. Automated Test Suite (114 Tests)

The backend features **114 automated tests** with a **100% pass rate**:

```bash
cd backend
python -m pytest
# ================= 114 passed, 1 warning in ~4m =================
```

- `tests/test_auth.py` (9 tests): Registration, login, bcrypt salt, JWT, and Firebase Auth student/business ID sync.
- `tests/test_career_time_machine.py` (11 tests): Career pathways, timelines, skill gaps, grounded insights.
- `tests/test_health.py` (3 tests): Health check, API root discovery, uptime telemetry.
- `tests/test_qualification_connections.py` (11 tests): Policy evaluation, score calculation, threshold auto-acceptance.
- `tests/test_social.py` (9 tests): Multi-attribute search, request lifecycles, PYMK scoring, blocking dissolution.
- `tests/test_skill_bounty.py` (20 tests): Bounties, difficulty filtering, submissions, rubric evaluations, outcome verification.
- `tests/test_unclaimed_talent_radar.py` (20 tests): Semantic bipartite graph, cross-industry bridge scoring, feedback adjustments.
- `tests/test_kin_reputation.py` (15 tests): 8 points categories, immutable ledger, reversals, anti-abuse velocity defense.
- `tests/test_ghost_mode.py` (11 tests): Entitlements, identity separation, persona rotation, IDOR protections, audited reveals.
- `tests/test_mock_interviews.py` (5 tests): Interviewer profiles, availability slots, state machines, questions & rubrics, dispute workflows.

---

## 🏃 7. Local Development Setup

### Prerequisites
- **Node.js**: v18+ or v20+ (`node --version`)
- **Python**: v3.11+ or v3.12+ (`python --version`)
- **Git**: Installed

### Step 1: Clone & Configure Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (includes Firebase SDK)
npm install

# Start Next.js development server
npm run dev
# Running on http://localhost:3000
```

To configure live Gemini Vision OCR scanning, add your key in `frontend/.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 2: Configure & Run Backend
```bash
# Open a new terminal and navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
# Running on http://localhost:8000
# Interactive Swagger docs: http://localhost:8000/docs
```

---

## 👥 8. Author & Contribution Credits

- **Repository:** [https://github.com/parteek1907/Kin](https://github.com/parteek1907/Kin) (originally HackShift-IIITD)
- **Lead Contributors:** `adityaa6060`, `parteek1907`, `Darsh Ohri`
- **License:** MIT License
