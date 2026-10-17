# Meta WhatsApp Cloud API — Template Registry & Setup Guide

This guide contains the exact template specifications for the **CONDUIT** WhatsApp integration. Use these configurations when creating and submitting message templates in your **Meta WhatsApp Business Manager** (`business.facebook.com` → WhatsApp Manager → Account Tools → Message Templates).

---

## 1. `conduit_otp` (Authentication Template)

- **Category**: `AUTHENTICATION`
- **Language**: `en` (or `en_US`)
- **Code Expiration**: 10 minutes
- **Zero-Tap / One-Tap Buttons**: Supported

### Template Body
```text
{{1}} is your CONDUIT verification code. For your security, do not share this code with anyone.
```

### Buttons
- **Type**: `OTP` (Copy Code)
- **Button Text**: `Copy Code`

### Sample Values
- `{{1}}`: `482910`

---

## 2. `conduit_new_match` (Match Notification)

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
A new match for your intent {{1}}: {{2}} ({{3}}% fit). Verified on the CONDUIT proof graph.
```

### Buttons
1. **Quick Reply**: `View Match`
2. **Dynamic URL**: `Open in App` → `https://conduit.network/network?intent={{1}}`

### Sample Values
- `{{1}}`: `Rust Distributed Systems Mentorship`
- `{{2}}`: `Elena Rostova (Principal Systems Engineer @ NexaML)`
- `{{3}}`: `94`

---

## 3. `conduit_trust_request` (Trust Edge Request)

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
{{1}} requested a trust edge with you on CONDUIT. Verified academic/professional credentials attached.
```

### Buttons
1. **Quick Reply**: `Accept` (Payload: `TRUST_ACCEPT_{{2}}`)
2. **Quick Reply**: `Decline` (Payload: `TRUST_DECLINE_{{2}}`)

### Sample Values
- `{{1}}`: `Dr. Aarav Sharma`
- `{{2}}`: `req_892147`

---

## 4. `conduit_node_verified` (Verification Notification)

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
Your node was verified on the CONDUIT Proof Network: {{1}}. Your reputation score has increased.
```

### Buttons
- **Static URL**: `View Profile` → `https://conduit.network/dashboard`

### Sample Values
- `{{1}}`: `Autonomous High-Frequency Trading Engine (GitHub #104)`

---

## 5. `conduit_intent_update` (Intent Status Update)

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
Status changed for your active intent '{{1}}': {{2}}.
```

### Buttons
- **Static URL**: `Check Intent` → `https://conduit.network/dashboard`

### Sample Values
- `{{1}}`: `Fast Matrix Multiplication CUDA Kernel`
- `{{2}}`: `2 New Candidates Connected`

---

## 6. `conduit_weekly_digest` (Weekly Digest)

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
Your CONDUIT weekly digest: {{1}} active nodes in your orbit, {{2}} new verified trust edges, and {{3}} high-conviction intent matches.
```

### Buttons
- **Static URL**: `Open Digest` → `https://conduit.network/dashboard`

### Sample Values
- `{{1}}`: `154`
- `{{2}}`: `12`
- `{{3}}`: `7`

---

## How to Submit Templates in Meta WhatsApp Manager

1. Open **Meta Business Suite** → **WhatsApp Manager**.
2. Select your WhatsApp Account → click **Account Tools** in the left navigation → **Message Templates**.
3. Click **Create Template**.
4. Choose the category (`AUTHENTICATION` for OTP, `UTILITY` for transactional notifications).
5. Name the template exactly as listed above (e.g. `conduit_otp`, `conduit_new_match`).
6. Paste the body and add the respective sample values in the Meta preview panel.
7. Click **Submit for Review** (utility & authentication templates are usually approved within minutes).
