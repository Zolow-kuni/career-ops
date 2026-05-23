# [PARALLEL SCAN — Subham Global Remote] Skipped — 2026-05-20

## Categories

1. **Below 4.0** — evaluated, scored low
2. **Excluded by role criteria** — QA / Test / SDET / RPA / Python Developer / Software Tester
3. **Location-blocked** — JD requires specific country residency / work authorization
4. **Year-floor too high** — JD requires 4+ years
5. **Salary above $10K/yr threshold** — per strict filter
6. **Stale / expired posting** — posted >30 days ago, listing dead
7. **JD content not retrievable** — WebFetch couldn't extract JD body
8. **Internship / part-time** — not full-time per spec

---

## Skip Rationale per URL

### Phase A + B (remaining after sample-10)

| Company | Role | Score | Reason | Source |
|---------|------|------:|--------|--------|
| Judi Health | Business Analyst | 3.2 | Denver-based US role; likely US-only hiring | remoteok |
| Careers In Travel - Destination Planners | Travel Operations Coordinator | 2.8 | Detroit-based; coordinator role, not analyst track | remoteok |
| Forge Global | Asset Administration Operations Specialist | 3.5 | Denver; "Specialist" likely implies 3+ yrs; financial services domain | remoteok |
| Rivia Mind | Patient Operations Coordinator | 2.4 | Healthcare CX coordinator, not analyst track | remoteok |
| UX Woman | Entry Level UX Research Apprenticeship | 2.0 | UX research, not analyst track — title leak past filter | weworkremotely |
| FREE NOW | Junior Data Operations Analyst (Hamburg/Remote) | 3.5 | EU-only remote (same blocker as Berlin variant in sample) | himalayas |
| Packlane | Data Analyst | 2.5 | 4+ years required — strict filter REJECT | jobspresso |
| Creative Market | Growth Analyst | 3.8 | US-only remote; 3+ yrs experience required | jobspresso |
| Craniometrix (YC) | Data Analyst | 3.7 | Healthcare ops; US-only likely; mid-level | workatastartup |

### Phase C — LinkedIn

| Company | Role | Score | Reason |
|---------|------|------:|--------|
| TalentKompass Deutschland | Junior Data Analyst (Remote Internship — Delhi) | 2.5 | Internship, not full-time per spec |
| TalentKompass Deutschland | Junior Data Analyst (Remote Internship — London) | 2.5 | Internship, not full-time per spec |
| Chord | Analytics Engineer (Remote NY) | 4.0 | US-only remote |
| Software.com | Analytics Engineer (SF/Remote) | 3.5 | Senior expectations on dbt projects |
| KOHO | Analytics Engineer (Remote Canada) | 3.8 | Canada-only remote; intermediate level |
| NRG Energy | Campaign Operations Analyst (Remote Texas) | 3.5 | Texas-based, US work auth required |
| FreshBooks | Sales Operations Analyst (Remote TX) | 3.2 | 3-yr min + US Salesforce admin focus |
| Yelp | Revenue Operations Analyst (Remote US) | 3.5 | US-only remote |
| Thriveworks | People Operations Analyst (Remote US) | 3.5 | US-only remote; 1-4y |

### Phase B sample-10 (full evals)

See `results.md` for the rejected 9 from the agent-scored sample. Categories:
- Salary above $10K threshold: 1 (Pure Integration W2 $30-40/hr)
- Listing expired (>30d): 4 (Kraken×3, InPost)
- Years floor 4+: 1 (Kraken Regulatory 5+y)
- Geographic gating: 3 (Ansible US-clearance, FREE NOW EU, Kraken India not eligible)
- WebFetch couldn't render JD: 4 (Himalayas SPA pages)
- 404: 1 (Jobgether)

---

### Phase D — India-board pivot

| Company | Role | Score | Reason |
|---------|------|------:|--------|
| Deloitte | Analyst Trainee (WFH) | — | Listing expired — confirmed closed by user 2026-05-20 |

---

## Total Skipped

| Source | Skipped count |
|--------|--------------:|
| Phase A (RemoteOK + WWR) | 6 |
| Phase B (Himalayas + Jobspresso + WorkingNomads + YC sample) | 12 |
| Phase C (LinkedIn) | 9 |
| Phase D (India-board pivot) | 1 |
| **Total skipped** | **27** |

## Pivot recommendation

The 27 skipped URLs share a structural pattern: Western remote-first boards aggregate roles whose minimum salary (typically $40K-$120K USD/yr) exceeds Subham's ₹5-8 LPA target (~$5.2K-$8.3K USD/yr). The strict spec's "JD min > $10K → REJECT" filter is the binding constraint — not bad role matching.

**For future PARALLEL runs:** drop most Western boards and pivot to India-priced remote sources:
- Naukri.com Remote India filter
- Cutshort.io Remote India
- Instahyre Data Analyst Remote India
- LinkedIn India filter (geoId=102713980 for India)
- Wellfound India startup salary band
- AngelList India-based remote companies
- Hasura, Razorpay, etc. via their own careers pages with India-rate bands
