import type { JSONRPCRequest, JSONRPCResponse, Transport } from '@xsmcp/client-shared'

export interface HttpTransportOptions {
  url: string | URL
}

export class HttpTransport implements Transport {
  private url: URL

  constructor(options: HttpTransportOptions) {
    this.url = options.url instanceof URL ? options.url : new URL(options.url)
  }

  public async send<T extends Record<string, unknown> = Record<string, unknown>>(request: JSONRPCRequest): Promise<JSONRPCResponse<T>> {
    return fetch(this.url, {
      body: JSON.stringify(request),
      headers: {
        'Accept': [
          'application/json',
          'text/event-stream'
        ].join(', '),
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then(async res => res.json() as Promise<JSONRPCResponse<T>>)
  }

  public shutdown(): void {}
}

export const createHttpTransport = (options: HttpTransportOptions) => new HttpTransport(options)
