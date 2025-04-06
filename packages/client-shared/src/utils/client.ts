import type { ClientCapabilities } from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { Transport } from '../types/transport'

import { jsonrpcRequest } from './jsonrpc'

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

  public async initialize() {
    await this.transport.send(jsonrpcRequest('initialize', {
      capabilities: this.options.capabilities,
      clientInfo: {
        name: this.options.name,
        version: this.options.version,
      },
      protocolVersion: LATEST_PROTOCOL_VERSION,
    }))

    await this.transport.send(jsonrpcRequest('notifications/initialized', undefined, true))
  }

  public async listTools() {
    return this.transport.send(jsonrpcRequest('tools/list'))
  }

  public async shutdown() {
    return this.transport.shutdown?.()
  }
}

export const createClient = (options: CreateClientOptions) => new Client(options)
