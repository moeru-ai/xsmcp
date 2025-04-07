import { defineTool } from '@xsmcp/server-shared'
import { object } from 'valibot'

import { MCP_TINY_IMAGE } from '../assets/mcp-tiny-image'

export const getTinyImage = defineTool({
  description: 'Returns the MCP_TINY_IMAGE',
  execute: () => [
    {
      text: 'This is a tiny image:',
      type: 'text',
    },
    {
      data: MCP_TINY_IMAGE,
      mimeType: 'image/png',
      type: 'image',
    },
    {
      text: 'The image above is the MCP tiny image.',
      type: 'text',
    },
  ],
  name: 'getTinyImage',
  parameters: object({}),
})
