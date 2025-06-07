import type { Tool } from '@xsai/shared-chat'
import type { Client } from '@xsmcp/client-shared'

import { rawTool } from '@xsai/tool'

import { toXSAIContent } from './to-xsai-content'

export const getXSAITools = async (client: Client): Promise<Tool[]> =>
  client
    .listTools()
    .then(tools => tools.map(tool => rawTool({
      description: tool.description,
      execute: async params => client.callTool(tool.name, params as Record<string, unknown>)
        // eslint-disable-next-line sonarjs/no-nested-functions
        .then(result => toXSAIContent(result.content)),
      name: tool.name,
      parameters: tool.inputSchema,
    })))
