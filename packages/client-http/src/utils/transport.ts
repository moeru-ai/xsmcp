import type { Transport } from '@xsmcp/client-shared'
import type { JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export interface HttpTransportOptions {
  url: string | URL
}

export class HttpTransport implements Transport {
  private url: URL

  constructor(options: HttpTransportOptions) {
    this.url = options.url instanceof URL ? options.url : new URL(options.url)
  }

  public async notification(notification: JSONRPCNotification): Promise<void> {
    await fetch(this.url, {
      body: JSON.stringify(notification),
      headers: {
        'Accept': [
          'application/json',
          'text/event-stream',
        ].join(', '),
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  }

  public async request(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    return fetch(this.url, {
      body: JSON.stringify(request),
      headers: {
        'Accept': [
          'application/json',
          'text/event-stream',
        ].join(', '),
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then(async res => res.json() as Promise<JSONRPCResponse>)
  }
}

export const createHttpTransport = (options: HttpTransportOptions) => new HttpTransport(options)
