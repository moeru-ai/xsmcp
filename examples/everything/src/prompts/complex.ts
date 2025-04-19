import { definePrompt } from '@xsmcp/server-shared'
import { description, object, optional, pipe, string } from 'valibot'

import { MCP_TINY_IMAGE } from '../assets/mcp-tiny-image'

export const complex = definePrompt({
  description: 'A prompt with arguments',
  execute: ({ style, temperature }) => [
    {
      content: {
        text: `This is a complex prompt with arguments: temperature=${temperature}, style=${style}`,
        type: 'text',
      },
      role: 'user',
    },
    {
      content: {
        text: 'I understand. You\'ve provided a complex prompt with temperature and style arguments. How would you like me to proceed?',
        type: 'text',
      },
      role: 'assistant',
    },
    {
      content: {
        data: MCP_TINY_IMAGE,
        mimeType: 'image/png',
        type: 'image',
      },
      role: 'user',
    },
  ],
  name: 'complex_prompt',
  parameters: object({
    style: pipe(
      optional(string()),
      description('Output style'),
    ),
    temperature: pipe(
      string(),
      description('Temperature setting'),
    ),
  }),
})
