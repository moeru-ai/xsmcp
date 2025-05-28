import type {
  CallToolRequest,
  CallToolResult,
  GetPromptRequest,
  GetPromptResult,
  InitializeRequest,
  InitializeResult,
  ListPromptsRequest,
  ListPromptsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ListResourceTemplatesRequest,
  ListResourceTemplatesResult,
  ListToolsRequest,
  ListToolsResult,
  ReadResourceRequest,
  ReadResourceResult,
  ResourceTemplate,
  ServerCapabilities,
} from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { PromptOptions } from './prompt'
import type { ResourceOptions } from './resource'
import type { ToolOptions } from './tool'

import { MethodNotFound } from './error'
import { listPrompt } from './prompt'
import { listResource } from './resource'
import { listTool } from './tool'

export interface CreateServerOptions {
  capabilities?: ServerCapabilities
  name: string
  prompts?: PromptOptions[]
  resources?: ResourceOptions[]
  resourceTemplates?: ResourceTemplate[]
  tools?: ToolOptions[]
  version: string
}

export class Server {
  private capabilities: ServerCapabilities = {}
  private prompts: PromptOptions[] = []
  private resources: ResourceOptions[] = []
  private resourceTemplates: ResourceTemplate[] = []
  private serverInfo: InitializeResult['serverInfo']
  private tools: ToolOptions[] = []

  constructor(options: CreateServerOptions) {
    this.serverInfo = {
      name: options.name,
      version: options.version,
    }

    if (options.capabilities)
      this.capabilities = options.capabilities

    if (options.prompts)
      this.prompts.push(...options.prompts)

    if (options.resources)
      this.resources.push(...options.resources)

    if (options.resourceTemplates)
      this.resourceTemplates.push(...options.resourceTemplates)

    if (options.tools)
      this.tools.push(...options.tools)
  }

  public addPrompt(prompt: PromptOptions<any>) {
    this.prompts.push(prompt as PromptOptions)
    return this
  }

  public addResource(resource: ResourceOptions) {
    this.resources.push(resource)
    return this
  }

  public addResourceTemplate(resourceTemplate: ResourceTemplate) {
    this.resourceTemplates.push(resourceTemplate)
    return this
  }

  public addTool(tool: ToolOptions<any>) {
    this.tools.push(tool as ToolOptions)
    return this
  }

  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/tools/#calling-tools} */
  public async callTool(params: CallToolRequest['params']): Promise<CallToolResult> {
    const tool = this.tools.find(tool => tool.name === params.name)

    // TODO: JSONRPCError
    if (!tool)
      throw new Error(`Tool not found: ${params.name}`)

    try {
      const content = await tool.execute(params.arguments)

      return {
        content,
        isError: false,
      }
    }
    catch {
      return {
        content: [],
        isError: true,
      }
    }
  }

  public async getPrompt(params: GetPromptRequest['params']): Promise<GetPromptResult> {
    const prompt = this.prompts.find(prompt => prompt.name === params.name)

    if (!prompt)
      throw new Error(`Prompt not found: ${params.name}`)

    return {
      description: prompt.description,
      messages: await prompt.execute(params.arguments),
    }
  }

  public async ping() {
    return {}
  }

  public async handleRequest(method: string, params: unknown) {
    switch (method) {
      case 'initialize':
        return this.initialize(params as InitializeRequest['params'])
      case 'notifications/initialized':
        return
      case 'ping':
        return this.ping()
      case 'prompts/get':
        return this.getPrompt(params as GetPromptRequest['params'])
      case 'prompts/list':
        return this.listPrompts(params as ListPromptsRequest['params'])
      case 'resources/list':
        return this.listResources(params as ListResourcesRequest['params'])
      case 'resources/read':
        return this.readResource(params as ReadResourceRequest['params'])
      case 'resources/templates/list':
        return this.listResourceTemplates(params as ListResourceTemplatesRequest['params'])
      case 'tools/call':
        return this.callTool(params as CallToolRequest['params'])
      case 'tools/list':
        return this.listTools(params as ListToolsRequest['params'])
      default:
        throw MethodNotFound()
    }
  }

  public initialize(_params: InitializeRequest['params']): InitializeResult {
    return {
      capabilities: {
        ...this.capabilities,
        ...(this.prompts.length > 0 ? { prompts: {} } : {}),
        ...(this.resources.length > 0 ? { resources: {} } : {}),
        ...(this.tools.length > 0 ? { tools: {} } : {}),
      },
      protocolVersion: LATEST_PROTOCOL_VERSION,
      serverInfo: this.serverInfo,
    }
  }

  // TODO: support params (cursor)
  /** @see {@link https://modelcontextprotocol.io/specification/2025-03-26/server/prompts#listing-prompts} */
  public async listPrompts(_params?: ListPromptsRequest['params']): Promise<ListPromptsResult> {
    return {
      prompts: await Promise.all(this.prompts.map(async promptOptions => listPrompt(promptOptions))),
    }
  }

  // TODO: support params (cursor)
  /** @see {@link https://modelcontextprotocol.io/specification/2025-03-26/server/resources#listing-resources} */
  public async listResources(_params: ListResourcesRequest['params']): Promise<ListResourcesResult> {
    return {
      resources: this.resources.map(resource => listResource(resource)),
    }
  }

  // TODO: support params (cursor)
  /** @see {@link https://modelcontextprotocol.io/specification/2025-03-26/server/resources#resource-templates} */
  public async listResourceTemplates(_params?: ListResourceTemplatesRequest['params']): Promise<ListResourceTemplatesResult> {
    return {
      resourceTemplates: this.resourceTemplates,
    }
  }

  // TODO: support params (cursor)
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/tools/#listing-tools} */
  public async listTools(_params?: ListToolsRequest['params']): Promise<ListToolsResult> {
    return {
      tools: await Promise.all(this.tools.map(async toolOptions => listTool(toolOptions))),
    }
  }

  public async readResource(params: ReadResourceRequest['params']): Promise<ReadResourceResult> {
    const resource = this.resources.find(resource => resource.uri === params.uri)

    if (!resource)
      throw new Error(`Resource not found: ${params.uri}`)

    return { contents: await resource.load() }
  }
}

export const createServer = (options: CreateServerOptions) => new Server(options)
