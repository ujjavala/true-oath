import {defineBlueprint, defineDocumentFunction, defineRobotToken} from '@sanity/blueprints'

export default defineBlueprint({
  projectId: 'wak4l160',
  resources: [
    defineRobotToken({
      name: 'review-queue-bot',
      label: 'True Oath review queue bot',
      memberships: [{resourceType: 'project', resourceId: 'wak4l160', roleNames: ['editor']}],
    }),
    defineDocumentFunction({
      name: 'review-queue-on-content-change',
      displayName: 'Review queue on content change',
      src: 'functions/review-queue',
      robotToken: '$.resources.review-queue-bot',
      event: {
        on: ['create', 'update'],
        filter: "_type in ['evidence', 'milestone', 'indicator', 'assessment', 'integrityEvent'] && !(_id in path('drafts.**'))",
        projection: '{_id, _type, title, source, relatedPromise, promise, status, officialFinding}',
      },
    }),
  ],
})
