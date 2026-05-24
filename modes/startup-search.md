# Mode: startup-search — Startup Job Search (Wellfound + YC)

## Purpose

Search Wellfound (AngelList) and YC Jobs for startup openings matching
Subham's target roles. Startups often skip ATS portals — direct email
outreach lands better here than on LinkedIn.

## Inputs

- `config/profile.yml` — candidate profile (roles, skills, experience)
- `data/applications.md` — existing tracker (dedup check)
- `cv.md` — proof points for drafts

## Search Sources

| Source | URL | Notes |
|--------|-----|-------|
| Wellfound | wellfound.com/jobs | Startup-focused, strong India remote listings |
| YC Jobs | workatastartup.com | YC-backed companies only, high signal |

## Search Parameters

- **Keywords:** Data Analyst · Business Analyst · Operations Analyst ·
  Python Developer · QA Engineer · MIS Analyst
- **Location:** India · Remote (no filter — Subham relocates)
- **Stage:** Seed · Series A · Series B (avoid pre-product)
- **Date posted:** Last 30 days only
- **Skip:** 5+ yrs exp · Senior/Lead/Manager title · Equity-only comp

## Steps

### STEP 1 — Search
Use WebSearch / WebFetch to pull listings from Wellfound and YC Jobs.
Query format: `site:wellfound.com "data analyst" India`

### STEP 2 — Dedup
Check `data/applications.md` by Company + Role.
Skip Rejected / Discarded / already Applied.

### STEP 3 — Evaluate
Run GLOBAL PIPELINE STEP 1–3 for each new listing:
- Parse JD
- Eligibility check
- Fit score (A–F)
Auto-skip grade D and F.

### STEP 4 — Draft
Startups respond to direct, punchy outreach. For grade A / B:
- Direct email to founder / hiring manager if findable
- Subject: "Application for [Role] — Subham Joshi ([Skill · Skill])"
- Max 150 words · lead with a metric · end with 15-min call ask
- If no email: LinkedIn note (300 chars) or Wellfound message

### STEP 5 — Output Table

| # | Company | Role | Stage | Grade | Contact | Action |
|---|---------|------|-------|-------|---------|--------|

### STEP 6 — Tracker Entry
Write TSV to `batch/tracker-additions/` for each apply decision.
Tag notes with `STARTUP`.

## TODO
- [ ] Add Wellfound API integration when available
- [ ] Add YC batch directory scraping
- [ ] Add founder LinkedIn lookup via contacto mode
