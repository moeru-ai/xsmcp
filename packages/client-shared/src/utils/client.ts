import type { CallToolResult, ClientCapabilities, JSONRPC_VERSION, JSONRPCNotification, JSONRPCRequest, RequestId } from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { Transport } from '../types/transport'

export interface CreateClientOptions {
  capabilities?: ClientCapabilities
  name: string
  transport: Transport
  version: string
}

export class Client {
  capabilities: ClientCapabilities = {}
  clientInfo: Pick<CreateClientOptions, 'name' | 'version'>
  transport: Transport

  constructor(options: CreateClientOptions) {
    this.clientInfo = {
      name: options.name,
      version: options.version,
    }
    this.transport = options.transport

    if (options.capabilities)
      this.capabilities = options.capabilities
  }

  public async callTool(name: string, args: Record<string, unknown>) {
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

  public async initialize() {
    const result = await this.transport.request(this.request('initialize', {
      capabilities: this.capabilities,
      clientInfo: this.clientInfo,
      protocolVersion: LATEST_PROTOCOL_VERSION,
    }))

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2))

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
