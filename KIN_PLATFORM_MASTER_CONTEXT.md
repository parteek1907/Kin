# KIN PLATFORM — COMPREHENSIVE ARCHITECTURAL CONTEXT & USER FLOW GUIDE

> **Platform Name:** Kin  
> **Tagline:** The Living Proof-of-Work & Verified Professional Connections Network  
> **Core Thesis:** *"A Network, Not A Directory."* Replacing static keyword resumes, cold LinkedIn spam, and unverified claims with empirical career progression, artifact verification, multi-hop warm routing, and privacy-preserving discourse.

---

## 1. Executive Summary & Brand Identity

### 1.1 The Problem With Traditional Alumni Portals & Professional Networks
- **Static Resume Directories:** Users self-report buzzwords (`React, AI, Python`) without demonstrated proof. Recruiters and alumni drown in unverified claims.
- **The "Cold Message" Wall:** Students send thousands of cold InMails/messages that alumni ignore because there is no prior trust, mutual context, or proof of effort.
- **Disconnected Career Navigation:** Career advice is generic and abstract. Students cannot see real chronological paths or deterministic skill gaps.
- **Superficial Metrics:** Existing networks reward vanity engagement, clickbait, and reciprocal likes rather than substantive contributions like mentoring, code reviews, and mock interviews.
- **Zero Privacy for Sensitive Career Questions:** When members face salary negotiations, rejection, toxic workplaces, or career pivots, they cannot post without publicly risking their professional standing.

### 1.2 The Kin Solution
Kin is an end-to-end intelligent alumni and talent ecosystem comprising:
1. **Zero-Form Proof-of-Work:** Direct AST parsing of repositories, verified commits, and real technical artifacts.
2. **Kinetic Force-Directed Physics Graph & Intent Router:** Visualizing the campus trust ecosystem in real time with 60fps physics and natural language intent matching.
3. **Multi-Hop Warm Trust Routing:** Routing introductions through verified advisors (`Student -> Faculty -> Alumnus Founder`) via WhatsApp and web handshakes.
4. **Spatial Glassmorphic Dashboard:** A modern daylight VisionOS-style workspace hosting 7 core differentiating engines.

---

## 2. Complete Technology Stack

| Layer | Technologies Used | Key Responsibilities |
|---|---|---|
| **Frontend Framework** | **Next.js 14.2 (App Router), React 18, TypeScript** | Client-side routing, server/client components, state hydration |
| **Styling & Design System** | **Tailwind CSS, Glassmorphic Obsidian & VisionOS Daylight** | Custom responsive tokens, backdrop blurs (`backdrop-blur-2xl`), terracotta `#E25C38` accents |
| **Motion & Physics** | **Framer Motion, HTML5 Canvas 60fps Engine** | Particle physics, dynamic node repulsion, smooth page transitions, interactive drawers |
| **State Management** | **React Context (`AuthContext`, `NetworkContext`)** | Global auth sessions, graph physics state, intent streaming, WhatsApp simulator |
| **Backend Framework** | **FastAPI 0.115+ (Python 3.11/3.12)** | Asynchronous & synchronous RESTful API, auto OpenAPI documentation |
| **Database & ORM** | **PostgreSQL 16+ (Cloud Neon) / SQLite (tests), SQLAlchemy 2.0+** | Declarative relational schema, strict foreign key constraints, connection pooling |
| **Database Migrations** | **Alembic 1.14+** | 7 linear, reproducible migrations (`0001` through `0007`) |
| **Validation & Serialization** | **Pydantic v2** | High-performance request parsing, strict response data filtering, zero-leak serialization |
| **Security & Auth** | **PyJWT (RFC 7519) & bcrypt** | Salted password hashing, JWT bearer tokens, role-based access control |
| **Testing Engine** | **Pytest 9.1+, HTTPX, TestClient** | 107 automated end-to-end integration and unit tests |

---

## 3. High-Level Website Architecture & Routing Map

```text
Kin Web Ecosystem
├── Public / Unauthenticated Space
│   ├── / (Landing Page: Kinetic Nexus)
│   │   ├── Top Navigation (Kin Logo, Navigation links, "Connect Wallet / Sign In" button)
│   │   ├── Hero Section ("The Living Proof-of-Work & Intent Network")
│   │   ├── <LivingNetworkCanvas /> (60fps Canvas Graph with node repulsion & particle bursts)
│   │   ├── <IntentRouterPanel /> (Natural language intent broadcaster & preset cards)
│   │   ├── <NodeEvidenceDrawer /> (Deep slide-out dossier with code citations & trust paths)
│   │   ├── <WhatsAppBridgeDrawer /> (Interactive smartphone chassis simulator)
│   │   ├── <InstitutionRadarModal /> (Macro telemetry for Deans & placement cells)
│   │   ├── <MicroAuditModal /> (60-second technical proof verification)
│   │   └── <AuthModal /> (Sign in / Sign up tabbed dialog with instant token generation)
│   │
│   └── Floating Quick-Launch Dock -> Enters /dashboard
│
└── Authenticated Space: Glassmorphic Spatial Workspace
    └── /dashboard (KinGlassDashboard)
        ├── Top Glass Status Header (Live time, user initial, notifications, search)
        ├── Central Interactive Work Panoramas:
        │   ├── Tab 1: Overview (Live metric counters, active intent pulse, recent community activity)
        │   ├── Tab 2: Career Time Machine (Stage scrubber, milestones, skill gap analysis)
        │   ├── Tab 3: Skill Bounty Network (Bounties, AST checks, PR submit modal, rubrics)
        │   ├── Tab 4: Qualification-Based Auto-Connect (Threshold slider, policy toggles, criteria breakdown)
        │   ├── Tab 5: Unclaimed Talent Radar (Cross-industry transferable skills radar, bridge scores)
        │   └── Tab 6: Community & Reputation Hub (Social directory, requests, PYMK, Karma ledger, Ghost Mode)
        └── Bottom Floating Spatial Dock (VisionOS frosted glass bar with 6 icon tabs)
```

---

## 4. End-to-End User Journeys (Page by Page Flow)

### 4.1 First-Time Visitor & Unauthenticated Journey (`/`)
1. **Arrival & Visual Wow**: The user lands on `/` and experiences the kinetic canvas. Nodes representing students, alumni, founders, and faculty orbit and dynamically interact.
2. **Intent Exploration**:
   - The user clicks a preset in `<IntentRouterPanel />` (e.g., *"Founder Intent: Fintech startup seeking student with WebCrypto commits"*).
   - The canvas dims non-matching nodes to 15% opacity while pulsing the top 3 matching students with glowing neon cyan rings.
3. **Inspecting Evidence**:
   - Clicking a matching student node opens `<NodeEvidenceDrawer />`.
   - The user inspects real commit citations (e.g. `Commit #a8f921c: "Implemented IndexedDB cryptographic ledger sync"`), AST-extracted language byte breakdowns, and the shortest verified campus trust path (`Student -> Faculty Advisor -> Alumnus`).
4. **Interactive Simulators**:
   - The user opens `<WhatsAppBridgeDrawer />` to test the zero-login WhatsApp gateway. Sending a voice note or text prompt spawns an intent capsule on the graph.
   - Clicking *"Vouch & Handshake"* triggers a celebratory particle burst, transforming the graph edge into glowing solid gold (`#FACC15`).
5. **Authentication**:
   - Clicking *"Sign In"* in the top navigation or on any gated action opens `<AuthModal />`.
   - The user registers or logs in with email/password. A JWT token is stored, setting global auth state in `AuthContext`.
   - The user clicks *"Launch Glassmorphic Dashboard"* to navigate to `/dashboard`.

---

### 4.2 The Glassmorphic Workspace Flow (`/dashboard`)

The dashboard presents a panoramic daylight living-room environment with a bottom horizontal glass dock.

#### TAB 1: OVERVIEW PANORAMA
- **Telemetry Counter Cards:** 76k+ verified builders, 1.5M+ verified commits, $3.6k escrow volume, 47 open bounties, 94.2 network velocity.
- **Real-Time Intent Pulse Ticker:** Interactive playback controls (`Play / Pause / Next / Prev`) streaming active campus connection pulses.
- **Recent Activity Matrix:** Displays real-time student submissions, auto-accepted connections, and verified outcomes.

#### TAB 2: CAREER TIME MACHINE (Major Feature 1)
- **Problem Solved:** Students lack empirical roadmap data when planning multi-year career transitions.
- **Chronological Pathway Timelines:** Displays verified historical transitions (e.g., *Student Researcher -> Systems Engineer -> Staff AI Architect*).
- **Interactive Milestone Scrubber:** Scrubbing through milestones highlights:
  - Role, company, and tenure.
  - Skills acquired during that specific career chapter.
  - Key verified achievements and velocity scores.
- **Deterministic Skill-Gap Analysis:** Compares the user's current skills against real alumni in the target role:
  - Generates readiness score (e.g. 78%).
  - Categorizes missing skills with objective priority tags (`HIGH`, `MEDIUM`, `LOW`) and real-world market frequency.
- **Grounded Insights Engine:** Clearly partitions *Observed Historical Facts* (grounded in actual alumni records) from *Inferred Progression Patterns*, preventing LLM hallucination.

#### TAB 3: SKILL BOUNTY NETWORK (Major Feature 4)
- **Problem Solved:** Technical capability cannot be judged by static resumes; candidates need real proof-of-work.
- **Role-Enforced Marketplace:**
  - Alumni, Founders, and Recruiters post real-world challenges with difficulty tiers (`EASY`, `MEDIUM`, `HARD`, `EXPERT`), reward details (USDC, 1-on-1 mentorship, interview fast-tracks), and evaluation rubrics.
  - Students browse bounties filtered by required skills and AST verification requirements.
- **PR Submission Modal:** Students submit their GitHub repository URL, live deployment URL, and technical architecture summary.
- **Rubric Scoring & Outcomes:** Creators evaluate submissions against transparent criteria (correctness, architecture, testing), issuing verified professional outcomes (mentorship session confirmed, interview referral unlocked).

#### TAB 4: QUALIFICATION-BASED AUTO CONNECTIONS (Major Feature 2)
- **Problem Solved:** Busy alumni and recruiters are overwhelmed with generic connection spam, while qualified candidates get lost in the noise.
- **Personalized Policy Configuration:**
  - Recipients configure acceptance rules: minimum years of experience, minimum verified projects/commits, required skills, preferred skills, allowed universities/departments, and target industries.
- **Dynamic Threshold Slider:** The user adjusts their `qualificationScoreThreshold` (e.g., 64/100).
- **Auto-Accept Toggle:** Recipients explicitly enable or disable `auto_accept_enabled`.
- **Explainable Evaluation Breakdown:**
  - When a connection request arrives, the deterministic rule engine computes a composite score (0-100).
  - The recipient sees a transparent breakdown: criteria satisfied, criteria missed, and a plain-English explanation.
  - If score >= threshold and auto-accept is enabled, the connection is instantly established.
  - If auto-accept is disabled or score is borderline, the request waits in a clean pending queue for manual review.

#### TAB 5: UNCLAIMED TALENT RADAR (Major Feature 5)
- **Problem Solved:** Traditional search engines only match narrow keywords or current job titles, missing high-potential candidates with strong transferable skills.
- **Semantic Bipartite Skill Graph:** Connects adjacent disciplines (e.g., *Game Physics & C++ -> Autonomous Robotics Simulation*; *Distributed Systems -> High-Frequency Trading Infrastructure*).
- **Transferable Bridge Scoring:** Analyzes candidate skills against emerging cross-industry opportunities, providing:
  - Overall match score.
  - Transferable bridge score.
  - Exact "bridge skills" the candidate already possesses.
  - Human-readable rationale explaining why the candidate is qualified for a role they wouldn't normally search for.
- **Actionable Feedback:** Candidates can shortlist, apply, or submit feedback to continuously refine the radar's calibration.

#### TAB 6: COMMUNITY, REPUTATION & GHOST MODE (Features 3, 6, 7)

##### Part A: Social Networking & Connection Management (Feature 3)
- **User Discovery & Multi-Attribute Search:** Search across name, role, institution, department, graduation year, company, job title, industry, and skills.
- **Connection Graph Degree Traversal:** Visual indicators showing 1st-degree, 2nd-degree, or 3rd+ degree connection distance.
- **Mutual Connections Explorer:** Inspect shared mutual contacts before connecting.
- **People You May Know (PYMK):** Deterministic recommendations scored on shared institution (+35), department (+25), mutual connections (+30 each), shared skills (+15 each), and industry (+20).
- **Bidirectional Blocking & Dissolution:** Instantly sever connections, cancel pending requests, and purge users from suggestion feeds.
- **In-App Persistent Notifications:** Real-time event tracking for connection requests, acceptances, and replies with unread badge counters.

##### Part B: Kin Reputation Engine (Feature 6)
- **Contribution-Based Karma:** Rewards verified value creation rather than raw activity.
- **8 Core Categories:**
  1. `mentoring_session` (35 pts)
  2. `portfolio_feedback` (20 pts)
  3. `mock_interview` (40 pts)
  4. `community_answer` (15 pts)
  5. `twenty_minute_doorway` (50 pts)
  6. `successful_introduction` (25 pts)
  7. `wisdom_capsule` (30 pts)
  8. `positive_feedback` (10 pts)
- **Append-Only Immutable Ledger:** Every points transaction is recorded in `kin_ledger_entries` with an enforced unique `idempotency_key`.
- **Reversible Audit Corrections:** Disputed or mistaken awards are adjusted via linked negative transactions (`reversal_of_entry_id`), preserving complete audit trails.
- **5 Reputation Tiers:** Bronze (0-99), Silver (100-299), Gold (300-699), Platinum (700-1499), Fellow (1500+).
- **Anti-Abuse Protections:** Built-in safeguards against self-awarding, rapid point farming, cooldown violations, daily category point caps, and reciprocal collusion rings.

##### Part C: Kin Ghost Mode (Feature 7)
- **Product Objective:** Privacy-preserving participation mode for sensitive career questions, salary discussions, workplace challenges, and advice without public identity linkage.
- **Four-Layer Identity Separation:**
  1. Authenticated Account (`users`)
  2. Pseudonymous Persona (`ghost_personas`) with opaque handles (`ghost-usr-xxxx`) and procedural aliases (e.g. *"Strategic Visionary"*, *"Resilient Navigator"*)
  3. Discussion Layer (`ghost_posts`, `ghost_replies`, `ghost_reactions`) referencing only `persona_id`
  4. Isolated Mapping Layer (`ghost_identity_mappings`) stored separately and inaccessible via public read endpoints
- **Independent Server-Side Entitlements:** Validates subscription status (`GhostEntitlement.is_active_entitlement`) directly in the database. Client-supplied flags are never trusted.
- **Persona Rotation:** Members can rotate their persona at will to start fresh discussions with zero cryptographic linkage to past threads.
- **IDOR Protections:** Authors retain exclusive edit/delete rights over their own posts/replies even if their entitlement expires. Previously published content is **never deleted**.
- **Member Muting & Abuse Reporting:** Members can locally mute abrasive personas; abuse reports trigger moderator queues.
- **Audited De-Anonymization Workflow:** In cases of severe abuse or legal necessity, platform moderators can resolve identities via `/api/v1/ghost/moderation/audit-reveal`, requiring a mandatory written business justification recorded in permanent `ghost_audit_logs`.

---

## 5. Persona-Based User Workflows

### 5.1 The Student Workflow
1. Ingests GitHub profile via `<IngestArtifactModal />` to extract verified AST skills and commit velocity.
2. Explores **Career Time Machine** to benchmark current skills against senior alumni holding their dream roles.
3. Builds and submits solutions to challenges on the **Skill Bounty Network** to earn verified portfolio pieces, mentorship, and interview fast-tracks.
4. Explores **Unclaimed Talent Radar** to discover non-obvious high-match opportunities in adjacent emerging industries.
5. Sends qualified connection requests knowing the **Qualification Auto-Connect** engine evaluates them on merit rather than pedigree.
6. Participates in **Ghost Mode** discussions to ask candid questions about salary negotiation, internship culture, or career setbacks safely.

### 5.2 The Alumnus / Mentor Workflow
1. Publishes real career milestones to the **Career Time Machine** to guide junior students.
2. Sets up a **Qualification-Based Auto Connection Policy** with a threshold (e.g. 70/100) to auto-accept students with genuine projects while filtering spam.
3. Drops quick voice or text intent capsules via the **WhatsApp Action Bridge** without logging into a web portal.
4. Performs 1-tap warm vouches in WhatsApp, instantly generating an automated 3-way intro group for high-match students.
5. Conducts mentoring sessions, mock interviews, and portfolio reviews, accumulating auditable reputation points to climb the **Kin Reputation Tiers** (Gold, Platinum, Fellow).

### 5.3 The Founder / Tech Recruiter Workflow
1. Broadcasts hiring intent capsules targeting specific verified AST capabilities (e.g., *FastAPI, WebCrypto, Rust*).
2. Authors **Skill Bounties** representing real engineering tasks faced by their team.
3. Evaluates submitted PRs and live demos using structured rubric scorecards.
4. Extends direct interview invitations and mentorship sessions to top-scoring builders.

### 5.4 The Faculty Advisor / Placement Officer Workflow
1. Inspects the **Institutional Opportunity & Skill-Gap Radar** to identify macro supply/demand imbalances between curriculum and industry hiring.
2. Serves as a trusted routing node on campus trust graphs, vouching for standout students.
3. Records verified community contributions and awards via administrative endpoints.
4. Exercises audited moderation tools to maintain community integrity and resolve abusive behavior safely.

---

## 6. Security, Privacy & Integrity Guarantees

1. **Strict Server-Side Authorization:** Every privileged action (posting, auto-connecting, reputation awarding, ghost discussions) independently verifies credentials and entitlements in the database.
2. **Zero-Leak API Serialization:** Public serializers explicitly redact private fields (`user_id`, email, password hash, internal fraud flags, dispute references, identity mappings).
3. **Idempotency & Concurrency Safety:** Unique compound keys and idempotency tokens prevent duplicate transactions, connection requests, or double-spending in reputation ledgers.
4. **IDOR & Ownership Defense:** Users cannot mutate, delete, or review entities owned by other users.
5. **Bidirectional Relationship Dissolution:** Blocking a user immediately dissolves existing connections, purges pending requests, and filters both parties from suggestions and search.
6. **Audited Transparency:** Sensitive operations (dispute reversals, identity de-anonymization) mandate explicit business justifications and write to immutable audit tables.

---

## 7. Database Entity Relationship Overview (Alembic 0001–0007)

```text
[User] (Core Auth Account)
  ├── 1:1 ── [Profile] (Skills, Role, Institution, Company, Links)
  ├── 1:N ── [CareerJourney] (Feature 1: Historical Milestones & Roles)
  ├── 1:N ── [ConnectionPolicy] (Feature 2: Auto-Accept Rules & Thresholds)
  ├── 1:N ── [ConnectionRequest] (Feature 2 & 3: Incoming & Outgoing Requests)
  ├── 1:N ── [Connection] (Feature 2 & 3: Established 1st-Degree Edges)
  ├── 1:N ── [UserBlock] (Feature 3: Bidirectional Safety Barriers)
  ├── 1:N ── [Notification] (Feature 3: In-App Persistent Notifications)
  ├── 1:N ── [SkillBountyChallenge] (Feature 4: Challenges Authored)
  ├── 1:N ── [SkillBountySubmission] (Feature 4: Submissions Delivered)
  ├── 1:N ── [RadarFeedback] (Feature 5: Transferable Radar Feedback)
  ├── 1:1 ── [KinReputationSummary] (Feature 6: Points, Velocity & Tier)
  ├── 1:N ── [KinLedgerEntry] (Feature 6: Immutable Points History)
  ├── 1:1 ── [GhostEntitlement] (Feature 7: Premium Privacy Subscription)
  └── 1:N ── [GhostIdentityMapping] (Feature 7: Isolated User -> Persona Link)
                  │
                  ▼
          [GhostPersona] (Feature 7: Opaque Pseudonym Handle)
            ├── 1:N ── [GhostPost] (Sensitive Career Discussions)
            ├── 1:N ── [GhostReply] (Threaded Nested Replies)
            ├── 1:N ── [GhostReaction] (Helpful, Insightful, Supportive)
            └── 1:N ── [GhostPersonaMute] (Client Mutes)
```

---

## 8. Verification & Test Suite Status

The Kin backend includes **107 automated tests** running on an isolated in-memory test database, achieving a **100% pass rate**:

- `tests/test_health.py` (3 tests): Health check, API root discovery, uptime telemetry.
- `tests/test_auth.py` (7 tests): Registration, duplicate protection, bcrypt verification, JWT claims, profile fetching and updates.
- `tests/test_career_time_machine.py` (11 tests): Career milestone logging, stage scrubbers, deterministic skill gap analysis, grounded insight separation.
- `tests/test_qualification_connections.py` (11 tests): Policy evaluation, score calculation, threshold auto-acceptance, queueing.
- `tests/test_social.py` (9 tests): Multi-attribute search, request lifecycles, mutual connections, PYMK scoring, blocking dissolution, notifications.
- `tests/test_skill_bounty.py` (20 tests): Bounties, difficulty filtering, submissions, rubric evaluations, outcome verification.
- `tests/test_unclaimed_talent_radar.py` (20 tests): Semantic bipartite graph, cross-industry bridge scoring, feedback adjustments.
- `tests/test_kin_reputation.py` (15 tests): 8 points categories, immutable ledger, idempotency keys, linked reversals, velocity tiers, anti-abuse collusion defenses.
- `tests/test_ghost_mode.py` (11 tests): Entitlement lifecycle, persona rotation, privacy response sanitization, IDOR ownership protection, threaded replies, muting, abuse reporting, audited moderator reveals.
