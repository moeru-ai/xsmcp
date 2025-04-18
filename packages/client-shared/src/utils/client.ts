import type {
  CallToolResult,
  ClientCapabilities,
  GetPromptResult,
  Implementation,
  InitializeResult,
  JSONRPCNotification,
  JSONRPCRequest,
  ListPromptsResult,
  ListToolsResult,
  ServerCapabilities,
} from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

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
    const res = await this.transport.request(this.request('tools/call', {
      arguments: args,
      name,
    }))

    // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
    return res[0].result as CallToolResult
  }

  public async close() {
    return this.transport.close?.()
  }

  public getInstructions() {
    return this.serverInstructions
  }

  public async getPrompt(name: string, args: Record<string, unknown> = {}): Promise<GetPromptResult> {
    const res = await this.transport.request(this.request('prompts/get', {
      arguments: args,
      name,
    }))

    // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
    return res[0].result as GetPromptResult
  }

  public getServerCapabilities() {
    return this.serverCapabilities
  }

  public getServerVersion() {
    return this.serverInfo
  }

  public async initialize() {
    const res = await this.transport.request(this.request('initialize', {
      capabilities: this.clientCapabilities,
      clientInfo: this.clientInfo,
      protocolVersion: LATEST_PROTOCOL_VERSION,
    }))

    const result = res[0].result as InitializeResult

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
    const res = await this.transport.request(this.request('prompts/list'))
    // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
    return res[0].result as ListPromptsResult
  }

  // TODO: params.cursor
  public async listTools(): Promise<ListToolsResult> {
    const res = await this.transport.request(this.request('tools/list'))
    // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
    return res[0].result as ListToolsResult
  }

  private notification(method: string, params?: JSONRPCNotification['params']): JSONRPCNotification {
    return {
      jsonrpc: '2.0',
      method,
      params,
    }
  }

  private request(method: string, params?: JSONRPCRequest['params']): JSONRPCRequest {
    return {
      id: crypto.randomUUID(),
      jsonrpc: '2.0',
      method,
      params,
    }
  }
}

export const createClient = (options: CreateClientOptions) => new Client(options)
