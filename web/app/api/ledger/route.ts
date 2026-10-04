import {NextResponse} from "next/server";

// The organization ID is not a Content Lake project ID. Normalize the common
// dashboard copy/paste mistake so the public UI still reaches True Oath data.
const configuredProjectId = process.env.SANITY_PROJECT_ID ?? "wak4l160";
const projectId = configuredProjectId === "oqf9m6vy6" ? "wak4l160" : configuredProjectId;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2025-08-15";

const query = `{
  "promises": *[_type == "promise"] | order(_createdAt asc) {
    _id,
    title,
    party,
    category,
    status,
    confidence,
    summary,
    "source": coalesce(manifesto->party, government->name, "Sanity record"),
    "evidenceCount": count(*[_type == "evidence" && relatedPromise._ref == ^._id]),
    "reviewed": coalesce(assessments[0]->publishedAt, _updatedAt),
    "evidence": *[_type == "evidence" && relatedPromise._ref == ^._id] {
      title, finding, observedAt, effect,
      "sourceTitle": source->title, "sourcePublisher": source->publisher, "sourceUrl": source->url
    },
    "milestones": *[_type == "milestone" && promise._ref == ^._id] {title, description, date, status},
    "indicators": *[_type == "indicator" && promise._ref == ^._id] {title, definition, value, unit, period, direction},
    "assessments": *[_type == "assessment" && promise._ref == ^._id] {title, verdict, reasoning, assessor, publishedAt},
    "claims": *[_type == "claim" && promise._ref == ^._id] {statement, claimant, claimType, confidence},
    "integrityEvents": *[_type == "integrityEvent" && relatedPromise._ref == ^._id] {title, summary, status, mechanism, impact, officialFinding}
  },
  "stats": {
    "source": count(*[_type == "source"]),
    "promise": count(*[_type == "promise"]),
    "evidence": count(*[_type == "evidence"]),
    "milestone": count(*[_type == "milestone"]),
    "indicator": count(*[_type == "indicator"]),
    "assessment": count(*[_type == "assessment"]),
    "claim": count(*[_type == "claim"]),
    "integrityEvent": count(*[_type == "integrityEvent"]),
    "manifesto": count(*[_type == "manifesto"]),
    "government": count(*[_type == "government"])
  }
}`;

export async function GET() {
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  try {
    const response = await fetch(url, {next: {revalidate: 60}});
    const body = await response.json();
    if (!response.ok) return NextResponse.json({error: body?.message ?? "Sanity query failed"}, {status: response.status});
    return NextResponse.json(body.result);
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : "Sanity query failed"}, {status: 502});
  }
}
