# True Oath

A political accountability ledger starting with Australia and designed to expand to other countries. True Oath separates a campaign promise from the evidence used to assess it, preserving sources, dates, confidence, and unresolved questions.

## Project layout

- `web/` — Next.js public ledger experience.
- `sanity/` — Sanity Studio and content model.

## Sanity

- Project ID: `wak4l160`
- Dataset: `production`
- Organization: `oqf9m6vy6`
- Hosted Studio: https://true-oath.sanity.studio/
- Studio app ID: `uk5zu82laqqn2uoecp2yikrq`
- Knowledge Base: `kbgnQdlEqXlP` (rebuilt from the latest corpus; 41 source units)
- Dataset embeddings: ready for `production`, projected over accountability text fields
- Dataset visibility: `public` for read-only inspection; writes remain authorized
- Vercel deployment: https://true-oath.vercel.app/

This is a separate Sanity project from Cyber Autopsy. Deployments, schemas, datasets, and dashboard entries belong to True Oath only.

The project is private by default. Keep API tokens in local environment files only.

## Run locally

```bash
cd sanity && npm run dev
cd web && npm run dev
```

The current web slice is a Vercel-ready investigative ledger. It reads the promise records and corpus counts from the public Sanity `wak4l160.production` dataset through the server-side `/api/ledger` route: search and filters narrow the files, selecting a row opens its case detail, charts summarize status and evidence depth, and the corpus inventory exposes sources, evidence, milestones, indicators, assessments, claims, and integrity events.

The web app is deployed from the `web/` directory as the `true-oath` Vercel project. The public demo is available at https://true-oath.vercel.app/.

The public-source import is now in the True Oath dataset: 23 public sources, 8 promises, 8 evidence records, 8 milestones, 8 outcome indicators, 8 independent assessments, 7 competing claims, 1 manifesto, 1 government record, and 4 integrity events. It was collected independently from Cyber Autopsy. The added commitments cover cheaper child care, paid family and domestic violence leave, Medicare Urgent Care Clinics, and the National Anti-Corruption Commission.

To sync the checked-in corpus to the production dataset, keep `SANITY_TOKEN` in `.env` and run:

```bash
node scripts/sync-sanity.mjs
```

## Evidence coverage

True Oath is intended to ingest as much relevant public evidence as can be verified, including manifestos, election commitment lists, budget papers, legislation, parliamentary Hansard, committee reports, audits, regulator and court records, departmental progress reports, statistical releases, program dashboards, procurement records, official explanations, independent assessments, and competing public claims.

The model distinguishes implementation from outcomes. It records baselines, targets, measurement rules, milestones, blockers, reasons given for missed commitments, indicators, assessments, and contradictions. A government explanation is stored as a claim with a source; it is not automatically accepted as fact.

Integrity evidence is modelled separately from promise verdicts. `integrityEvent` records the mechanism, evidence status, official-finding flag, confidence, source, and whether the event has a demonstrated effect on implementation or is only an integrity risk. The initial Australia corpus includes NACC procurement bribery and misuse-of-office findings, an ANAO conflict-of-interest audit, and a NACC case with no substantiated abuse of office. Allegations are never presented as convictions, and a corruption record is not linked to a promise unless a source demonstrates that connection.

## Context agent

The True Oath Context endpoint is:

```text
https://api.sanity.io/v1/context/organizations/oqf9m6vy6/mcp/true-oath-context
```

The organization token must remain server-side. The endpoint exposes the `kbgnQdlEqXlP` Knowledge Base, rebuilt from the latest Studio content. The underlying dataset contains 23 sources and 8 promises; the hosted Context build now reports 41 source units. The combined Context source usage is 41 for True Oath plus 46 for Cyber Autopsy = 87, below the stricter 150-document competition budget. Cyber Autopsy's separate Knowledge Base was reduced to a focused 46-source import so the shared index allocation could accommodate True Oath; its underlying dataset was not deleted.

For a dataset-backed Context endpoint, use the filter below:

```text
_type in ["source", "promise", "evidence", "manifesto", "government", "milestone", "indicator", "assessment", "claim", "integrityEvent"]
```

Set `TRUE_OATH_MCP_URL` and `SANITY_ORG_TOKEN` from `.env.example` and run:

```bash
node agent/mcp-client.mjs
```

## Checks

```bash
cd web && npm run build && npm run lint
cd sanity && npm run build
```
