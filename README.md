# PrimeCare — Healthcare Appointment & Follow-up Manager

PrimeCare is a full-stack, role-based healthcare appointment, AI symptom triage, and follow-up management platform built with Next.js (App Router, Tailwind CSS, TypeScript) and PostgreSQL (Neon Serverless). The platform features automated AI symptom triage, post-visit clinical summaries with medication schedules, double-booking prevention with database constraints, doctor leave auto-rescheduling, multi-channel email notifications (Gmail SMTP TLS 587 & Resend fallback), and Google Calendar synchronization.

---

## 🔑 Quick Login Credentials for Testing

| Portal Role | Email Address | Password | Account ID / Profile Name | Access Permissions |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Hospital Super Admin** | `admin@primecare.in` | `admin12345` | System Administrator | Master Admin, doctor approval/rejection, roster purge, duty leave conflict management |
| 🩺 **Senior Cardiologist** | `ritikakushwaha62@gmail.com` | `doctor@123` | doc-cardio-01 (Dr. Ritika Kushwaha) | Live patient queue, AI pre-visit urgency assessment, prescriptions & consultation notes |
| 👤 **Default Patient** | `patient@primecare.in` | `patient@123` | PT-1042 (Ritika Kushwaha) | Specialist search, real-time booking, AI symptom triage, `.ics` & calendar sync, instant email reminders |

---

## 📋 Table of Contents

- [🌟 Key Features](#-key-features)
- [🔑 Default Login Credentials](#-quick-login-credentials-for-testing)
- [🚀 Setup & Installation Guide](#-setup--installation-guide)
- [⚙️ Environment Variables (.env.example)](#️-environment-variables-envexample)
- [🔌 API Documentation](#-api-documentation)
- [🗄️ Database Schema & Concurrency Locks](#️-database-schema--concurrency-locks)
- [🤖 LLM Prompts & Engineering](#-llm-prompts--engineering)
- [📅 Google Calendar Integration Setup](#-google-calendar-integration-setup)
- [📄 System Design & Reliability Write-Up](#-system-design--reliability-write-up)

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)

* **Patient Portal**: Search doctors by clinical department, book real-time consultation slots, share advance symptoms for AI urgency triage, print consultation tokens, download `.ics` / sync to Google Calendar, and trigger on-demand email reminders.
* **Doctor Portal**: Manage active outpatient queue, review AI pre-visit clinical triage before visits, generate digital prescriptions, record clinical diagnoses, and log duty leaves.
* **Hospital Administrator Portal**: Verify registered physician credentials (NMC / MCI documentation), approve/reject doctor applications with automated onboarding emails, manage doctor rosters with direct purge capabilities, log duty leaves, and oversee automated patient conflict resolution.

### 2. Double-Booking Prevention & Concurrency

* **Database Constraint**: Enforces a composite unique constraint `UNIQUE (doctor_id, date, time_slot)` across `pc_appointments` to prevent overlapping consultation bookings at the PostgreSQL layer.
* **State Revalidation**: Employs optimistic checks to revalidate slot availability immediately prior to database commit.

### 3. AI Clinical Summaries (LLM Integration)

* **Pre-Visit Symptom Triage**: Utilizes Google Gemini (`gemini-1.5-flash`) to analyze patient complaints, assigning an urgency score (**Low**, **Medium**, **High**, **Critical**), extracting the chief complaint, and generating 3 targeted clinical diagnostic questions for the doctor.
* **Post-Visit Patient Summary**: Translates medical notes into clear, patient-friendly guidance featuring structured medication schedules (Morning / Afternoon / Night) and red-flag warning signs.
* **Deterministic Rule Fallback**: Rule-based keyword matching keeps clinical workflows operational even during upstream LLM rate limits or network drops.

### 4. Doctor Leave Management & Patient Auto-Rescheduling

* When a physician's duty leave is logged, existing bookings for that date range transition to `LEAVE_CANCELLED`, slots are locked out on the patient desk, and affected patients receive reschedule notifications.

### 5. Multi-Channel Notification Engine

* Automated confirmation emails dispatched upon booking.
* On-demand and automated cron reminders (`/api/cron/reminders`) sent to patient inboxes.
* Real-time SMTP diagnostic suite (`/api/notifications/test`) for verifying mail server health.

---

## 🚀 Setup & Installation Guide

### Prerequisites

* **Node.js**: `v18.18.0` or higher
* **npm**: `v9.0.0` or higher
* **PostgreSQL Database**: Local PostgreSQL or serverless Neon DB instance

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Ritika-kushwaha/PrimeCare.git
cd PrimeCare/client

# Install frontend & backend dependencies
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` inside the client directory:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## ⚙️ Environment Variables (.env.example)

```env
# =================================================================
# PrimeCare Environment Variables (.env.example)
# =================================================================

# --- Application Configuration ---
NEXT_PUBLIC_APP_NAME="PrimeCare Medical Center"
NEXT_PUBLIC_API_BASE_URL="https://primecare-app-jet.vercel.app"

# --- Database Configuration (PostgreSQL / Neon) ---
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"

# --- Google Gemini / LLM Integration ---
GEMINI_API_KEY="your_google_gemini_api_key_here"
LLM_MODEL="gemini-1.5-flash"

# --- Email Notifications (Nodemailer SMTP & Resend Fallback) ---
EMAIL_USER="your-hospital-email@gmail.com"
EMAIL_PASS="your_16_digit_google_app_password"
ADMIN_EMAIL="admin@primecare.in"
RESEND_API_KEY="re_sample_key_here"

# --- Google Calendar Integration (OAuth 2.0) ---
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="https://primecare-app-jet.vercel.app/api/calendar/callback"
```

---

## 🔌 API Documentation

### 1. Doctor Directory & Management (`/api/sync/doctors`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/sync/doctors` | Fetch all approved doctors across departments | Public / Patient |
| POST | `/api/sync/doctors` | Upsert doctor profile or execute permanent delete (action: 'DELETE') | Admin |

### 2. Doctor Applications & Verification (`/api/sync/applications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/sync/applications` | Query pending doctor registration submissions | Admin |
| POST | `/api/sync/applications` | Approve or reject credentials and trigger onboarding email | Admin |

### 3. Appointments & Outpatient Queue (`/api/sync/appointments`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/sync/appointments` | Fetch active outpatient queue and consultation records | Authenticated |
| POST | `/api/sync/appointments` | Commit new appointment bookings and slot state updates | Authenticated |

### 4. Doctor Duty Leaves (`/api/sync/leaves`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/sync/leaves` | List active doctor duty leave schedules | Authenticated |
| POST | `/api/sync/leaves` | Authorize doctor leave and trigger patient conflict updates | Admin / Doctor |

### 5. AI Clinical Engine (`/api/ai/*`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/ai/pre-summary` | Generate pre-visit symptom analysis and urgency score | Authenticated |
| POST | `/api/ai/post-summary` | Convert clinical notes into a patient medication guide | Doctor |

### 6. Notifications & Cron (`/api/notifications/*`, `/api/cron/*`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/notifications/email` | Dispatch booking confirmations, reminders, and notices | Public / System |
| GET | `/api/notifications/test` | Live SMTP diagnostic verification endpoint | Public / Admin |
| GET | `/api/cron/reminders` | Automated cron endpoint dispatching appointment reminders | System / Cron |

---

## 🗄️ Database Schema & Concurrency Locks

```
┌─────────────────┐       ┌─────────────────┐       ┌───────────────────────────┐
│     pc_users    │       │   pc_doctors    │       │   pc_doctor_applications  │
├─────────────────┤       ├─────────────────┤       ├───────────────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)                   │
│ email (UNIQUE)  │◄─────┐│ email (UNIQUE)  │       │ email                     │
│ password_hash   │      └│ name            │       │ name                      │
│ role (enum)     │       │ specialisation  │       │ reg_number                │
│ is_approved     │       │ qualification   │       │ status (PENDING/APPROVED) │
└─────────────────┘       │ fee             │       └───────────────────────────┘
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌───────────────────────────────────────────┐
                          │              pc_appointments              │
                          ├───────────────────────────────────────────┤
                          │ id (PK)                                   │
                          │ token_number                              │
                          │ doctor_id & doctor_email                  │
                          │ patient_name & patient_email              │
                          │ department                                │
                          │ date & time_slot                          │
                          │ symptoms                                  │
                          │ ai_pre_summary (JSONB)                    │
                          │ doctor_notes & prescription               │
                          │ ai_post_summary (JSONB)                   │
                          │ status (CONFIRMED/CANCELLED/LEAVE_CANCEL) │
                          │ CONSTRAINT: UNIQUE(doctor_id, date, slot) │
                          └───────────────────────────────────────────┘
```

### Concurrency Lock Implementation

```sql
-- Compound constraint prevents duplicate simultaneous bookings at the database tier
ALTER TABLE pc_appointments ADD CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, date, time_slot);
```

---

## 🤖 LLM Prompts & Engineering

The platform integrates Google Gemini (`gemini-1.5-flash`) for clinical triage and post-consultation summaries:

### 1. Pre-Visit Clinical Symptom Triage Prompt

```text
System: You are an AI Clinical Triage Assistant. Analyze the provided patient symptoms and return a structured JSON response.

Input:
Patient: {{patientName}}
Symptoms: {{symptoms}}
Department: {{department}}

Required JSON Output Schema:
{
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "chiefComplaint": "Concise summary statement",
  "suggestedQuestions": [
    "Clinical question 1 for physician",
    "Clinical question 2 for physician",
    "Clinical question 3 for physician"
  ],
  "preliminaryAssessment": "Clinical rationale"
}
```

### 2. Post-Visit Patient Summary Prompt

```text
System: You are a compassionate medical communicator. Convert the doctor's clinical notes and prescription into a patient-friendly summary with structured medication schedules.

Input:
Doctor Notes: {{doctorNotes}}
Prescription: {{prescription}}

Required Output Format:
- Summary of Visit: Clear explanation in non-technical terms
- Medication Schedule: Timetable (Morning / Afternoon / Night) with food instructions
- Red-Flag Symptoms: Specific warning signs requiring emergency medical attention
- Follow-up Plan: Next visit timeline and lifestyle instructions
```

### 3. Rule-Based Fallback Engine

If the Gemini API encounters rate limits or network issues, deterministic keyword analysis activates automatically:
* `"chest pain"`, `"shortness of breath"`, `"unconscious"` → **Critical** / **High**
* `"fever"`, `"cough"`, `"vomiting"` → **Medium**
* `"routine checkup"`, `"rash"`, `"mild ache"` → **Low**

---

## 📅 Google Calendar Integration Setup

PrimeCare supports 3 calendar synchronization workflows:

### Method 1: Direct Web Intent (Zero Setup Required)

Upon booking, PrimeCare constructs a standard Google Calendar template URL:

```typescript
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Medical Consultation - ' + doctorName)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('PrimeCare Hospital')}`;
```

### Method 2: RFC-5545 iCalendar (.ics) Download

Patients can click **Download .ics** to generate an industry-standard calendar event compatible with Apple Calendar, Microsoft Outlook, and Google Calendar.

### Method 3: Google Cloud OAuth 2.0 Setup (Server-Side Sync)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a project named **PrimeCare-Calendar**.
2. Navigate to **APIs & Services ➔ Library**, search for **Google Calendar API**, and click **Enable**.
3. Under **OAuth Consent Screen**, select **External** and add the scope: `https://www.googleapis.com/auth/calendar.events`.
4. Navigate to **Credentials ➔ Create Credentials ➔ OAuth Client ID**:
   * Application Type: **Web Application**
   * Authorized Redirect URIs:
     * `http://localhost:3000/api/calendar/callback`
     * `https://primecare-app-jet.vercel.app/api/calendar/callback`
5. Copy the Client ID and Client Secret into your `.env.local` / Vercel Environment Variables.

---

## 📄 System Design & Reliability Write-Up

### Double-Booking Prevention

Double-booking is prevented using a layered concurrency control strategy:

* **Database-Level Constraint**: The `pc_appointments` table enforces a composite constraint on `(doctor_id, date, time_slot)`. If two patients attempt to book the exact same slot concurrently, PostgreSQL rejects the second write with error code `23505` (unique violation), maintaining data integrity.
* **State Revalidation**: Prior to committing an appointment, the API confirms slot status. If a conflict occurs, the transaction aborts and prompts the user to select an alternate time.

### Doctor Leave Conflict Handling

When a physician is placed on duty leave by an administrator:

1. The absence is recorded in `pc_leaves`.
2. The system executes a bulk update on `pc_appointments` for matching doctor IDs and dates, setting statuses from `CONFIRMED` to `LEAVE_CANCELLED`.
3. Affected patients receive automated notification emails explaining the schedule change, complete with token preservation and direct rescheduling options.

### Notification Reliability & Graceful Degradation

* **Dual Transport**: Nodemailer runs over TLS Port 587 as the primary driver, with an automated fallback to the Resend API.
* **Isolated Failures**: External network calls (SMTP, LLM parsing, Google Calendar APIs) are isolated within dedicated try/catch boundaries so external timeouts never abort the primary booking process.
