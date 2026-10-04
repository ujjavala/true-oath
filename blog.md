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

Its first screen is an investigative ledger: readers can search and filter the eight Sanity-backed promise files, select a case file, inspect confidence and linked evidence counts, and jump to the integrity method. The dashboard now includes a status-distribution chart, evidence-depth bars, an average-confidence readout, and a corpus inventory showing every Sanity document type. Lucide icons, responsive layouts, keyboard-friendly controls, status colors, subtle motion, and mobile overflow states are included in the interface.

The Sanity dataset contains the independently collected Australia corpus: 23 public sources, 8 promises, 8 evidence records, 8 milestones, 8 outcome indicators, 8 independent assessments, 7 competing claims, 1 manifesto, 1 government record, and 4 integrity events. The `production` dataset is public-read for judging and API inspection. Public reads do not grant anonymous editing or uploads.

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

### Sanity Services Used

**Sanity Studio and schema.** I used a hosted Sanity Studio as the editorial surface for the project. The schema is the first important design decision: it keeps a campaign promise separate from the source that announced it, the evidence that tests it, the milestone that records implementation, the indicator that measures an outcome, and the assessment that explains a verdict. The model also has `claim` and `integrityEvent` documents so competing explanations and corruption-related records are not silently merged into a promise score.

The core promise model is defined in `sanity/schemaTypes/index.ts`:

```ts
defineType({
  name: "promise",
  type: "document",
  fields: [
    defineField({name: "title", type: "string"}),
    defineField({name: "status", type: "string"}),
    defineField({name: "baseline", type: "string"}),
    defineField({name: "target", type: "string"}),
    defineField({name: "milestones", type: "array", of: [
      {type: "reference", to: [{type: "milestone"}]},
    ]}),
    defineField({name: "indicators", type: "array", of: [
      {type: "reference", to: [{type: "indicator"}]},
    ]}),
  ],
})
```

**Content Lake and dataset.** The structured records live in the separate True Oath project `wak4l160`, dataset `production`. The dataset is public-read so judges can inspect the records, but writes still require authorization. The current corpus has 76 documents: 23 sources, 8 promises, 8 evidence records, 8 milestones, 8 indicators, 8 assessments, 7 claims, 4 integrity events, a manifesto, and a government record.

I imported the public records as linked Sanity documents instead of flattening them into one JSON blob:

```bash
npx sanity documents create data/australia.json \
  --project-id wak4l160 \
  --dataset production \
  --replace
```

That makes relationships queryable. For example, an assessment can point to a promise and its source, while an indicator can preserve the measurement period and unit independently from the political language that motivated it.

**Embeddings.** Dataset embeddings are enabled for the accountability text fields. This is intended to support conceptual retrieval when a question uses different language from the source, while the structured fields and GROQ-style filtering preserve exact relationships and status values.

**Sanity Context and MCP.** The project has a Context endpoint at:

```text
https://api.sanity.io/v1/context/organizations/oqf9m6vy6/mcp/true-oath-context
```

The agent client in `agent/mcp-client.mjs` speaks JSON-RPC over MCP. It initializes a session, lists the tools, then supports both the GROQ-style route and the Knowledge Base route:

```js
const tools = await call("tools/list")

if (available.includes("groq_query")) {
  result = await call("tools/call", {
    name: "groq_query",
    arguments: {query: accountabilityQuery},
  })
} else {
  const context = await call("tools/call", {
    name: "initial_context",
    arguments: {},
  })
  // Extract the Knowledge Base id, then search its entries.
  result = await call("tools/call", {
    name: "knowledge_base_search",
    arguments: {
      knowledgeBase,
      query: "promise evidence government milestone assessment integrity",
      return: "entries",
      limit: 10,
    },
  })
}
```

The endpoint currently exposes the Knowledge Base tools `initial_context`, `knowledge_base_search`, and `knowledge_base_read`. The Knowledge Base exists as `kbgnQdlEqXlP` and has been rebuilt from the newly synced Studio records. The stricter competition budget is 150 combined documents; live Context usage is 41 True Oath source units plus 46 Cyber Autopsy source units, or 87 total. The organization CLI currently reports a higher technical limit of 5,000, but the project deliberately stays below the competition’s 150-document guidance.

**Sanity CLI and deployment.** The Sanity CLI is used for schema builds, hosted Studio deployment, document import, dataset visibility checks, and embedding setup. The Studio is deployed at https://true-oath.sanity.studio/. The web experience is a separate Next.js app deployed at https://true-oath.vercel.app/.

### Sanity Functions and Agent Actions

The project now uses Sanity's native automation layer for evidence-quality
review. A `reviewTask` document type gives the Studio a durable queue for
missing sources, broken references, stale or incomplete evidence, and integrity
status checks. The custom Studio Structure menu puts `Review queue` first and
filters it to open and in-review tasks.

The Blueprint in `sanity/sanity.blueprint.ts` provisions the
`true-oath-review-automation` Stack, a project-scoped robot token, and the
`review-queue-on-content-change` document Function. It watches published
evidence, milestones, indicators, assessments, and integrity events. When a
document needs attention, the Function creates a deduplicated task containing
the affected document reference, severity, explanation, and suggested next
step. It never changes a promise status or publishes a political verdict.

Agent Actions provide a second, deliberately constrained workflow. The helper
in `sanity/scripts/draft-review-agent-action.mjs` uses Sanity's schema-aware
Generate action to draft `reviewerNotes` for a selected review task. The action
requires the deployed schema ID and a server-side token, and Sanity's default
draft-only behavior remains enabled. A human must review the note and decide
whether to resolve, dismiss, or keep the task open.

This gives True Oath event-driven review, schema-aware drafting, and an
inspectable Studio workflow without asking AI to decide whether a promise was
kept. The Function and robot token were deployed through the
`true-oath-review-automation` Blueprint Stack and verified as completed.

### Challenges With Sanity

The hardest part was not storing documents; it was choosing boundaries that preserve uncertainty. A budget measure is not the same thing as a delivered outcome, and a government explanation is not automatically an independent finding. That is why the schema has separate milestones, indicators, assessments, claims, and integrity events.

The Knowledge Base beta quota was another real constraint. Cyber Autopsy initially consumed the shared indexing budget, so we reduced it to a focused 46-source import before expanding True Oath. The two projects now use 87 combined source units, leaving room under the 150-document competition guidance. This keeps both Knowledge Bases available without deleting either underlying Sanity dataset.

There was also a tooling mismatch to handle. The first agent draft expected a `groq_query` tool, but the configured Knowledge Base endpoint exposed `initial_context`, `knowledge_base_search`, and `knowledge_base_read`. The client now detects the available tool contract instead of assuming one response shape. Finally, Context authentication is organization-scoped, while ordinary Content API tokens are project-scoped; keeping those credentials separate is important for both security and a working MCP connection.

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

The True Oath Knowledge Base was created specifically for this project as `kbgnQdlEqXlP`. After reducing the separate Cyber Autopsy Knowledge Base to a focused 46-source import, True Oath’s rebuild completed with 41 indexed source units. The public web UI reads the live Studio dataset directly through Sanity’s Content API, while the agent uses the read-only Context endpoint. It does not reuse Cyber Autopsy's dataset or content.

## Sanity Project Details

- Project ID: `wak4l160`
- Dataset: `production`
- Dataset visibility: `public` (read-only to unauthenticated API clients; writes still require authorization)
- Organization: `oqf9m6vy6`
- Hosted Studio: https://true-oath.sanity.studio/
- Studio app ID: `uk5zu82laqqn2uoecp2yikrq`
- Knowledge Base public ID: `kbgnQdlEqXlP`
- Blueprint Stack: `true-oath-review-automation` (`ST-rietwjrd38`)
- Deployed Function: `review-queue-on-content-change`

Public dataset inspection endpoint:

https://wak4l160.api.sanity.io/v2025-08-15/data/query/production?query=count%28%2A%29

The True Oath read-only MCP endpoint now exists at `https://api.sanity.io/v1/context/organizations/oqf9m6vy6/mcp/true-oath-context`. It points at `kbgnQdlEqXlP`, rebuilt from the current Studio dataset. The agent connects with the MCP Knowledge Base tools, searches the accountability content, and retrieves source-linked entries. The organization had a shared index limit while Cyber Autopsy occupied the full allocation, so Cyber Autopsy was reduced to a focused 46-source import to free capacity without deleting its underlying dataset.

## Conclusion and What Comes Next

True Oath starts with a small Australia corpus, but the underlying model is meant to travel. The next step is to add more federal elections, then extend the same source-linked structure to state governments and other countries where reliable public records are available. Each new jurisdiction would bring its own election documents, budget conventions, laws, agencies, statistical releases, and standards for official findings.

Future versions could add time-series indicators, parliamentary voting histories, procurement and grant data, scheduled milestone reminders, and comparison views that show how different sources describe the same event. The current Function queue and draft Agent Action create a foundation for those extensions, while a richer agent could explain why two claims conflict, identify the missing document that would resolve an uncertainty, and carry a human reviewer’s resolution forward as a durable editorial decision in Sanity.

The hard problems are as important as the features. A promise can be vague, a target can change, an outcome can be affected by events outside a government’s control, and a media report can flatten a complicated audit into a dramatic headline. Sources can disagree without one being obviously false. That is why True Oath keeps confidence, provenance, dates, status reasons, and “no finding” cases visible instead of forcing every record into a binary score. The current Knowledge Base indexing quota and the work required to curate a public MCP session are practical constraints too.

The goal is not to replace political judgment with an automated verdict. It is to make judgment better informed, easier to inspect, and easier to revise when the evidence changes. If Sanity can keep the content structured and the agent can keep its claims tied to that structure, voters get something more useful than another feed of opinions: a living record they can question.

## Agent Session

The final submission still needs a curated Codex transcript showing:

1. the agent receiving an Australia accountability question;
2. the agent querying the True Oath Context MCP endpoint;
3. retrieved Sanity entries and their source links;
4. a comparison of supporting and conflicting evidence; and
5. a cautious answer that distinguishes fact, assessment, uncertainty, and missing data.

The Knowledge Base build is now complete. The remaining transcript work is editorial: capture and curate the successful MCP run, then check it for API tokens, private URLs, and other secrets before making it public.

<!-- Add the public DEV Agent Session link here after the final read-only run is complete. -->

<!-- Add a cover image or final walkthrough video before publishing. -->

<!-- Team Submissions: credit teammates by listing their DEV usernames here if applicable. -->

<!-- Thanks for participating! -->
