import type {
  CallToolResult,
  ClientCapabilities,
  Cursor,
  GetPromptResult,
  Implementation,
  InitializeResult,
  JSONRPCNotification,
  JSONRPCRequest,
  ListPromptsRequest,
  ListPromptsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ListResourceTemplatesRequest,
  ListResourceTemplatesResult,
  ListToolsRequest,
  ListToolsResult,
  Prompt,
  ReadResourceResult,
  Resource,
  ResourceTemplate,
  ServerCapabilities,
  Tool,
} from '@xsmcp/shared'

import { JSONRPC_VERSION, LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { Transport } from '../types/transport'

export interface CreateClientOptions {
  capabilities?: ClientCapabilities
  /** @default true */
  initialize?: boolean
  name: string
  transport: Transport
  version: string
}

export class Client {
  private clientCapabilities: ClientCapabilities = {}
  private clientInfo: Implementation
  private serverCapabilities?: ServerCapabilities
  private serverInfo?: Implementation
  private serverInstructions?: string
  private transport: Transport

  constructor(options: CreateClientOptions) {
    this.clientInfo = {
      name: options.name,
      version: options.version,
    }
    this.transport = options.transport

    if (options.capabilities)
      this.clientCapabilities = options.capabilities

    if (options.initialize !== false)
      // eslint-disable-next-line sonarjs/no-async-constructor
      void this.initialize()
  }

  public async callTool(name: string, args: Record<string, unknown> = {}): Promise<CallToolResult> {
    return this.transport.request<CallToolResult>(this.request('tools/call', {
      arguments: args,
      name,
    }))
  }

  public async close() {
    return this.transport.close?.()
  }

  public getInstructions() {
    return this.serverInstructions
  }

  public async getPrompt(name: string, args: Record<string, unknown> = {}): Promise<GetPromptResult> {
    return this.transport.request<GetPromptResult>(this.request('prompts/get', {
      arguments: args,
      name,
    }))
  }

  public getServerCapabilities() {
    return this.serverCapabilities
  }

  public getServerVersion() {
    return this.serverInfo
  }

  public async initialize() {
    const result = await this.transport.request<InitializeResult>(this.request('initialize', {
      capabilities: this.clientCapabilities,
      clientInfo: this.clientInfo,
      protocolVersion: LATEST_PROTOCOL_VERSION,
    }))

    // https://github.com/modelcontextprotocol/typescript-sdk/issues/364
    // if (result.protocolVersion !== LATEST_PROTOCOL_VERSION)
    //   throw new Error(`Server's protocol version is not supported: ${result.protocolVersion}.`)

    this.serverCapabilities = result.capabilities
    this.serverInfo = result.serverInfo
    this.serverInstructions = result.instructions

    await this.transport.notification(this.notification('notifications/initialized'))
  }

  public async listPrompts(params?: ListPromptsRequest['params']): Promise<Prompt[]> {
    let cursor: Cursor | undefined = params?.cursor

    const { nextCursor, prompts } = await this.transport.request<ListPromptsResult>(this.request('prompts/list', { cursor }))
    cursor = nextCursor

    while (cursor == null) {
      const result = await this.transport.request<ListPromptsResult>(this.request('prompts/list', { cursor }))
      prompts.push(...result.prompts)
      cursor = result.nextCursor
    }

    return prompts
  }

  public async listResources(params?: ListResourcesRequest['params']): Promise<Resource[]> {
    let cursor: Cursor | undefined = params?.cursor

    const { nextCursor, resources } = await this.transport.request<ListResourcesResult>(this.request('resources/list', { cursor }))
    cursor = nextCursor

    while (cursor == null) {
      const result = await this.transport.request<ListResourcesResult>(this.request('resources/list', { cursor }))
      resources.push(...result.resources)
      cursor = result.nextCursor
    }

    return resources
  }

  public async listResourceTemplates(params?: ListResourceTemplatesRequest['params']): Promise<ResourceTemplate[]> {
    let cursor: Cursor | undefined = params?.cursor

    const { nextCursor, resourceTemplates } = await this.transport.request<ListResourceTemplatesResult>(this.request('resources/templates/list', { cursor }))
    cursor = nextCursor

    while (cursor == null) {
      const result = await this.transport.request<ListResourceTemplatesResult>(this.request('resources/templates/list', { cursor }))
      resourceTemplates.push(...result.resourceTemplates)
      cursor = result.nextCursor
    }

    return resourceTemplates
  }

  public async listTools(params?: ListToolsRequest['params']): Promise<Tool[]> {
    let cursor: Cursor | undefined = params?.cursor

    const { nextCursor, tools } = await this.transport.request<ListToolsResult>(this.request('tools/list', { cursor }))
    cursor = nextCursor

    while (cursor == null) {
      const result = await this.transport.request<ListToolsResult>(this.request('tools/list', { cursor }))
      tools.push(...result.tools)
      cursor = result.nextCursor
    }

    return tools
  }

  public async readResource(uri: string): Promise<ReadResourceResult> {
    return this.transport.request<ReadResourceResult>(this.request('resources/read', { uri }))
  }

  private notification(method: string, params?: JSONRPCNotification['params']): JSONRPCNotification {
    return {
      jsonrpc: JSONRPC_VERSION,
      method,
      params,
    }
  }

  private request(method: string, params?: JSONRPCRequest['params']): JSONRPCRequest {
    return {
      id: crypto.randomUUID(),
      jsonrpc: JSONRPC_VERSION,
      method,
      params,
    }
  }
}

export const createClient = (options: CreateClientOptions) => new Client(options)
