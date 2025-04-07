import type { ClientCapabilities, JSONRPCNotification, JSONRPCRequest } from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { Transport } from '../types/transport'

export interface CreateClientOptions {
  capabilities?: ClientCapabilities
  name: string
  transport: Transport
  version: string
}

export class Client {
  options: Omit<CreateClientOptions, 'transport'>
  transport: Transport

  constructor(options: CreateClientOptions) {
    this.options = options
    this.transport = options.transport
  }

  public async close() {
    return this.transport.close?.()
  }

  public async initialize() {
    await this.transport.request(this.request('initialize', {
      capabilities: this.options.capabilities,
      clientInfo: {
        name: this.options.name,
        version: this.options.version,
      },
      protocolVersion: LATEST_PROTOCOL_VERSION,
    }))

    await this.transport.notification(this.notification('notifications/initialized'))
  }

  public async listTools() {
    return this.transport.request(this.request('tools/list'))
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
