import type { AudioContent, EmbeddedResource, ImageContent, TextContent } from '@xsmcp/shared'

import { defineTool } from '@xsmcp/server-shared'
import { boolean, description, literal, object, optional, pipe, union } from 'valibot'

import { MCP_TINY_IMAGE } from '../assets/mcp-tiny-image'

export const annotatedMessage = defineTool({
  description: 'Demonstrates how annotations can be used to provide metadata about content',
  execute: ({ includeImage, messageType }) => {
    const content: (AudioContent | EmbeddedResource | ImageContent | TextContent)[] = []

    if (messageType === 'error') {
      content.push({
        annotations: {
          audience: ['user', 'assistant'], // Both need to know about errors
          priority: 1.0, // Errors are highest priority
        },
        text: 'Error: Operation failed',
        type: 'text',
      })
    }
    else if (messageType === 'success') {
      content.push({
        annotations: {
          audience: ['user'], // Success mainly for user consumption
          priority: 0.7, // Success messages are important but not critical
        },
        text: 'Operation completed successfully',
        type: 'text',
      })
    }
    else if (messageType === 'debug') {
      content.push({
        annotations: {
          audience: ['assistant'], // Technical details for assistant
          priority: 0.3, // Debug info is low priority
        },
        text: 'Debug: Cache hit ratio 0.95, latency 150ms',
        type: 'text',
      })
    }

    // Optional image with its own annotations
    if (includeImage) {
      content.push({
        annotations: {
          audience: ['user'], // Images primarily for user visualization
          priority: 0.5,
        },
        data: MCP_TINY_IMAGE,
        mimeType: 'image/png',
        type: 'image',
      })
    }

    return content
  },
  name: 'annotatedMessage',
  parameters: object({
    includeImage: pipe(
      optional(boolean()),
      description('Whether to include an example image'),
    ),
    messageType: pipe(
      union([
        literal('error'),
        literal('success'),
        literal('debug'),
      ]),
      description('Type of message to demonstrate different annotation patterns'),
    ),
  }),
})
