import {defineType, defineField} from 'sanity'

const sourceField = defineField({name: 'source', title: 'Source', type: 'reference', to: [{type: 'source'}], validation: (rule) => rule.required()})

export const schemaTypes = [
  defineType({
    name: 'government', title: 'Government', type: 'document',
    fields: [
      defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'jurisdiction', title: 'Jurisdiction', type: 'string', initialValue: 'Australia'}),
      defineField({name: 'partyOrCoalition', title: 'Party or coalition', type: 'string'}),
      defineField({name: 'startDate', title: 'Start date', type: 'date'}),
      defineField({name: 'endDate', title: 'End date', type: 'date'}),
    ],
    preview: {select: {title: 'name', subtitle: 'partyOrCoalition'}},
  }),
  defineType({
    name: 'manifesto', title: 'Manifesto', type: 'document',
    fields: [
      defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'party', title: 'Party', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'electionDate', title: 'Election date', type: 'date'}),
      defineField({name: 'jurisdiction', title: 'Jurisdiction', type: 'string', initialValue: 'Australia'}),
      defineField({name: 'documentUrl', title: 'Document URL', type: 'url'}),
      defineField({name: 'source', title: 'Source', type: 'reference', to: [{type: 'source'}]}),
    ],
    preview: {select: {title: 'title', subtitle: 'party'}},
  }),
  defineType({
    name: 'promise', title: 'Promise', type: 'document',
    fields: [
      defineField({name: 'title', title: 'Promise', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'summary', title: 'Plain-language summary', type: 'text', rows: 3}),
      defineField({name: 'party', title: 'Promising party', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'election', title: 'Election', type: 'string'}),
      defineField({name: 'category', title: 'Category', type: 'string', options: {list: ['Cost of living', 'Climate', 'Health', 'Housing', 'Migration', 'Integrity', 'National security', 'Other']}}),
      defineField({name: 'status', title: 'Current status', type: 'string', options: {list: ['Kept', 'Partially kept', 'In progress', 'Not started', 'Broken', 'Reversed', 'Unverifiable']}, initialValue: 'Unverifiable'}),
      defineField({name: 'confidence', title: 'Confidence', type: 'number', validation: (rule) => rule.min(0).max(1)}),
      defineField({name: 'deadline', title: 'Promised deadline', type: 'date'}),
      defineField({name: 'manifesto', title: 'Manifesto', type: 'reference', to: [{type: 'manifesto'}]}),
      defineField({name: 'evidence', title: 'Evidence', type: 'array', of: [{type: 'reference', to: [{type: 'evidence'}]}]}),
    ],
    preview: {select: {title: 'title', subtitle: 'status'}},
  }),
  defineType({
    name: 'source', title: 'Source', type: 'document',
    fields: [
      defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'publisher', title: 'Publisher', type: 'string'}),
      defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
      defineField({name: 'publishedAt', title: 'Published at', type: 'date'}),
      defineField({name: 'sourceType', title: 'Source type', type: 'string', options: {list: ['Manifesto', 'Budget', 'Legislation', 'Parliamentary record', 'Official report', 'Independent assessment', 'Dataset']}}),
      defineField({name: 'notes', title: 'Notes', type: 'text', rows: 3}),
    ],
    preview: {select: {title: 'title', subtitle: 'publisher'}},
  }),
  defineType({
    name: 'evidence', title: 'Evidence', type: 'document',
    fields: [
      defineField({name: 'title', title: 'Evidence title', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'finding', title: 'Finding', type: 'text', rows: 4, validation: (rule) => rule.required()}),
      defineField({name: 'observedAt', title: 'Observed at', type: 'date'}),
      defineField({name: 'effect', title: 'Effect on promise', type: 'string', options: {list: ['Supports', 'Partially supports', 'Contradicts', 'Neutral']}, initialValue: 'Neutral'}),
      sourceField,
      defineField({name: 'relatedPromise', title: 'Related promise', type: 'reference', to: [{type: 'promise'}]}),
    ],
    preview: {select: {title: 'title', subtitle: 'effect'}},
  }),
]
