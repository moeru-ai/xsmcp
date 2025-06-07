import type {
  CallToolResult,
  ClientCapabilities,
  GetPromptResult,
  Implementation,
  InitializeResult,
  JSONRPCNotification,
  JSONRPCRequest,
  ListPromptsResult,
  ListResourcesResult,
  ListResourceTemplatesResult,
  ListToolsResult,
  ReadResourceResult,
  ServerCapabilities,
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

  // TODO: params.cursor
  public async listPrompts(): Promise<ListPromptsResult> {
    return this.transport.request<ListPromptsResult>(this.request('prompts/list'))
  }

  // TODO: params.cursor
  public async listResources(): Promise<ListResourcesResult> {
    return this.transport.request<ListResourcesResult>(this.request('resources/list'))
  }

  // TODO: params.cursor
  public async listResourceTemplates(): Promise<ListResourceTemplatesResult> {
    return this.transport.request<ListResourceTemplatesResult>(this.request('resources/templates/list'))
  }

  // TODO: params.cursor
  public async listTools(): Promise<ListToolsResult> {
    return this.transport.request<ListToolsResult>(this.request('tools/list'))
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
