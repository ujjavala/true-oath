# I Built a Political Accountability Agent That Queries Sanity

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

True Oath is an Australia-first political accountability ledger. It is designed to answer a question that ordinary keyword search cannot answer reliably:

> What did a political party promise, what evidence shows what happened next, and where is the evidence still incomplete or contradictory?

The project models political accountability as linked, source-grounded records rather than as a list of unverified claims. A promise is connected to its manifesto, government, evidence records, dates, status, confidence, and source URLs.

The first jurisdiction is Australia. The initial evidence plan combines:

- election manifestos and policy documents;
- Australian Parliamentary Budget Office election-commitment costings;
- federal budgets and budget papers;
- parliamentary records and legislation;
- departmental and statutory-authority reports;
- official outcome statistics; and
- carefully labelled independent assessments.

The interface presents each promise with a status such as `Kept`, `Partially kept`, `In progress`, `Not started`, `Broken`, `Reversed`, or `Unverifiable`. The system is intentionally conservative: an absent search result is not treated as proof that a promise was broken.

## Demo

The True Oath Sanity Studio is deployed at:

https://true-oath.sanity.studio/

The public web experience is currently being prepared for deployment. During development, run it locally:

```bash
cd web
npm install
npm run dev
```

The current interface contains a small local demonstration set. The final demo will replace those records with Australia documents queried from the True Oath Sanity project through the agent.

## Code

Repository: https://github.com/ujjavala/true-oath

The repository contains:

- `web/` — the Next.js accountability interface;
- `sanity/` — the Sanity Studio and schema;
- `sanity/schemaTypes/index.ts` — the structured content model;
- `README.md` — local setup and deployment notes.

The project currently builds with:

```bash
cd web && npm run build && npm run lint
cd sanity && npm run build
```

## How I Used Sanity

Sanity is the evidence layer for True Oath. The Studio schema separates the main concepts instead of flattening them into one article:

- `government` records the governing party or coalition and its time period;
- `manifesto` records the election document and the party that published it;
- `promise` records a specific commitment and its current assessment;
- `source` preserves the publisher, URL, date, and source category;
- `evidence` records a dated finding and whether it supports, partially supports, contradicts, or is neutral toward a promise.

The intended Path One agent will connect to the True Oath Sanity Context MCP endpoint. It will retrieve the relevant promises and evidence, follow their source references, compare claims across documents, and answer questions such as:

- Which 2022 Australian federal promises are still in progress?
- Which commitments have official budget or legislative evidence?
- Which promises have conflicting evidence from different sources?
- Which assessments should remain `Unverifiable` because the promise was not specific enough?

This is the part that requires structured content. A keyword search can find the word “housing”, but it cannot reliably follow the relationship between a manifesto commitment, a budget measure, a later law, and an outcome assessment.

Planned Context configuration:

```text
Source: True Oath Sanity production dataset
Scope: Australia political promises and evidence
Retrieval: Sanity Context MCP
Output rule: preserve source links, dates, confidence, and unresolved conflicts
```

The Knowledge Base and MCP endpoint will be created specifically for this project before the final submission. They must not reuse Cyber Autopsy's endpoint or dataset.

## Sanity Project Details

- Project ID: `wak4l160`
- Dataset: `production`
- Organization: `oqf9m6vy6`
- Hosted Studio: https://true-oath.sanity.studio/
- Studio app ID: `uk5zu82laqqn2uoecp2yikrq`

The dataset is currently private while the source corpus is being assembled. The final submission will add the True Oath Context Knowledge Base and its read-only MCP endpoint here once the Australia documents have been imported and validated.

## Agent Session

The final submission will include a curated Codex transcript showing:

1. the agent receiving an Australia accountability question;
2. the agent querying the True Oath Context MCP endpoint;
3. retrieved Sanity entries and their source links;
4. a comparison of supporting and conflicting evidence; and
5. a cautious answer that distinguishes fact, assessment, uncertainty, and missing data.

The transcript will be curated into the final DEV post after the Knowledge Base and live agent query have been tested. It will be checked for API tokens, private URLs, and other secrets before being made public.

<!-- Add the public DEV Agent Session link here after the final read-only run is complete. -->

<!-- Add a cover image or final walkthrough video before publishing. -->

<!-- Team Submissions: credit teammates by listing their DEV usernames here if applicable. -->

<!-- Thanks for participating! -->
