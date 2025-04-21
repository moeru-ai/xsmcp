import { definePrompt } from '@xsmcp/server-shared'
import { description, object, pipe, string } from 'valibot'

import { resources } from '../resources'

export const resource = definePrompt({
  description: 'A prompt that includes an embedded resource reference',
  execute: async ({ resourceId }) => [
    {
      content: {
        text: `This prompt includes Resource ${resourceId}. Please analyze the following resource:`,
        type: 'text',
      },
      role: 'user',
    },
    {
      content: {
        resource: (await resources[Number.parseInt(resourceId) - 1].load())[0],
        type: 'resource',
      },
      role: 'user',
    },
  ],
  name: 'resource_prompt',
  parameters: object({
    resourceId: pipe(
      string(),
      description('Resource ID to include (1-100)'),
    ),
  }),
})
