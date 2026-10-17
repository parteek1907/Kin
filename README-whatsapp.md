# CONDUIT — WhatsApp Cloud API Production Integration Guide

This document covers everything required to configure, test, deploy, and scale the Meta WhatsApp Cloud API (Graph API) integration for the **CONDUIT** Campus Proof & Intent Network.

---

## 1. Architecture Overview

- **Webhook Handler**: `POST /api/whatsapp/webhook` verifies the raw body with `X-Hub-Signature-256` (HMAC-SHA256, timing-safe compare) and responds `200 OK` within 2 seconds. Inbound messages and delivery status callbacks are dispatched asynchronously to an audit table (`webhook_events`).
- **Send Service**: `frontend/src/lib/whatsapp/client.ts` supports typed text, templates, interactive buttons (max 3), interactive lists, typing indicators, read receipts, and automated exponential backoff on `429` & `5xx` errors.
- **24-Hour Support Window**: Free-form messages are permitted only within 24 hours of the user's latest inbound message (`last_inbound_at`). Outside this window, only Meta-approved templates are allowed.
- **Data Model**: Postgres-compatible SQLite database managed with **Prisma ORM** (`whatsapp_contacts`, `whatsapp_messages`, `whatsapp_otps`, `whatsapp_conversation_state`, `webhook_events`).
- **Bot State Machine**: Extensible flow registry (`frontend/src/lib/whatsapp/flows/`) with interactive menus, multi-step intent publishing (`POST INTENT`), trust edge verification, and strict `STOP` / `START` compliance.
- **Security & Privacy**: E.164 phone normalization, masked logging (`+91••••••2678`), rate-limiting, zero plaintext OTP storage (salted HMAC-SHA256), and user-triggered data deletion.

---

## 2. Meta Dashboard Setup Steps

### Step 1: Create a Meta Developer App
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Click **My Apps** → **Create App**.
3. Select **Other** as the use case → Next.
4. Select **Business** as the app type → Next.
5. Provide an App Name (e.g. `CONDUIT Gateway`) and select your Meta Business Account.

### Step 2: Add WhatsApp Product
1. Under **Add products to your app**, locate **WhatsApp** and click **Set up**.
2. Select or create your Meta Business Account.
3. In the left sidebar under **WhatsApp**, click **API Setup**:
   - Note down the **Phone number ID** (`WA_PHONE_NUMBER_ID`).
   - Note down the **WhatsApp Business Account ID** (`WA_BUSINESS_ACCOUNT_ID`).
   - For temporary testing, Meta generates a 24-hour test token.

### Step 3: Generate a Permanent System User Access Token
> ⚠️ **Important:** Do not use the temporary 24-hour token in production.
1. Go to **Meta Business Suite** → **Business Settings** (`business.facebook.com/settings`).
2. Navigate to **Users** → **System Users**.
3. Click **Add** → create an Admin System User (e.g., `conduit-whatsapp-bot`).
4. Click **Add Assets** → Assign your App (`CONDUIT Gateway`) with full control.
5. Click **Generate New Token**:
   - Select your App.
   - Token Expiration: **Never**.
   - Permissions: check `whatsapp_business_messaging` and `whatsapp_business_management`.
6. Save this token as `WA_ACCESS_TOKEN`.

### Step 4: Obtain App Secret & Verify Token
1. In your Meta Developer App, go to **App Settings** → **Basic**.
2. Click **Show** next to **App Secret** → copy as `WA_APP_SECRET`.
3. Choose a secure secret string for your webhook verification (e.g. `conduit_campus_trust_verify_token_2026`) and set as `WA_VERIFY_TOKEN`.

---

## 3. Environment Configuration

Copy the sample environment variables:
```bash
cp .env.example .env
```

Populate the variables:
```dotenv
# Meta WhatsApp Cloud API (Graph API)
WA_ACCESS_TOKEN="EAAxxxx..."           # Permanent System User token
WA_PHONE_NUMBER_ID="109876543210987"
WA_BUSINESS_ACCOUNT_ID="987654321098765"
WA_APP_SECRET="a1b2c3d4e5f6..."        # Found in App Settings -> Basic
WA_VERIFY_TOKEN="conduit_secret_token" # Custom token you enter in Meta webhook config
WA_GRAPH_VERSION="v21.0"               # Target Graph API version

# Public Business Phone (Digits only for wa.me links, e.g. 919811022678)
NEXT_PUBLIC_WA_BUSINESS_NUMBER="919811022678"

# Prisma Database (Postgres-compatible SQLite for dev)
DATABASE_URL="file:./dev.db"
```

---

## 4. Local Webhook Testing with Ngrok

Meta requires a publicly accessible HTTPS endpoint to deliver webhooks.

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```
2. In a separate terminal, expose port 3000:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS forwarding URL (e.g., `https://abc-123.ngrok-free.app`).
4. Go to **Meta Developer Portal** → **WhatsApp** → **Configuration** → **Webhook**:
   - **Callback URL**: `https://abc-123.ngrok-free.app/api/whatsapp/webhook`
   - **Verify token**: Value of your `WA_VERIFY_TOKEN`
   - Click **Verify and save**.
5. Under **Webhook fields**, click **Manage** and subscribe to:
   - `messages` (inbound user texts, buttons, media)
   - `message_template_status_update` (template approvals)

---

## 5. Adding Message Templates in WhatsApp Manager

Go to **WhatsApp Manager** (`business.facebook.com` → WhatsApp Manager → Account Tools → Message Templates). For complete template copy, buttons, and parameters, consult:
📄 **[`docs/whatsapp-templates.md`](file:///home/parteek1907/Projects/IIITD/docs/whatsapp-templates.md)**

Summary of templates used by CONDUIT:
1. `conduit_otp`: `AUTHENTICATION` template with a Copy Code button.
2. `conduit_new_match`: `UTILITY` template alerting users to high-fit intent matches with a View button.
3. `conduit_trust_request`: `UTILITY` template with interactive **Accept** and **Decline** buttons.
4. `conduit_node_verified`: `UTILITY` template confirming proof graph node verification.
5. `conduit_intent_update`: `UTILITY` template broadcasting status changes.
6. `conduit_weekly_digest`: `UTILITY` template with weekly network activity summary.

---

## 6. Going Live (Production Readiness)

1. **Meta Business Verification**:
   - Go to **Business Settings** → **Security Center** → **Start Verification**.
   - Upload official company/university registration and phone bill documents.
2. **Add a Dedicated Phone Number**:
   - In WhatsApp Manager, go to **Phone Numbers** → **Add Phone Number**.
   - You must be able to receive an SMS or voice call on this number to verify ownership.
   - Note: The number cannot be currently registered on the consumer WhatsApp app or WhatsApp Business mobile app without first deleting that account.
3. **Configure Payment Method**:
   - Add a credit card or line of credit in Meta Business Settings for utility & marketing conversations exceeding Meta's free monthly tier.
4. **Vercel Deployment**:
   - Add the WhatsApp environment variables in your Vercel Project Settings.
   - Update your Meta Webhook callback URL to your production domain: `https://your-domain.com/api/whatsapp/webhook`.

---

## 7. Troubleshooting Table

| Error Code | Meaning | Cause | Resolution |
| :--- | :--- | :--- | :--- |
| **`131047`** | Re-engagement message blocked | Attempted to send a free-form message outside the 24-hour window since user's last inbound message | Send an approved template message (`sendTemplate`) instead. Once the user replies, the 24h window reopens. |
| **`131026`** | Message undeliverable | The recipient phone number is not registered on WhatsApp or is temporarily restricted | Verify phone number formatting with `normalizePhone` (E.164 digits only). Check if number exists on WhatsApp. |
| **`130429`** | Cloud API Rate limit hit | Too many messages sent in a short window or account messaging tier limit reached | The client automatically retries with exponential backoff. Increase Meta messaging tier by maintaining high quality rating. |
| **`132000`** | Template mismatch | Parameter count or button schema does not match approved template in Meta Manager | Verify payload using Zod schemas in `frontend/src/lib/whatsapp/templates.ts`. Ensure template name and language match exactly. |
| **`190`** | Access Token expired | Temporary developer token was used or System User permissions were revoked | Generate a permanent System User token with `whatsapp_business_messaging` permissions in Business Settings. |
| **`401 Unauthorized`** | Signature Mismatch | `X-Hub-Signature-256` HMAC does not match `WA_APP_SECRET` | Verify `WA_APP_SECRET` in `.env` matches App Secret in Meta Basic Settings. Ensure raw body string is used for verification. |
| **`403 Forbidden`** | Webhook Verification Failed | `hub.verify_token` did not match `WA_VERIFY_TOKEN` | Confirm `WA_VERIFY_TOKEN` in `.env` exactly matches the verify token entered in the Meta developer portal. |

---

## 8. CLI & Testing Tools

### 1. Run Complete Test Suite (22 Unit & Integration Tests)
```bash
cd frontend && npx tsx ../scripts/wa-run-tests.ts
```

### 2. Send Test Template Message
```bash
cd frontend && npx tsx ../scripts/wa-test-send.ts +919811022678 hello_world
```

### 3. Simulate Signed Inbound Webhook
```bash
cd frontend && npx tsx ../scripts/wa-simulate-webhook.ts "MENU" "919811022678"
```

### 4. Admin Observability Dashboard
Navigate to `http://localhost:3000/admin/whatsapp` to view live message audit logs, delivery status transitions, template counts, and resend failed dispatches.
