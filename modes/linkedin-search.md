# Mode: linkedin-search — LinkedIn Job Search

## Purpose

Search LinkedIn Jobs for fresh openings matching Subham's target roles,
evaluate each against his profile, and generate tailored application emails
or LinkedIn connection notes.

## Inputs

- `config/profile.yml` — candidate profile (roles, skills, experience)
- `data/applications.md` — existing tracker (dedup check)
- `cv.md` — proof points for drafts
- Search keywords derived from CLAUDE.md target roles list

## Search Parameters

- **Keywords:** Data Analyst · Business Analyst · Operations Analyst ·
  MIS Analyst · QA Engineer · Reporting Analyst · BI Analyst ·
  Python Developer · Product Analyst
- **Location:** India (all cities) + Remote
- **Date posted:** Last 30 days only (last 7 days priority)
- **Experience level:** Entry / Associate (0–3 yrs preferred, max 4)
- **Skip:** Senior · Lead · Manager · Director · 5+ yrs required

## Steps

### STEP 1 — Search
Use WebSearch to find LinkedIn job listings matching the search parameters.
Query format: `site:linkedin.com/jobs "data analyst" India 2025`

### STEP 2 — Dedup
For each result, check `data/applications.md` by Company + Role.
Skip if status is Rejected / Discarded / already Applied.

### STEP 3 — Evaluate
For each new listing, run the GLOBAL PIPELINE (STEP 1–3 in CLAUDE.md):
- Parse JD
- Eligibility check
- Fit score (A–F)
Skip grade D and F automatically.

### STEP 4 — Draft
For grade A / B roles:
- Email draft (if company email findable) — max 150 words, metric-first
- LinkedIn connection note (300 chars max) if no email found
- Subject: "Application for [Role] — Subham Joshi ([Skill · Skill])"

### STEP 5 — Output Table
Show full results table:

| # | Company | Role | Grade | Posted | Channel | Action |
|---|---------|------|-------|--------|---------|--------|

### STEP 6 — Tracker Entry
Write TSV to `batch/tracker-additions/` for each role to apply.
Tag notes with `LINKEDIN`.

## TODO
- [ ] Add LinkedIn API / MCP integration when available
- [ ] Add Easy Apply detection logic
- [ ] Add recruiter contact extraction (run contacto mode)
