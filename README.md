# True Oath

An Australia-first political accountability ledger. True Oath separates a campaign promise from the evidence used to assess it, preserving sources, dates, confidence, and unresolved questions.

## Project layout

- `web/` — Next.js public ledger experience.
- `sanity/` — Sanity Studio and content model.

## Sanity

- Project ID: `wak4l160`
- Dataset: `production`
- Organization: `oqf9m6vy6`
- Hosted Studio: https://true-oath.sanity.studio/
- Studio app ID: `uk5zu82laqqn2uoecp2yikrq`
- Knowledge Base: `kbgnQdlEqXlP` (created; build currently waits for the organization's beta index quota)
- Dataset embeddings: ready for `production`, projected over accountability text fields

This is a separate Sanity project from Cyber Autopsy. Deployments, schemas, datasets, and dashboard entries belong to True Oath only.

The project is private by default. Keep API tokens in local environment files only.

## Run locally

```bash
cd sanity && npm run dev
cd web && npm run dev
```

The current web slice uses a small local Australia dataset while the Sanity schema is being populated. The next ingestion step will add official manifestos, election commitments, budgets, legislation, parliamentary records, and outcome evidence as linked documents.

The first public-source import is now in the True Oath dataset: 9 sources, 4 promises, 4 evidence records, 1 manifesto, and 1 government record. It was collected independently from Cyber Autopsy.

## Evidence coverage

True Oath is intended to ingest as much relevant public evidence as can be verified, including manifestos, election commitment lists, budget papers, legislation, parliamentary Hansard, committee reports, audits, regulator and court records, departmental progress reports, statistical releases, program dashboards, procurement records, official explanations, independent assessments, and competing public claims.

The model distinguishes implementation from outcomes. It records baselines, targets, measurement rules, milestones, blockers, reasons given for missed commitments, indicators, assessments, and contradictions. A government explanation is stored as a claim with a source; it is not automatically accepted as fact.

## Context agent

Create a True Oath MCP endpoint in Sanity Context with dataset source `wak4l160.production`, using the filter below. The organization token must remain server-side.

```text
_type in ["source", "promise", "evidence", "manifesto", "government"]
```

Then set `TRUE_OATH_MCP_URL` and `SANITY_ORG_TOKEN` from `.env.example` and run:

```bash
node agent/mcp-client.mjs
```

## Checks

```bash
cd web && npm run build && npm run lint
cd sanity && npm run build
```
