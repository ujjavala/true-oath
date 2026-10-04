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

This is a separate Sanity project from Cyber Autopsy. Deployments, schemas, datasets, and dashboard entries belong to True Oath only.

The project is private by default. Keep API tokens in local environment files only.

## Run locally

```bash
cd sanity && npm run dev
cd web && npm run dev
```

The current web slice uses a small local Australia dataset while the Sanity schema is being populated. The next ingestion step will add official manifestos, election commitments, budgets, legislation, parliamentary records, and outcome evidence as linked documents.

## Checks

```bash
cd web && npm run build && npm run lint
cd sanity && npm run build
```
