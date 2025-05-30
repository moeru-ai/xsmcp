import type { AudioPart, ImagePart, TextPart, Tool as XSAITool } from '@xsai/shared-chat'
import type { Client } from '@xsmcp/client-shared'
import type { CallToolResult } from '@xsmcp/shared'

import { rawTool } from '@xsai/tool'

const toXSAIContent = (contents: CallToolResult['content']): (AudioPart | ImagePart | TextPart)[] =>
  // eslint-disable-next-line array-callback-return
  contents.map((content) => {
    switch (content.type) {
      case 'audio':
        return {
          input_audio: {
            data: content.data,
            format: content.mimeType === 'audio/wav'
              ? 'wav'
              // TODO: fallback
              : 'mp3',
          },
          type: 'input_audio',
        } satisfies AudioPart
      case 'image':
        return {
          image_url: { url: content.data },
          type: 'image_url',
        } satisfies ImagePart
      case 'resource':
        return {
          text: ('text' in content.resource
            ? content.resource.text
            // TODO: fallback
            : content.resource.blob
          ),
          type: 'text',
        } satisfies TextPart
      case 'text':
        return {
          text: content.text,
          type: 'text',
        } satisfies TextPart
    }
  })

export const getTools = async (client: Client): Promise<XSAITool[]> =>
  client
    .listTools()
    .then(({ tools }) => tools.map(tool => rawTool({
      description: tool.description,
      execute: async params => client.callTool(tool.name, params as Record<string, unknown>)
        // eslint-disable-next-line sonarjs/no-nested-functions
        .then(result => toXSAIContent(result.content)),
      name: tool.name,
      parameters: tool.inputSchema,
    })))
