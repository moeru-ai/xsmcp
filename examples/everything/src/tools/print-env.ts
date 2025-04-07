import { defineTool } from '@xsmcp/server-shared'
import { env } from 'node:process'
import { object } from 'valibot'

export const printEnv = defineTool({
  description: 'Prints all environment variables, helpful for debugging MCP server configuration',
  execute: () => [
    {
      text: JSON.stringify(env, null, 2),
      type: 'text',
    },
  ],
  name: 'printEnv',
  parameters: object({}),
})
