# KIN WhatsApp Cloud API — Template Registry & Setup Guide

This guide contains the exact template specifications for the **KIN** WhatsApp integration. Use these configurations when creating and submitting message templates in your **Meta WhatsApp Business Manager** (`business.facebook.com` → WhatsApp Manager → Account Tools → Message Templates).

All templates are strictly **UTILITY** or **AUTHENTICATION** categories (no marketing).

---

## 1. `kin_intro_request` (Double Opt-In Intro Request)

Sent to the candidate when an alumnus requests an introduction.

- **Category**: `UTILITY`
- **Language**: `en` (or `en_US`)

### Template Body
```text
{{1}} from {{2}} is looking for {{3}}. Interested in connecting?
```

### Buttons
1. **Quick Reply**: `Yes` (Payload: `INTRO_YES`)
2. **Quick Reply**: `Not now` (Payload: `INTRO_NO`)

### Sample Values
- `{{1}}`: `Rahul Verma`
- `{{2}}`: `IIIT Delhi (2020 Batch)`
- `{{3}}`: `a React & Node.js intern for a high-growth fintech startup`

---

## 2. `kin_intro_accepted` (Intro Confirmation & Contact Share)

Sent to both parties when the candidate accepts the connection request.

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
Great news! {{1}} accepted your intro request for {{2}}. Connect directly on WhatsApp: {{3}}
```

### Sample Values
- `{{1}}`: `Aditi Sharma`
- `{{2}}`: `React Frontend Developer`
- `{{3}}`: `https://wa.me/919876543210`

---

## 3. `kin_followup` (3-Day Alumni Lifecycle Follow-Up)

Sent 3 days after candidates are delivered to check connection status, even outside the 24h window.

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
Hi {{1}}, did you connect with someone for your {{2}} requirement?
```

### Buttons
1. **Quick Reply**: `Yes` (Payload: `FOLLOWUP_YES`)
2. **Quick Reply**: `No` (Payload: `FOLLOWUP_NO`)
3. **Quick Reply**: `Need more` (Payload: `FOLLOWUP_MORE`)

### Sample Values
- `{{1}}`: `Arjun`
- `{{2}}`: `Founding Full-Stack Engineer`

---

## 4. `kin_new_candidate` (New Match Alert)

Sent when a new candidate joins or updates their profile and scores above the match threshold (max 1/day).

- **Category**: `UTILITY`
- **Language**: `en`

### Template Body
```text
A new matching candidate just joined KIN for your requirement {{1}}: {{2}} ({{3}}% fit). View details in chat.
```

### Sample Values
- `{{1}}`: `GenAI Research Intern`
- `{{2}}`: `Priya Patel — M.Tech AI @ IIITD (PyTorch, LLMs, RAG)`
- `{{3}}`: `96`

---

## 5. `kin_otp` (Security & Data Deletion Authentication)

Sent when an alumnus or candidate requests phone verification or self-service data deletion.

- **Category**: `AUTHENTICATION`
- **Language**: `en`
- **Code Expiration**: 10 minutes

### Template Body
```text
{{1}} is your KIN verification code. For your security, do not share this code with anyone.
```

### Buttons
- **Type**: `OTP` (Copy Code)
- **Button Text**: `Copy Code`

### Sample Values
- `{{1}}`: `592814`
