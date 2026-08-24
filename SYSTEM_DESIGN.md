# PrimeCare System Design Write-Up

> Healthcare Appointment & Follow-up Manager — Architecture & Design Decisions

---

## 1. Concurrency Control & Double-Booking Prevention

Simultaneous booking attempts for the same physician slot introduce race condition risks in any multi-user outpatient system. PrimeCare enforces safety through a **two-tier prevention architecture**.

**Database-Level Unique Compound Constraint**: At the PostgreSQL storage tier, a `UNIQUE(doctorId, appointmentDate, timeSlot, status)` constraint is enforced for all active records. Any race condition that reaches the persistence engine fails deterministically with a `P2002` unique violation, preventing phantom inserts.

**Atomic Transactions with Serializable Isolation**: When a patient initiates a booking, the entire operation executes within a `prisma.$transaction()` block. The system first reads current slot occupancy and then writes the appointment record atomically — eliminating the read-before-write gap exploited by concurrent requests. If two users attempt the same slot simultaneously, the second transaction receives a constraint violation and is returned a clear conflict error.

**Redis Slot Hold Mechanism**: Before confirming, a temporary `HELD` lock is placed in Redis for 5–10 minutes using `SET lockKey patientId EX 300 NX`. This prevents the case where a patient is mid-booking (entering symptoms) while another claims the slot. The `NX` flag (set only if key does not exist) makes the hold acquisition itself atomic. If the patient abandons checkout, the TTL automatically releases the slot.

---

## 2. Doctor Leave Conflict Handling

When an Administrator marks a physician on leave for a specific date, the system must atomically cancel all affected bookings and notify patients without leaving the database in a partial state.

**Atomic Leave + Cancellation Transaction**: The entire operation is wrapped in a single Prisma transaction:
1. A `DoctorLeave` record is written for `(doctorId, leaveDate)`.
2. All `CONFIRMED` appointments for that `(doctorId, leaveDate)` are immediately queried.
3. Their status is bulk-updated to `CANCELLED_BY_DOCTOR_LEAVE` in the same commit.
4. `NotificationLog` entries are created for each affected patient — all within the same atomic boundary.

If any step fails, the entire transaction rolls back, ensuring no appointment is cancelled without its notification log entry, and no leave is recorded without cancelling the bookings.

**Automated Patient Notification**: For each cancelled appointment, the background notification worker dispatches a personalized email containing the original time slot, leave reason, and a direct reschedule link. The doctor's leave management page also supports revoking leaves, which restores slot availability instantly.

---

## 3. Slot Hold & Expiration Mechanism

To support multi-step symptom intake (where a patient selects a slot, then fills out a symptom form before confirming), PrimeCare uses a Redis-backed distributed hold system.

**Hold Initiation**: When a patient selects a slot, `SlotService.holdSlot()` executes `SET lock:slot:{doctorId}:{timestamp} {patientId} EX 300 NX`. This atomically reserves the slot for the initiating patient for 5 minutes.

**Visibility to Other Patients**: The `getDoctorSlots()` function checks Redis for each generated slot. If a lock exists, the slot is returned with `status: "HELD"` and `isAvailable: false`, preventing other patients from selecting it.

**Automatic Expiry**: Redis TTL handles expiry natively — no cleanup cron is needed. If the patient abandons booking, the key expires and the slot returns to available on the next availability query.

**Renewal**: If the same patient re-queries the hold (e.g., page refresh), the system detects `currentHolder === patientId` and returns `expiresAt` without consuming a new lock — preventing double-holds.

---

## 4. LLM Integration & Graceful Failure Handling

PrimeCare integrates Google Gemini 2.5 Flash at two clinical pipeline stages, with full resilience against AI service failures.

**Pre-Visit Symptom Triaging**: Patient-reported symptoms are sent to Gemini with a structured JSON prompt requesting: urgency level (`LOW`, `MEDIUM`, `HIGH`), a clinical chief complaint statement, and three diagnostic questions for the doctor. The output is stored on the `Appointment` record and displayed to the doctor before the consultation begins.

**Post-Visit Clinical Summarization**: Doctor clinical notes and prescription details are sent to Gemini for conversion into a plain-language patient care plan — including diagnosis explanation, medication schedule, and follow-up steps. The output is emailed to the patient immediately.

**Resilience Pattern**: Both LLM calls are wrapped in `try/catch`. On any failure (network timeout, rate limit, invalid JSON response, missing API key), the system falls back to: rule-based urgency classification for pre-visit, and a template-based care plan for post-visit. The API routes always return HTTP 200 with a `source: "fallback"` field — booking and consultation flows **never break** due to upstream AI failures.

---

## 5. Notification Reliability & Retry Mechanism

Email delivery is decoupled from synchronous HTTP requests using a durable queue backed by PostgreSQL.

**Durable Notification Log**: All outbound communications are written to a `NotificationLog` table with `status: "PENDING"` before dispatch is attempted. This ensures zero notification loss even if the SMTP server is temporarily unavailable.

**Background Worker with Exponential Retry**: A node-cron job runs every 10 minutes and queries all `PENDING` logs with `retryCount < 3`. For each, it attempts SMTP delivery. On success, status is updated to `SENT`. On failure, `retryCount` is incremented and the error is logged. After 3 failures, the record transitions to `FAILED` for manual inspection.

**Google Calendar Integration**: Two approaches are implemented. First, a pre-filled Google Calendar deep-link URL (`calendar.google.com/calendar/render`) is generated immediately after booking and presented to the patient — no OAuth required, works for all users. Second, a full OAuth 2.0 flow (`/api/oauth/google` → `/api/oauth/callback`) stores a refresh token per user, enabling backend-initiated calendar event creation, updates, and deletions on reschedule or cancellation.
