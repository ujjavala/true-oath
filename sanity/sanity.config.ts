import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const structure = (S: any) => S.list().title('Content').items([
  S.listItem().title('Review queue').child(
    S.documentTypeList('reviewTask').title('Open review tasks').filter("status in ['open', 'in-review']").defaultOrdering([
      {field: 'severity', direction: 'asc'},
      {field: 'detectedAt', direction: 'desc'},
    ]),
  ),
  S.divider(),
  ...S.documentTypeListItems().filter((item: any) => item.getId() !== 'reviewTask'),
])

export default defineConfig({
  name: 'default',
  title: 'True Oath',

  projectId: 'wak4l160',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
