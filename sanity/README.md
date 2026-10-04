# Sanity Clean Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)
# Review automation

The Studio includes a Sanity-native review workflow. `Review queue` in the
structure shows unresolved `reviewTask` documents. The `review-queue-on-content-change`
Function creates a task when evidence, milestones, indicators, assessments, or
integrity events lose source links or need an integrity-status check. It does
not change promise verdicts or publish conclusions.

Build the Function archive locally with `npm run functions:build`. Preview the
Blueprint with `npm run blueprints:plan`, then deploy only after checking the
target Stack and resource diff. Deploying the Blueprint creates a narrowly scoped
project robot token for the Function; review that permission in Sanity before
deployment.

Agent Actions are available as a draft-only reviewer assist:

```sh
SANITY_SCHEMA_ID=<schema-id> SANITY_TOKEN=<write-token> \
  node scripts/draft-review-agent-action.mjs <review-task-id>
```

The command writes only a draft `reviewerNotes` field. It never publishes a
review task, changes severity/status, or decides whether a political promise was
kept.
