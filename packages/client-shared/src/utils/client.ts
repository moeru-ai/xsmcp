import type { CallToolResult, ClientCapabilities, Implementation, InitializeResult, JSONRPC_VERSION, JSONRPCNotification, JSONRPCRequest, RequestId, ServerCapabilities } from '@xsmcp/shared'

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

  public async callTool(name: string, args: Record<string, unknown> = {}) {
    const result = await this.transport.request(this.request('tools/call', {
      arguments: args,
      name,
    }))

    // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
    return result[0] as {
      id: RequestId
      jsonrpc: typeof JSONRPC_VERSION
      result: CallToolResult
    }
  }

  public async close() {
    return this.transport.close?.()
  }

  public getInstructions() {
    return this.serverInstructions
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

    if (result.protocolVersion !== LATEST_PROTOCOL_VERSION)
      throw new Error(`Server's protocol version is not supported: ${result.protocolVersion}.`)

    this.serverCapabilities = result.capabilities
    this.serverInfo = result.serverInfo
    this.serverInstructions = result.instructions

    await this.transport.notification(this.notification('notifications/initialized'))
  }

  public async listTools() {
    const result = await this.transport.request(this.request('tools/list'))
    return result[0]
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
