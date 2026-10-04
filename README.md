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
- Knowledge Base: `kbgnQdlEqXlP` (created; build currently waits for the organization's beta index quota)
- Dataset embeddings: ready for `production`, projected over accountability text fields
- Dataset visibility: `public` for read-only inspection; writes remain authorized

This is a separate Sanity project from Cyber Autopsy. Deployments, schemas, datasets, and dashboard entries belong to True Oath only.

The project is private by default. Keep API tokens in local environment files only.

## Run locally

```bash
cd sanity && npm run dev
cd web && npm run dev
```

The current web slice is a Vercel-ready investigative ledger. It uses the four tracked promise records as local presentation data while the Sanity-backed agent flow is being wired: search and filters narrow the files, selecting a row opens its case detail, charts summarize status and evidence depth, and the integrity lens explains how findings and unresolved reporting are treated.

The first public-source import is now in the True Oath dataset: 15 public sources, 4 promises, 4 evidence records, 4 milestones, 4 outcome indicators, 4 independent assessments, 3 competing claims, 1 manifesto, 1 government record, and 4 integrity events. It was collected independently from Cyber Autopsy.

## Evidence coverage

True Oath is intended to ingest as much relevant public evidence as can be verified, including manifestos, election commitment lists, budget papers, legislation, parliamentary Hansard, committee reports, audits, regulator and court records, departmental progress reports, statistical releases, program dashboards, procurement records, official explanations, independent assessments, and competing public claims.

The model distinguishes implementation from outcomes. It records baselines, targets, measurement rules, milestones, blockers, reasons given for missed commitments, indicators, assessments, and contradictions. A government explanation is stored as a claim with a source; it is not automatically accepted as fact.

Integrity evidence is modelled separately from promise verdicts. `integrityEvent` records the mechanism, evidence status, official-finding flag, confidence, source, and whether the event has a demonstrated effect on implementation or is only an integrity risk. The initial Australia corpus includes NACC procurement bribery and misuse-of-office findings, an ANAO conflict-of-interest audit, and a NACC case with no substantiated abuse of office. Allegations are never presented as convictions, and a corruption record is not linked to a promise unless a source demonstrates that connection.

## Context agent

The True Oath Context endpoint is:

```text
https://api.sanity.io/v1/context/organizations/oqf9m6vy6/mcp/true-oath-context
```

The organization token must remain server-side. The endpoint currently exposes the `kbgnQdlEqXlP` Knowledge Base, which is created but empty because the organization beta index quota is exhausted. To complete the live agent run, either rebuild that Knowledge Base after quota is available or update the endpoint source to the public `wak4l160.production` dataset.

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
