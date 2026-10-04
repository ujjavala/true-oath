# I Built a Political Accountability Agent That Queries Sanity

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

True Oath is a political accountability ledger starting with Australia and designed to expand to other countries. It is designed to answer a question that ordinary keyword search cannot answer reliably:

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

### Why I Built It

Election season is arriving in one country after another, and the question many voters eventually ask is simple: what actually happened? Campaign language is memorable, but the details are scattered across budget papers, legislation, departmental updates, audits, statistics, court records, and later explanations. It is easy to remember a promise and much harder to audit it fairly.

True Oath is my attempt to make that audit navigable. The point is not to manufacture a score for every political claim. It is to preserve the promise, follow the evidence, show contradictions, and leave uncertainty visible when the record is incomplete. Can Sanity help us keep our sanity? That is the experiment, with the pun fully intended.

## Demo

The True Oath Sanity Studio is deployed at:

https://true-oath.sanity.studio/

The Next.js web app is deployed to Vercel from the `web/` directory:

https://true-oath.vercel.app/

The project is named `true-oath`, the clean `true-oath.vercel.app` domain is publicly reachable, and Vercel SSO deployment protection has been disabled for this read-only demo. During development, run it locally:

```bash
cd web
npm install
npm run dev
```

Its first screen is an investigative ledger: readers can search and filter the four promise files, select a case file, inspect confidence and linked evidence counts, and jump to the integrity method. The dashboard now includes a status-distribution chart, evidence-depth bars, and an average-confidence readout so the corpus can be scanned before a reader opens an individual file. Lucide icons, responsive layouts, keyboard-friendly controls, status colors, subtle motion, and mobile overflow states are included in the interface.

The Sanity dataset contains the first independently collected Australia corpus: 15 public sources, 4 promises, 4 evidence records, 4 milestones, 4 outcome indicators, 4 independent assessments, 3 competing claims, 1 manifesto, 1 government record, and 4 integrity events. The `production` dataset is now public-read for judging and API inspection. Public reads do not grant anonymous editing or uploads.

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
- `evidence` records a dated finding and whether it supports, partially supports, contradicts, or is neutral toward a promise;
- `milestone` records announcements, funding, legislation, starts, delays, cancellations, and delivery events;
- `indicator` records measurable outcomes against a defined baseline, target, period, and unit;
- `assessment` records an independent verdict and its reasoning; and
- `claim` records competing explanations or interpretations without silently treating them as verified facts.
- `integrityEvent` records corruption and integrity signals separately from promise verdicts, including mechanism, evidence status, official-finding status, confidence, source, and whether a demonstrated effect on implementation exists.

The current promise records are linked to milestones, outcome indicators, independent assessments, and competing claims. That means an agent can distinguish “a policy was announced”, “a measurable output changed”, “an assessor gave a verdict”, and “a government or public interpretation explains why” instead of collapsing those into one status field.

The intended corpus is deliberately broad. It will combine election material with budgets, legislation, Hansard, committee reports, audits, regulator and court records, departmental progress reports, statistical releases, program dashboards, procurement records, official explanations, independent assessments, and competing claims. This lets the agent investigate not only whether a promise was met, but what changed, why delivery may have slipped, whether the stated reason is supported, and whether different sources contradict one another.

The integrity slice adds public NACC and ANAO material. It includes an official bribery finding connected to contract bidding, an official misuse-of-office finding, a conflict-of-interest audit, and a NACC case where a perceived conflict was not substantiated as abuse of office. The last example is intentional: True Oath must be able to say that a claim was investigated and not proven. It should not call something “rigged” merely because a news report or political claim uses that language. The agent must preserve the source's status and only connect an integrity event to a promise when the evidence establishes that link.

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

The True Oath Knowledge Base has been created specifically for this project as `kbgnQdlEqXlP`. Its first build is waiting on the organization's 150-document beta index quota, which is currently consumed by Cyber Autopsy. The Path One agent therefore uses the supported live-dataset GROQ Context mode for True Oath, with a narrow filter over the five accountability document types. It does not reuse Cyber Autopsy's dataset or content.

## Sanity Project Details

- Project ID: `wak4l160`
- Dataset: `production`
- Dataset visibility: `public` (read-only to unauthenticated API clients; writes still require authorization)
- Organization: `oqf9m6vy6`
- Hosted Studio: https://true-oath.sanity.studio/
- Studio app ID: `uk5zu82laqqn2uoecp2yikrq`
- Knowledge Base public ID: `kbgnQdlEqXlP`

Public dataset inspection endpoint:

https://wak4l160.api.sanity.io/v2025-08-15/data/query/production?query=count%28%2A%29

The True Oath read-only MCP endpoint now exists at `https://api.sanity.io/v1/context/organizations/oqf9m6vy6/mcp/true-oath-context`. The endpoint is authenticated and currently points at the created `kbgnQdlEqXlP` Knowledge Base, but that Knowledge Base reports 0 entries because the organization's beta index quota is exhausted. The final agent run therefore still requires either rebuilding that Knowledge Base after quota is available or switching the endpoint source to the public `wak4l160.production` dataset with embeddings and the accountability GROQ filter.

## Agent Session

The final submission still needs a curated Codex transcript showing:

1. the agent receiving an Australia accountability question;
2. the agent querying the True Oath Context MCP endpoint;
3. retrieved Sanity entries and their source links;
4. a comparison of supporting and conflicting evidence; and
5. a cautious answer that distinguishes fact, assessment, uncertainty, and missing data.

The Knowledge Base build is quota-blocked, so the transcript will show the live-dataset Context MCP route instead. It will be checked for API tokens, private URLs, and other secrets before being made public.

<!-- Add the public DEV Agent Session link here after the final read-only run is complete. -->

<!-- Add a cover image or final walkthrough video before publishing. -->

<!-- Team Submissions: credit teammates by listing their DEV usernames here if applicable. -->

<!-- Thanks for participating! -->
