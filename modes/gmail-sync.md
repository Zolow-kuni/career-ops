# Mode: gmail-sync — Gmail → Tracker Sync

Reads the Gmail inbox for job-related emails, classifies each thread, proposes status updates to `data/applications.md`, and optionally drafts replies. Does **not** send anything automatically.

## Inputs

- `data/applications.md` — Application tracker (source of company names + current statuses)
- Gmail (via MCP Gmail tools)
- `config/profile.yml` — Candidate name + email for draft addressing
- `modes/_profile.md` — Writing style for reply drafts

---

## Step 1 — Load tracked applications

Read `data/applications.md`. Extract all rows where Status is one of:

| Status | Include? | Reason |
|--------|----------|--------|
| `Applied` | ✅ | Awaiting confirmation or response |
| `Respondido` | ✅ | Active dialogue; may have new messages |
| `Contacto` | ✅ | Outbound contact; may have replied |
| `Entrevista` | ✅ | Interview in progress |
| `Oferta` | ✅ | Negotiation in progress |
| `Evaluada` | ✅ | May have received application confirmation |
| `SKIP` / `Rechazada` / `Descartada` | ❌ | No action needed |

Build a **company list**: deduplicated company names from included rows, plus the row's `#`, current `Status`, and `Role`.

---

## Step 2 — Search Gmail

For each company in the list, run `mcp__claude_ai_Gmail__search_threads` with a targeted query:

```
"{company}" (job OR application OR interview OR offer OR resume OR role OR position OR opportunity OR recruit)
```

Additionally run these **catch-all** queries to surface emails that mention job terms but not a tracked company name:

```
subject:(interview OR "job offer" OR "we'd like to" OR "next steps" OR "move forward" OR "application received" OR "application update" OR "your application" OR "congratulations" OR "unfortunately") newer_than:30d
```

```
from:(careers OR recruit OR talent OR hiring OR noreply OR hr OR jobs) newer_than:30d
```

Collect all unique `threadId` values. Deduplicate across queries.

**Skip threads already labelled `career-ops/synced`** — they were processed in a previous run.

### LinkedIn sender handling — CRITICAL

LinkedIn sends both **high-signal** and **noise** emails from different sub-senders. **Never blanket-exclude `from:linkedin.com`** — that suppresses application-status updates. Instead:

**INCLUDE these LinkedIn senders (high signal — must process):**
- `from:jobs-noreply@linkedin.com` — "Your application was viewed by X" / "Apply to your saved jobs" — application engagement signals
- `from:invitations@linkedin.com` — "{Name} is waiting for your response" — inbound connection requests (potential recruiters or warm leads)
- `from:messaging-digest-noreply@linkedin.com` — recruiter DM summaries
- `from:messages-noreply@linkedin.com` — DM thread digests
- `from:inmail-hit-reply@linkedin.com` — InMail responses
- `from:security-noreply@linkedin.com` — account security (logins, password resets — just label as synced after review)

**EXCLUDE these LinkedIn senders (pure noise):**
- `from:jobalerts-noreply@linkedin.com` — daily personalized job suggestions (LinkedIn's algorithmic feed, not actionable)
- `from:newsletters-noreply@linkedin.com` — newsletter content
- `from:linkedin@em.linkedin.com` — marketing / Premium upsells
- `from:messages-noreply@linkedin.com` with subject containing "profile views" — informational only

**Recommended catch-all query for LinkedIn signals:**

```
(from:jobs-noreply@linkedin.com OR from:invitations@linkedin.com OR from:messaging-digest-noreply@linkedin.com OR from:inmail-hit-reply@linkedin.com) newer_than:30d -label:career-ops/synced
```

When a `jobs-noreply` "application was viewed by X" surfaces a company **NOT in tracker**, it means an application was made (likely via LinkedIn Easy Apply) but never logged. **Add it as a tracker entry retroactively.**

---

## Step 3 — Read and classify each thread

For each unique thread, call `mcp__claude_ai_Gmail__get_thread` to read the full message chain.

Classify the thread into one of these event types:

| Event type | Key signals |
|------------|-------------|
| `confirmation` | "received your application", "thank you for applying", "application submitted", "we have received", "we'll be in touch" |
| `rejection` | "not moving forward", "decided to move forward with other candidates", "not a fit", "position has been filled", "unfortunately", "wish you the best" |
| `interview_invite` | "schedule", "interview", "meet with", "video call", "availability", "slot", "calendar invite", "speak with our team" |
| `assessment` | "online assessment", "coding challenge", "take-home", "case study", "assignment", "test link", "HackerRank", "Codility" |
| `offer` | "pleased to offer", "extend an offer", "compensation package", "offer letter", "start date" |
| `recruiter_outreach` | "came across your profile", "your background", "we're hiring", "open to new opportunities", "exploring opportunities" |
| `follow_up_reply` | Reply to a follow-up email Subham sent; any "re:" thread where the last message is from the company |
| `generic_update` | "application is under review", "still reviewing", "update on your application" — no action needed |
| `irrelevant` | Marketing, newsletters, unrelated to Subham's applications |

Extract from each thread:
- `company`: matched company name (from Step 1 list, or infer from sender domain/signature)
- `role`: job title mentioned in email (if parseable)
- `event_type`: from table above
- `date`: date of the most recent message in the thread
- `sender`: sender name/email
- `key_excerpt`: 1–2 sentences that best summarize the email's intent
- `thread_id`: for labelling later

---

## Step 4 — Propose status updates

Map each classified event to a tracker status transition. Apply the **no-downgrade rule**: never move a status backward in the progression chain.

**Status progression order (ascending):**
`Evaluada` < `Aplicado` < `Respondido` < `Contacto` < `Entrevista` < `Oferta` / `Rechazada`

| Event type | Proposed new status | Condition |
|------------|--------------------|-|
| `confirmation` | `Aplicado` | Only if current status is `Evaluada` |
| `rejection` | `Rechazada` | Always (terminal — override any status) |
| `offer` | `Oferta` | Always |
| `interview_invite` | `Entrevista` | If current is below `Entrevista` |
| `assessment` | `Respondido` | If current is below `Respondido` |
| `recruiter_outreach` | `Respondido` | If current is below `Respondido` |
| `follow_up_reply` | `Respondido` | If current is `Aplicado` |
| `generic_update` | No change | — |
| `irrelevant` | No change | — |

**If the company is not in `data/applications.md` at all** (new inbound recruiter outreach for a role not yet evaluated):
- Flag as `NEW INBOUND — not in tracker` and present it separately (Step 5b).

---

## Step 5 — Present proposed changes

**Do not apply any changes yet.** Show two sections:

### 5a — Status updates for tracked applications

```
Gmail Sync — {date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{N} threads scanned · {N} with proposed changes · {N} no action

┌─────────────────────────────────────────────────────────────┐
│ #021 · Stripe · Operations Associate, Apprenticeship        │
│ Event:   interview_invite                                   │
│ Date:    2026-05-26                                         │
│ From:    recruiting@stripe.com                              │
│ Excerpt: "We'd like to schedule a 30-min call to discuss…"  │
│ Change:  Applied → Entrevista                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ #024 · Stripe · Verifications Operations Associate          │
│ Event:   rejection                                          │
│ Date:    2026-05-25                                         │
│ From:    no-reply@stripe.com                                │
│ Excerpt: "We've decided to move forward with other…"        │
│ Change:  Applied → Rechazada                                │
└─────────────────────────────────────────────────────────────┘
```

### 5b — New inbound threads (not in tracker)

```
┌─────────────────────────────────────────────────────────────┐
│ NEW INBOUND · Razorpay · Data Analyst, Payments             │
│ Event:   recruiter_outreach                                 │
│ Date:    2026-05-25                                         │
│ From:    talent@razorpay.com                                │
│ Excerpt: "Hi Subham, I came across your profile and…"       │
│ → Run /career-ops pipeline to evaluate before responding    │
└─────────────────────────────────────────────────────────────┘
```

### 5c — Threads with no action

List as a compact table:

```
Company          | Event            | Why no action
Peakflo          | generic_update   | "Still reviewing" — no status change
EY               | confirmation     | Already at Respondido — no downgrade
```

---

## Step 6 — Confirm and apply

Ask:
> Apply {N} status updates? Reply **yes** to confirm, or name specific rows to skip (e.g. "skip Stripe rejection").

On confirmation:

1. **Update `data/applications.md`**: edit each affected row's Status column in-place.
2. **Label processed threads** in Gmail:
   - Check if label `career-ops/synced` exists via `mcp__claude_ai_Gmail__list_labels`; create it if not via `mcp__claude_ai_Gmail__create_label`
   - Apply label to every processed thread via `mcp__claude_ai_Gmail__label_thread` (both threads with changes and threads explicitly reviewed with no action)
3. Show a compact confirmation:

```
✅ Updated:
  #021 Stripe Apprenticeship  Applied → Entrevista
  #024 Stripe Verifications   Applied → Rechazada

📧 Labelled 8 threads with career-ops/synced

⏭  Skipped (per your request):
  — none
```

---

## Step 7 — Generate reply drafts (conditional)

For every thread classified as `interview_invite`, `assessment`, or `follow_up_reply` where the **last message is from the company** (i.e., they are waiting for Subham's reply):

1. Read `config/profile.yml` for Subham's name
2. Read `modes/_profile.md` for writing style
3. Generate a draft reply:

### Interview invite reply

3–4 sentences:
1. Thank them for the invitation. Name the role specifically.
2. Confirm availability — offer 2–3 specific time windows within the next 5 business days.
3. Ask for any prep materials or confirm format (video/phone/panel).

Subject: Re: [original subject]

### Assessment reply

2–3 sentences:
1. Acknowledge receipt and confirm you'll complete it by the deadline.
2. Ask one clarifying question only if the instructions are genuinely ambiguous — skip if clear.

### Follow-up reply

2–3 sentences that pick up the conversation thread naturally. Reference the specific role. No "just checking in."

**Rules for all drafts:**
- Under 120 words
- No filler phrases (see `_shared.md` → "Avoid cliché phrases")
- Action-first sentences
- Do NOT use `mcp__claude_ai_Gmail__create_draft` automatically — show the draft text first and ask "Create as Gmail draft?" before calling the tool.

---

## Step 8 — Summary

```
Gmail Sync complete — {date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Threads scanned:      {N}
Status updates:       {N}
New inbound leads:    {N}  (run /career-ops pipeline to evaluate)
Reply drafts:         {N}  (waiting for your review above)
Threads labelled:     {N}  (career-ops/synced)

Next: /career-ops followup to review follow-up cadence.
```

---

## Edge cases

| Situation | Handling |
|-----------|----------|
| Thread matches multiple companies | Use the company whose name appears in the email subject or sender domain; flag ambiguity to user |
| Gmail returns > 50 threads per query | Process the 50 most recent; note the cutoff |
| Thread is a newsletter / mass email | Classify as `irrelevant`; label `career-ops/synced` to suppress in future runs |
| `mcp__claude_ai_Gmail__get_thread` fails (permission / network) | Skip thread, note in summary |
| Company name has variants (e.g. "EY" vs "Ernst & Young") | Normalize: try both in search query; use the `applications.md` canonical name for updates |
| Same company, multiple roles in tracker | Match by role name mentioned in email body; if ambiguous, flag and ask user |
| Offer email arrives but no PDF was generated | Prompt: "Offer from {company} detected — run `/career-ops apply` to generate offer-specific materials before responding" |
