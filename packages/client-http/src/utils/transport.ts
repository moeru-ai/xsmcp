import type { Transport } from '@xsmcp/client-shared'
import type { JSONRPCMessage, JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export interface HttpTransportOptions {
  url: string | URL
}

export class HttpTransport implements Transport {
  private abortController: AbortController = new AbortController()
  private mcpSessionId?: string
  private url: URL

  constructor(options: HttpTransportOptions) {
    this.url = options.url instanceof URL ? options.url : new URL(options.url)
  }

  public async close(): Promise<void> {
    this.abortController.abort()
  }

  public async notification(notification: JSONRPCNotification | JSONRPCNotification[]): Promise<void> {
    await this.send(notification)
  }

  public async request<T extends JSONRPCRequest | JSONRPCRequest[]>(request: T): Promise<T extends JSONRPCRequest[] ? JSONRPCResponse[] : JSONRPCResponse> {
    // eslint-disable-next-line ts/no-unsafe-return
    return this.send(request).then(async res => res.json())
  }

  private async send(message: JSONRPCMessage | JSONRPCMessage[]): Promise<Response> {
    const res = await fetch(this.url, {
      body: JSON.stringify(message),
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Content-Type': 'application/json',
        ...(this.mcpSessionId != null ? { 'Mcp-Session-Id': this.mcpSessionId } : {}),
      },
      method: 'POST',
      signal: this.abortController.signal,
    })

    const mcpSessionId = res.headers.get('mcp-session-id')
    if (mcpSessionId != null)
      this.mcpSessionId = mcpSessionId

    return res
  }
}

export const createHttpTransport = (options: HttpTransportOptions) => new HttpTransport(options)
