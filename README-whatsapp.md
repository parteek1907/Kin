# KIN WhatsApp Cloud API Integration Guide

This guide details the architecture, setup instructions, template approvals, and troubleshooting for the **KIN** zero-app WhatsApp experience powered by the **Meta WhatsApp Cloud API (Graph API)**.

---

## 1. Architecture Overview

KIN allows college alumni to hire, find interns, mentors, or collaborators without downloading an app or logging in:
1. **Entry**: An alumnus messages KIN via WhatsApp (`wa.me` link or QR code).
   - If known from imported institutional records: greeted by name.
   - If new: an in-chat onboarding gathers name, college, and graduating batch, recording explicit consent with a timestamp.
2. **Voice Notes & Audio**:
   - Inbound voice notes (`ogg/opus`) are automatically fetched from Meta Graph API using Bearer authorization.
   - Transcribed via swappable provider (default OpenAI Whisper) with auto-detection for English, Hindi, and Hinglish.
   - Audio files are deleted immediately after transcription. Audio > 2 minutes or > 16 MB is politely rejected.
3. **Structured Requirement Extraction**:
   - Prompt-injection safe LLM extracts `title`, `type` (`hire` | `intern` | `mentor` | `collaborator` | `freelance`), `must_have_skills`, `location_or_remote`, `headcount`, `urgency`, and `summary`.
   - Validated against a strict Zod schema. If critical fields are missing, asks at most 2 clarifying questions.
   - Echoes understanding in the user's language with confirmation buttons: `[Find candidates]`, `[Edit]`, `[Cancel]`.
4. **Matching Engine (`lib/matching`)**:
   - Hard filters: candidate is discoverable, available, and location-compatible.
   - Deterministic scoring (0–100) combining skill overlap (35%), semantic similarity (25%), experience fit (15%), trust proximity (15%), and recency of activity (10%).
   - **Strict Non-Discrimination**: Protected attributes (gender, age, religion, caste, region) are NEVER factored into scoring.
5. **Delivery & Privacy**:
   - Header message + individual candidate cards (name, headline, fit %, why they match, skills).
   - **Never exposes phone or email**.
   - Interactive options: `[Show 5 more]`, `[Refine requirement]`, `[Done]`.
6. **Double Opt-In Introductions**:
   - Alumnus clicks `[Request intro]`.
   - Candidate receives approved template `kin_intro_request` with quick-reply buttons `[Yes]` `[Not now]`.
   - On `Yes`: both parties receive direct `wa.me` links to connect. Contact details are shared only upon mutual consent.
   - On `Not now` or no reply in 48 hours: alumnus is notified and offered the next best match.
   - Candidates can reply `STOP` to opt out immediately.

---

## 2. Environment Variables

Create `.env` in the `frontend/` directory (or repo root for Vercel):

```env
# Meta WhatsApp Cloud API (Graph API) - Server-side only
WA_ACCESS_TOKEN=your_permanent_system_user_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_BUSINESS_ACCOUNT_ID=your_business_account_id
WA_APP_SECRET=your_meta_app_secret
WA_VERIFY_TOKEN=your_custom_webhook_verify_token
WA_GRAPH_VERSION=v21.0
NEXT_PUBLIC_WA_BUSINESS_NUMBER=919811022678

# AI Transcription & Structured Extraction
TRANSCRIPTION_PROVIDER=openai     # openai | whisper | mock
TRANSCRIPTION_API_KEY=your_openai_or_groq_api_key
LLM_API_KEY=your_openai_api_key
MATCH_WEIGHTS=                    # Optional JSON override for matching weights

# Database URL for Prisma (SQLite for local dev, Postgres-compatible)
DATABASE_URL="file:./dev.db"
```

---

## 3. Meta Developer Dashboard Setup

### Step 1: Create Business App
1. Go to [developers.facebook.com](https://developers.facebook.com/) > **My Apps** > **Create App**.
2. Select **Other** > **Business**.
3. Add the **WhatsApp** product to your app.

### Step 2: System User & Permanent Token
1. In Meta Business Manager, navigate to **Business Settings** > **Users** > **System Users**.
2. Create an Admin System User.
3. Assign assets: your WhatsApp Business Account.
4. Generate a permanent token with permissions: `whatsapp_business_messaging`, `whatsapp_business_management`.
5. Set `WA_ACCESS_TOKEN`.

### Step 3: Webhook Configuration
1. Start your local dev server:
   ```bash
   npm run dev
   ```
2. Start an ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
3. In Meta Dashboard > **WhatsApp** > **Configuration**:
   - **Callback URL**: `https://<your-ngrok-id>.ngrok-free.app/api/whatsapp/webhook`
   - **Verify Token**: value of `WA_VERIFY_TOKEN`
   - Click **Verify and Save**.
4. In Webhook Fields, subscribe to **`messages`**.

---

## 4. Message Templates Setup (WhatsApp Manager)

In Meta WhatsApp Manager > **Account Tools** > **Message Templates**, submit the 5 required templates defined in [`docs/whatsapp-templates.md`](file:///home/parteek1907/Projects/IIITD/docs/whatsapp-templates.md):

1. **`kin_intro_request`** (Category: `UTILITY`, Quick-Replies: `Yes`, `Not now`)
   - Text: `{{1}} from {{2}} is looking for {{3}}. Interested in connecting?`
2. **`kin_intro_accepted`** (Category: `UTILITY`)
   - Text: `Great news! {{1}} accepted your intro request for {{2}}. Connect directly on WhatsApp: {{3}}`
3. **`kin_followup`** (Category: `UTILITY`, Quick-Replies: `Yes`, `No`, `Need more`)
   - Text: `Hi {{1}}, did you connect with someone for your {{2}} requirement?`
4. **`kin_new_candidate`** (Category: `UTILITY`)
   - Text: `A new matching candidate just joined KIN for your requirement {{1}}: {{2}} ({{3}}% fit). View details in chat.`
5. **`kin_otp`** (Category: `AUTHENTICATION`, Button: Copy Code)
   - Text: `{{1}} is your KIN verification code. For your security, do not share this code with anyone.`

---

## 5. Local Testing & Verification CLI Tools

1. **Run the Comprehensive Test Suite** (19/19 tests):
   ```bash
   cd frontend && npx tsx ../scripts/wa-run-tests.ts
   ```
2. **Simulate Inbound Voice Note Webhook**:
   ```bash
   npx tsx scripts/wa-simulate-voice.ts 3000
   ```
3. **Simulate Inbound Text Webhook**:
   ```bash
   npx tsx scripts/wa-simulate-webhook.ts 3000
   ```
4. **Direct CLI Test Send**:
   ```bash
   npx tsx scripts/wa-test-send.ts +919811022678
   ```

---

## 6. Going Live

1. **Real WhatsApp Business Number**: In Meta Business Manager, register your 10-digit phone number and verify via SMS or Voice call.
2. **Business Verification**: Submit business registration documents to lift tier limits (from 250 conversations/day to Tier 1: 1,000/day).
3. **Production Database**: Change `provider = "postgresql"` in `prisma/schema.prisma` and point `DATABASE_URL` to Supabase, Neon, or RDS.

---

## 7. Troubleshooting Table

| Error Code | Reason | Resolution |
| :--- | :--- | :--- |
| **`131047`** | Re-engagement message outside 24h window | KIN automatically falls back to approved utility templates (`kin_intro_request`, `kin_followup`). Free-form messages are allowed only within 24 hours of user's last inbound message. |
| **`131026`** | Recipient cannot receive WhatsApp | Verify phone number is formatted to E.164 (`normalizePhone`) and registered on WhatsApp. |
| **`130429`** | Meta Rate Limit Exceeded | KIN client automatically retries with exponential backoff up to 3 times. |
| **`132000`** | Template parameter mismatch | Ensure template variables match the exact parameter schema defined in `templates.ts`. |
| **`190`** | Access Token Expired | Replace `WA_ACCESS_TOKEN` with a permanent System User token generated in Meta Business Manager. |
| **`401`** | Invalid Webhook Signature | Check `WA_APP_SECRET`. Meta signs the raw byte payload using HMAC-SHA256. |
