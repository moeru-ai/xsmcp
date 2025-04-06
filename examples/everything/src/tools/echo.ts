import { defineTool } from '@xsmcp/server-shared'
import { description, object, pipe, string } from 'valibot'

export const echo = defineTool({
  description: 'Echoes back the input',
  execute: ({ message }) => [{ text: `Echo: ${message}`, type: 'text' }],
  name: 'echo',
  parameters: object({
    message: pipe(
      string(),
      description('Message to echo'),
    ),
  }),
})
