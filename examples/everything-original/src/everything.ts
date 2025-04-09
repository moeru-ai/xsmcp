import type {
  CreateMessageRequest,
  LoggingLevel,
  Resource,
  Tool,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  CompleteRequestSchema,
  CreateMessageResultSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  SetLevelRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { Buffer } from 'node:buffer'
import { env } from 'node:process'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const MCP_TINY_IMAGE
  = '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'

type ToolInput = z.infer<typeof ToolSchema.shape.inputSchema>

/* Input schemas for tools implemented in this server */
const EchoSchema = z.object({
  message: z.string().describe('Message to echo'),
})

const AddSchema = z.object({
  a: z.number().describe('First number'),
  b: z.number().describe('Second number'),
})

const LongRunningOperationSchema = z.object({
  duration: z
    .number()
    .default(10)
    .describe('Duration of the operation in seconds'),
  steps: z.number().default(5).describe('Number of steps in the operation'),
})

const PrintEnvSchema = z.object({})

const SampleLLMSchema = z.object({
  maxTokens: z
    .number()
    .default(100)
    .describe('Maximum number of tokens to generate'),
  prompt: z.string().describe('The prompt to send to the LLM'),
})

// Example completion values
const EXAMPLE_COMPLETIONS = {
  resourceId: ['1', '2', '3', '4', '5'],
  style: ['casual', 'formal', 'technical', 'friendly'],
  temperature: ['0', '0.5', '0.7', '1.0'],
}

const GetTinyImageSchema = z.object({})

const AnnotatedMessageSchema = z.object({
  includeImage: z
    .boolean()
    .default(false)
    .describe('Whether to include an example image'),
  messageType: z
    .enum(['error', 'success', 'debug'])
    .describe('Type of message to demonstrate different annotation patterns'),
})

const GetResourceReferenceSchema = z.object({
  resourceId: z
    .number()
    .min(1)
    .max(100)
    .describe('ID of the resource to reference (1-100)'),
})

enum PromptName {
  COMPLEX = 'complex_prompt',
  RESOURCE = 'resource_prompt',
  SIMPLE = 'simple_prompt',
}

enum ToolName {
  ADD = 'add',
  ANNOTATED_MESSAGE = 'annotatedMessage',
  ECHO = 'echo',
  GET_RESOURCE_REFERENCE = 'getResourceReference',
  GET_TINY_IMAGE = 'getTinyImage',
  LONG_RUNNING_OPERATION = 'longRunningOperation',
  PRINT_ENV = 'printEnv',
  SAMPLE_LLM = 'sampleLLM',
}

export const createServer = () => {
  const server = new Server(
    {
      name: 'example-servers/everything',
      version: '1.0.0',
    },
    {
      capabilities: {
        logging: {},
        prompts: {},
        resources: { subscribe: true },
        tools: {},
      },
    },
  )

  const subscriptions: Set<string> = new Set()
  // eslint-disable-next-line @masknet/no-timer
  const subsUpdateInterval = setInterval(() => {
    for (const uri of subscriptions) {
      void server.notification({
        method: 'notifications/resources/updated',
        params: { uri },
      })
    }
  }, 5000)

  let logLevel: LoggingLevel = 'debug'
  const messages = [
    { data: 'Debug-level message', level: 'debug' },
    { data: 'Info-level message', level: 'info' },
    { data: 'Notice-level message', level: 'notice' },
    { data: 'Warning-level message', level: 'warning' },
    { data: 'Error-level message', level: 'error' },
    { data: 'Critical-level message', level: 'critical' },
    { data: 'Alert level-message', level: 'alert' },
    { data: 'Emergency-level message', level: 'emergency' },
  ]

  const isMessageIgnored = (level: LoggingLevel): boolean => {
    const currentLevel = messages.findIndex(msg => logLevel === msg.level)
    const messageLevel = messages.findIndex(msg => level === msg.level)
    return messageLevel < currentLevel
  }

  // Set up update interval for random log messages
  // eslint-disable-next-line @masknet/no-timer
  const logsUpdateInterval = setInterval(() => {
    const message = {
      method: 'notifications/message',
      // eslint-disable-next-line sonarjs/pseudo-random
      params: messages[Math.floor(Math.random() * messages.length)],
    }
    if (!isMessageIgnored(message.params.level as LoggingLevel))
      void server.notification(message)
  }, 15000)

  // Helper method to request sampling from client
  const requestSampling = async (
    context: string,
    uri: string,
    maxTokens: number = 100,
  ) => {
    const request: CreateMessageRequest = {
      method: 'sampling/createMessage',
      params: {
        includeContext: 'thisServer',
        maxTokens,
        messages: [
          {
            content: {
              text: `Resource ${uri} context: ${context}`,
              type: 'text',
            },
            role: 'user',
          },
        ],
        systemPrompt: 'You are a helpful test server.',
        temperature: 0.7,
      },
    }

    return server.request(request, CreateMessageResultSchema)
  }

  const ALL_RESOURCES: Resource[] = Array.from({ length: 100 }, (_, i) => {
    const uri = `test://static/resource/${i + 1}`
    if (i % 2 === 0) {
      return {
        mimeType: 'text/plain',
        name: `Resource ${i + 1}`,
        text: `Resource ${i + 1}: This is a plaintext resource`,
        uri,
      }
    }
    else {
      const buffer = Buffer.from(`Resource ${i + 1}: This is a base64 blob`)
      return {
        blob: buffer.toString('base64'),
        mimeType: 'application/octet-stream',
        name: `Resource ${i + 1}`,
        uri,
      }
    }
  })

  const PAGE_SIZE = 10

  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const cursor = request.params?.cursor
    let startIndex = 0

    if (cursor != null) {
      const decodedCursor = Number.parseInt(Buffer.from(cursor, 'base64').toString('binary'), 10)
      if (!Number.isNaN(decodedCursor)) {
        startIndex = decodedCursor
      }
    }

    const endIndex = Math.min(startIndex + PAGE_SIZE, ALL_RESOURCES.length)
    const resources = ALL_RESOURCES.slice(startIndex, endIndex)

    let nextCursor: string | undefined
    if (endIndex < ALL_RESOURCES.length) {
      nextCursor = Buffer.from(endIndex.toString(), 'binary').toString('base64')
    }

    return {
      nextCursor,
      resources,
    }
  })

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: [
        {
          description: 'A static resource with a numeric ID',
          name: 'Static Resource',
          uriTemplate: 'test://static/resource/{id}',
        },
      ],
    }
  })

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri

    if (uri.startsWith('test://static/resource/')) {
      const index = Number.parseInt(uri.split('/').pop() ?? '', 10) - 1
      if (index >= 0 && index < ALL_RESOURCES.length) {
        const resource = ALL_RESOURCES[index]
        return {
          contents: [resource],
        }
      }
    }

    throw new Error(`Unknown resource: ${uri}`)
  })

  server.setRequestHandler(SubscribeRequestSchema, async (request) => {
    const { uri } = request.params
    subscriptions.add(uri)

    // Request sampling from client when someone subscribes
    await requestSampling('A new subscription was started', uri)
    return {}
  })

  server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
    subscriptions.delete(request.params.uri)
    return {}
  })

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          description: 'A prompt without arguments',
          name: PromptName.SIMPLE,
        },
        {
          arguments: [
            {
              description: 'Temperature setting',
              name: 'temperature',
              required: true,
            },
            {
              description: 'Output style',
              name: 'style',
              required: false,
            },
          ],
          description: 'A prompt with arguments',
          name: PromptName.COMPLEX,
        },
        {
          arguments: [
            {
              description: 'Resource ID to include (1-100)',
              name: 'resourceId',
              required: true,
            },
          ],
          description: 'A prompt that includes an embedded resource reference',
          name: PromptName.RESOURCE,
        },
      ],
    }
  })

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { arguments: args, name } = request.params

    if (name === PromptName.SIMPLE) {
      return {
        messages: [
          {
            content: {
              text: 'This is a simple prompt without arguments.',
              type: 'text',
            },
            role: 'user',
          },
        ],
      }
    }

    if (name === PromptName.COMPLEX) {
      return {
        messages: [
          {
            content: {
              text: `This is a complex prompt with arguments: temperature=${args?.temperature}, style=${args?.style}`,
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
      }
    }

    if (name === PromptName.RESOURCE) {
      const resourceId = Number.parseInt(args?.resourceId as string, 10)
      if (Number.isNaN(resourceId) || resourceId < 1 || resourceId > 100) {
        throw new Error(
          `Invalid resourceId: ${args?.resourceId}. Must be a number between 1 and 100.`,
        )
      }

      const resourceIndex = resourceId - 1
      const resource = ALL_RESOURCES[resourceIndex]

      return {
        messages: [
          {
            content: {
              text: `This prompt includes Resource ${resourceId}. Please analyze the following resource:`,
              type: 'text',
            },
            role: 'user',
          },
          {
            content: {
              resource,
              type: 'resource',
            },
            role: 'user',
          },
        ],
      }
    }

    throw new Error(`Unknown prompt: ${name}`)
  })

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      {
        description: 'Echoes back the input',
        inputSchema: zodToJsonSchema(EchoSchema) as ToolInput,
        name: ToolName.ECHO,
      },
      {
        description: 'Adds two numbers',
        inputSchema: zodToJsonSchema(AddSchema) as ToolInput,
        name: ToolName.ADD,
      },
      {
        description:
          'Prints all environment variables, helpful for debugging MCP server configuration',
        inputSchema: zodToJsonSchema(PrintEnvSchema) as ToolInput,
        name: ToolName.PRINT_ENV,
      },
      {
        description:
          'Demonstrates a long running operation with progress updates',
        inputSchema: zodToJsonSchema(LongRunningOperationSchema) as ToolInput,
        name: ToolName.LONG_RUNNING_OPERATION,
      },
      {
        description: 'Samples from an LLM using MCP\'s sampling feature',
        inputSchema: zodToJsonSchema(SampleLLMSchema) as ToolInput,
        name: ToolName.SAMPLE_LLM,
      },
      {
        description: 'Returns the MCP_TINY_IMAGE',
        inputSchema: zodToJsonSchema(GetTinyImageSchema) as ToolInput,
        name: ToolName.GET_TINY_IMAGE,
      },
      {
        description:
          'Demonstrates how annotations can be used to provide metadata about content',
        inputSchema: zodToJsonSchema(AnnotatedMessageSchema) as ToolInput,
        name: ToolName.ANNOTATED_MESSAGE,
      },
      {
        description:
          'Returns a resource reference that can be used by MCP clients',
        inputSchema: zodToJsonSchema(GetResourceReferenceSchema) as ToolInput,
        name: ToolName.GET_RESOURCE_REFERENCE,
      },
    ]

    return { tools }
  })

  // eslint-disable-next-line sonarjs/cognitive-complexity
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { arguments: args, name } = request.params

    if (name === ToolName.ECHO) {
      const validatedArgs = EchoSchema.parse(args)
      return {
        content: [{ text: `Echo: ${validatedArgs.message}`, type: 'text' }],
      }
    }

    if (name === ToolName.ADD) {
      const validatedArgs = AddSchema.parse(args)
      const sum = validatedArgs.a + validatedArgs.b
      return {
        content: [
          {
            text: `The sum of ${validatedArgs.a} and ${validatedArgs.b} is ${sum}.`,
            type: 'text',
          },
        ],
      }
    }

    if (name === ToolName.LONG_RUNNING_OPERATION) {
      const validatedArgs = LongRunningOperationSchema.parse(args)
      const { duration, steps } = validatedArgs
      const stepDuration = duration / steps
      const progressToken = request.params._meta?.progressToken

      for (let i = 1; i < steps + 1; i++) {
        await new Promise(resolve =>
          // eslint-disable-next-line @masknet/no-timer, @masknet/prefer-timer-id
          setTimeout(resolve, stepDuration * 1000),
        )

        if (progressToken !== undefined) {
          await server.notification({
            method: 'notifications/progress',
            params: {
              progress: i,
              progressToken,
              total: steps,
            },
          })
        }
      }

      return {
        content: [
          {
            text: `Long running operation completed. Duration: ${duration} seconds, Steps: ${steps}.`,
            type: 'text',
          },
        ],
      }
    }

    if (name === ToolName.PRINT_ENV) {
      return {
        content: [
          {
            text: JSON.stringify(env, null, 2),
            type: 'text',
          },
        ],
      }
    }

    if (name === ToolName.SAMPLE_LLM) {
      const validatedArgs = SampleLLMSchema.parse(args)
      const { maxTokens, prompt } = validatedArgs

      const result = await requestSampling(
        prompt,
        ToolName.SAMPLE_LLM,
        maxTokens,
      )
      return {
        content: [
          // eslint-disable-next-line ts/restrict-template-expressions
          { text: `LLM sampling result: ${result.content.text}`, type: 'text' },
        ],
      }
    }

    if (name === ToolName.GET_TINY_IMAGE) {
      GetTinyImageSchema.parse(args)
      return {
        content: [
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
      }
    }

    if (name === ToolName.GET_RESOURCE_REFERENCE) {
      const validatedArgs = GetResourceReferenceSchema.parse(args)
      const resourceId = validatedArgs.resourceId

      const resourceIndex = resourceId - 1
      if (resourceIndex < 0 || resourceIndex >= ALL_RESOURCES.length) {
        throw new Error(`Resource with ID ${resourceId} does not exist`)
      }

      const resource = ALL_RESOURCES[resourceIndex]

      return {
        content: [
          {
            text: `Returning resource reference for Resource ${resourceId}:`,
            type: 'text',
          },
          {
            resource,
            type: 'resource',
          },
          {
            text: `You can access this resource using the URI: ${resource.uri}`,
            type: 'text',
          },
        ],
      }
    }

    if (name === ToolName.ANNOTATED_MESSAGE) {
      const { includeImage, messageType } = AnnotatedMessageSchema.parse(args)

      const content = []

      // Main message with different priorities/audiences based on type
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

      return { content }
    }

    throw new Error(`Unknown tool: ${name}`)
  })

  server.setRequestHandler(CompleteRequestSchema, async (request) => {
    const { argument, ref } = request.params

    if (ref.type === 'ref/resource') {
      const resourceId = ref.uri.split('/').pop()
      if (resourceId == null)
        return { completion: { values: [] } }

      // Filter resource IDs that start with the input value
      const values = EXAMPLE_COMPLETIONS.resourceId.filter(id =>
        id.startsWith(argument.value),
      )
      return { completion: { hasMore: false, total: values.length, values } }
    }

    if (ref.type === 'ref/prompt') {
      // Handle completion for prompt arguments
      const completions
        = EXAMPLE_COMPLETIONS[argument.name as keyof typeof EXAMPLE_COMPLETIONS]
      if (completions.length === 0)
        return { completion: { values: [] } }

      const values = completions.filter(value =>
        value.startsWith(argument.value),
      )
      return { completion: { hasMore: false, total: values.length, values } }
    }

    throw new Error('Unknown reference type')
  })

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params
    logLevel = level

    // Demonstrate different log levels
    await server.notification({
      method: 'notifications/message',
      params: {
        data: `Logging level set to: ${logLevel}`,
        level: 'debug',
        logger: 'test-server',
      },
    })

    return {}
  })

  const cleanup = async () => {
    // eslint-disable-next-line @masknet/no-timer
    clearInterval(subsUpdateInterval)
    // eslint-disable-next-line @masknet/no-timer
    clearInterval(logsUpdateInterval)
  }

  return { cleanup, server }
}
