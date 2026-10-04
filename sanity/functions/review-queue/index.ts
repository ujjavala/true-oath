import {createClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'

type ChangedDocument = {
  _id?: string
  _type?: string
  title?: string
  source?: unknown
  relatedPromise?: unknown
  promise?: unknown
  status?: string
  officialFinding?: boolean
}

const rules = [
  {type: 'evidence', test: (doc: ChangedDocument) => !doc.source, kind: 'missing-source', severity: 'critical', label: 'Evidence has no source reference', action: 'Attach the source record before using this evidence in a promise assessment.'},
  {type: 'evidence', test: (doc: ChangedDocument) => !doc.relatedPromise, kind: 'broken-reference', severity: 'warning', label: 'Evidence has no related promise', action: 'Link this evidence to the promise it measures, or explain why it is context only.'},
  {type: 'milestone', test: (doc: ChangedDocument) => !doc.source, kind: 'missing-source', severity: 'warning', label: 'Milestone has no source reference', action: 'Attach the announcement, budget, legislation, or official report supporting this milestone.'},
  {type: 'indicator', test: (doc: ChangedDocument) => !doc.source, kind: 'missing-source', severity: 'warning', label: 'Outcome indicator has no source reference', action: 'Attach the dataset or statistical release supporting this value.'},
  {type: 'assessment', test: (doc: ChangedDocument) => !doc.source, kind: 'missing-source', severity: 'critical', label: 'Assessment has no source reference', action: 'Attach the published assessment or official record behind this verdict.'},
  {type: 'integrityEvent', test: (doc: ChangedDocument) => doc.officialFinding === true && ['Allegation', 'Under investigation', 'Unresolved'].includes(doc.status || ''), kind: 'integrity-review', severity: 'critical', label: 'Integrity finding needs status review', action: 'Confirm the evidence status. Keep allegations and unresolved reporting separate from official findings.'},
]

export const handler = documentEventHandler<ChangedDocument>(async ({context, event}) => {
  const document = event.data
  if (!document?._id || !document._type || document._type === 'reviewTask') return
  const rule = rules.find((candidate) => candidate.type === document._type && candidate.test(document))
  if (!rule) return

  const client = createClient({apiVersion: '2025-05-01', ...context.clientOptions})
  const fingerprint = `${rule.kind}:${document._id}`
  const existing = await client.fetch<string | null>(
    '*[_type == "reviewTask" && fingerprint == $fingerprint && status in ["open", "in-review"]][0]._id',
    {fingerprint},
  )
  if (existing) return

  await client.create({
    _type: 'reviewTask',
    title: `${rule.label}: ${document.title || document._id}`,
    kind: rule.kind,
    severity: rule.severity,
    status: 'open',
    summary: `The ${document._type} ${document._id} changed in a way that needs human review. This task does not alter the promise status or publish a verdict.`,
    suggestedAction: rule.action,
    document: {_ref: document._id, _type: 'reference'},
    fingerprint,
    detectedBy: 'Sanity Function',
    detectedAt: new Date().toISOString(),
  })
})
