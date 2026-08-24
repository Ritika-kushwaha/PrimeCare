# PrimeCare — Comprehensive System Design & Architectural Specification

> Full-Stack Healthcare Platform — Technical Design, System Architecture, Email Engine Specification, and Complete Codebase Changes Audit.

---

## 📋 Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Detailed Codebase Changes Audit (File-by-File)](#2-detailed-codebase-changes-audit-file-by-file)
3. [Email Notification Engine & SMTP Resiliency Design](#3-email-notification-engine--smtp-resiliency-design)
4. [Concurrency Control & Double-Booking Prevention](#4-concurrency-control--double-booking-prevention)
5. [Doctor Duty Leave Management & Patient Auto-Rescheduling](#5-doctor-duty-leave-management--patient-auto-rescheduling)
6. [Doctor Queue Isolation & Profile Protection (`isMyPatient`)](#6-doctor-queue-isolation--profile-protection-ismypatient)
7. [AI Clinical Engine & Deterministic Rule Fallbacks](#7-ai-clinical-engine--deterministic-rule-fallbacks)
8. [Build Verification & Deployment Safety](#8-build-verification--deployment-safety)

---

## 1. Architectural Overview

PrimeCare is structured around a decoupled dual-layer architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 14 FRONTEND (CLIENT)                       │
│  - App Router (/patient/book, /doctor/dashboard, /admin, /login)             │
│  - Tailwind CSS, Framer Motion, Lucide Icons, AuthContext                    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ REST API Fetch / JSON
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS SERVERLESS & EXPRESS API                     │
│  - /api/sync/* (doctors, appointments, leaves, ehr, applications)           │
│  - /api/notifications/* (email dispatches, SMTP test suite)                 │
│  - /api/admin/leave-reschedule (patient bulk reschedule dispatches)          │
│  - /api/ai/* (pre-visit triage & post-visit summary)                        │
└───────────────────────┬──────────────────────────────┬──────────────────────┘
                        │                              │
                        ▼                              ▼
┌───────────────────────────────┐            ┌────────────────────────────────┐
│   POSTGRESQL (NEON DB)        │            │   EXTERNAL SERVICES            │
│ - pc_users (Auth & Roles)     │            │ - Google Gemini 2.5 Flash API  │
│ - pc_doctors (Profiles)       │            │ - Nodemailer Gmail SMTP        │
│ - pc_appointments (Bookings)  │            │   (Port 465 SSL & 587 TLS)     │
│ - pc_leaves (Duty Leaves)     │            │ - Google Calendar Deep-Links   │
│ - pc_ehr (Medical History)    │            │   & .ics iCalendar Attachments │
└───────────────────────────────┘            └────────────────────────────────┘
```

---

## 2. Detailed Codebase Changes Audit (File-by-File)

The following is an exhaustive record of all changes, enhancements, and bug fixes implemented across the codebase:

### 📁 `client/src/app/patient/book/page.tsx`
* **ISO Date Normalization (`normalizeDate`)**: Replaced direct string equality (`l.leaveDate !== selectedDate`) with `normalizeDate()`, converting timestamps (`2026-08-24T00:00:00.000Z`) and localized strings (`24-08-2026`) into a clean `YYYY-MM-DD` format.
* **Duty Leave Visual Alerts**: Rendered a prominent warning banner when a physician is on leave and added an `On Leave (<date>)` badge to doctor roster cards.
* **Time Slot Locking & Disabling**: Updated time slot generation to render `ON LEAVE` and `BOOKED` badges, disabling user selection and blocking form submission.
* **Dual Email Dispatch**: Wired booking submission to trigger both HTML email notifications (`/api/notifications/email`) and calendar `.ics` email invites (`/api/appointments/book`).

### 📁 `client/src/app/doctor/dashboard/page.tsx`
* **Doctor Queue Isolation (`isMyPatient`)**: Replaced loose email filtering with strict multi-attribute matching (`isMyPatient`). If an appointment specifies a doctor name (`a.doctorName`) different from the logged-in physician (`docName`), it is immediately rejected, preventing cross-doctor patient leaks.
* **Profile Overwrite Fix (`loadData`)**: Removed the unconstrained email fallback (`find(d => d.email === doctorEmail)`), preventing the remote DB sync from overwriting a logged-in doctor's name or ID with another doctor sharing the email address.
* **Default Queue View**: Set default `filterMode` state to `'MY_PATIENTS'`.

### 📁 `client/src/app/admin/leaves/page.tsx` & `client/src/app/api/admin/leave-reschedule/route.ts`
* **Patient Leave-Reschedule Pipeline**: Integrated `/api/admin/leave-reschedule` into `handleAddLeave`. When an administrator logs a leave, all affected patients are queried, and personalized reschedule emails with `.ics` cancellation attachments are automatically dispatched.
* **Dual Transport Resiliency**: Added fallback handling for SMTP ports 465 (SSL) and 587 (TLS).

### 📁 `client/src/app/api/sync/doctors/route.ts`
* **Roster Preservations**: Removed `SELECT DISTINCT ON (LOWER(email))` from the PostgreSQL query, ensuring that every physician profile remains distinct by unique ID and name.

### 📁 `client/src/app/api/notifications/email/route.ts` & `client/src/app/api/auth/send-otp/route.ts`
* **SMTP Transport Upgrade**: Standardized `sendMailHelper` across all mail API endpoints using dual-port connection handling (465 SSL primary, 587 TLS fallback).
* **BOM Byte Stripping**: Added `.replace(/\s+/g, '')` and `.trim()` on environment variables to clean hidden UTF-8 BOM bytes.

### 📁 `client/src/app/api/ai/pre-visit/route.ts` & `client/src/app/api/ai/post-visit/route.ts`
* **Google Gemini 2.5 Flash Integration**: Wired `@google/genai` with clinical prompts returning structured JSON for symptom urgency and post-visit care plans, complete with rule-based fallback handlers.

---

## 3. Email Notification Engine & SMTP Resiliency Design

The notification subsystem is engineered to guarantee mail delivery even during network congestion, provider rate limits, or port blocks:

```
                          ┌───────────────────────────┐
                          │   Outbound Mail Trigger   │
                          │   (Booking, Leave, OTP)   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │ Credential & Envelope     │
                          │ Sanitization (.trim())    │
                          └─────────────┬─────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ Primary Connection:         │
                         │ Gmail SMTP Port 465 (SSL)   │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                   Success?                            No (Timeout/Block)
                         │                             │
               ┌─────────┴─────────┐         ┌─────────┴─────────┐
               │ Return HTTP 200   │         │ Fallback Attempt: │
               │ Email Sent        │         │ Gmail SMTP 587    │
               └───────────────────┘         └─────────┬─────────┘
                                                       │
                                             ┌─────────┴─────────┐
                                             │ Return HTTP 200   │
                                             │ Email Sent        │
                                             └───────────────────┘
```

### Supported Email Types & Payloads:

1. **`APPOINTMENT_CONFIRMATION`**: HTML booking receipt featuring Queue Token #, physician details, consultation fee, and calendar deep-links.
2. **`APPOINTMENT_REMINDER`**: Automated reminder sent 24 hours prior to visit.
3. **`LEAVE_APPROVED`**: Direct notification email sent to physician confirming duty leave approval.
4. **`PATIENT_RESCHEDULE_NOTICE`**: Automated message sent to affected patients when a doctor takes leave, complete with an attached `.ics` cancellation calendar object.
5. **`PASSWORD_RESET_OTP`**: 6-digit verification code sent for password reset.

---

## 4. Concurrency Control & Double-Booking Prevention

PrimeCare prevents double-booking through a multi-tier concurrency control architecture:

1. **PostgreSQL Database Constraint**:
   ```sql
   ALTER TABLE pc_appointments 
   ADD CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, date, time_slot);
   ```
   If simultaneous requests attempt to commit the exact same consultation slot, PostgreSQL rejects the second write with error code `23505` (unique violation).

2. **State Revalidation**:
   Before writing a booking, `/patient/book` inspects active DB records for matching date and time slot entries.

---

## 5. Doctor Duty Leave Management & Patient Auto-Rescheduling

When an Administrator logs a duty leave:

1. A record is inserted into `pc_leaves`.
2. A bulk SQL update sets matching appointment statuses to `LEAVE_CANCELLED`:
   ```sql
   UPDATE pc_appointments 
   SET status = 'LEAVE_CANCELLED', leave_reason = $1 
   WHERE (doctor_id = $2 OR LOWER(doctor_name) LIKE $3)
     AND date = $4
     AND status NOT IN ('COMPLETED', 'CANCELLED');
   ```
3. `/api/admin/leave-reschedule` triggers personalized reschedule emails to all affected patients.

---

## 6. Doctor Queue Isolation & Profile Protection (`isMyPatient`)

To prevent cross-doctor patient leaks when multiple test profiles share an email address:

```typescript
const isMyPatient = useCallback((a: AppointmentItem) => {
  if (!a) return false;
  const cleanMyName = cleanDoctorName(docName);
  const cleanAptDocName = cleanDoctorName(a.doctorName);
  const cleanMyId = (docId || user?.id || '').toLowerCase().trim();
  const cleanAptDocId = (a.doctorId || '').toLowerCase().trim();

  // 1. Strict Doctor ID match if both IDs exist
  if (cleanAptDocId && cleanMyId) {
    if (cleanAptDocId === cleanMyId) return true;
    return false;
  }

  // 2. Strict Doctor Name match if appointment names a doctor
  if (cleanAptDocName && cleanMyName) {
    const nameMatch = cleanAptDocName.includes(cleanMyName) || cleanMyName.includes(cleanAptDocName);
    if (!nameMatch) return false; // Explicitly belongs to another physician!
    return true;
  }

  // 3. Fallback email match ONLY if appointment has NO doctor name and NO doctor ID
  if (!cleanAptDocName && !cleanAptDocId && doctorEmail) {
    const cleanMyEmail = doctorEmail.toLowerCase().trim();
    const cleanAptDocEmail = (a.doctorEmail || '').toLowerCase().trim();
    if (cleanAptDocEmail && cleanMyEmail && cleanAptDocEmail === cleanMyEmail) {
      return true;
    }
  }

  return false;
}, [docName, docId, doctorEmail, user]);
```

---

## 7. AI Clinical Engine & Deterministic Rule Fallbacks

### Pre-Visit Symptom Analysis (`/api/ai/pre-visit`)
* **Model**: Google Gemini 2.5 Flash (`@google/genai`)
* **Output**: JSON containing `urgency` (`LOW`, `MEDIUM`, `HIGH`), `chiefComplaint`, and 3 diagnostic questions.
* **Deterministic Fallback**: Evaluates symptoms against medical keywords (*chest pain*, *breathlessness* $\rightarrow$ `HIGH`).

### Post-Visit Care Summary (`/api/ai/post-visit`)
* Converts clinical notes and prescriptions into plain-language patient summaries and medication timetables.

---

## 8. Build Verification & Deployment Safety

All changes undergo continuous static type analysis and production compilation verification:

```powershell
# 1. Static Type Checking
npx tsc --noEmit
# Result: Exit Code 0 (0 errors)

# 2. Production Build Verification
npm run build
# Result: Exit Code 0 (Clean Next.js App Build)
```
