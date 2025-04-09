import type { OAuthClientProvider, Transport } from '@xsmcp/client-shared'
import type { JSONRPCMessage, JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export interface HttpTransportOptions {
  authProvider?: OAuthClientProvider
  url: string | URL
}

export class HttpTransport implements Transport {
  private abortController: AbortController = new AbortController()
  private authProvider?: OAuthClientProvider
  private mcpSessionId?: string
  private url: URL

  constructor(options: HttpTransportOptions) {
    this.url = options.url instanceof URL ? options.url : new URL(options.url)
    this.authProvider = options.authProvider
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
    const headers = new Headers({
      'Accept': 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    })

    if (this.mcpSessionId != null)
      headers.set('Mcp-Session-Id', this.mcpSessionId)

    if (this.authProvider != null) {
      const tokens = await this.authProvider.tokens()
      if (tokens)
        headers.set('Authorization', `Bearer ${tokens.access_token}`)
    }

    const res = await fetch(this.url, {
      body: JSON.stringify(message),
      headers,
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
