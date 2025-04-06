import type { ToolOptions } from '@xsmcp/server-shared'

import { description, object, pipe, string } from 'valibot'

const echoSchema = object({
  message: pipe(
    string(),
    description('Message to echo'),
  ),
})

export const echo = {
  description: 'Echoes back the input',
  execute: ({ message }) => [{ text: `Echo: ${message}`, type: 'text' }],
  name: 'echo',
  parameters: echoSchema,
} satisfies ToolOptions<typeof echoSchema>
