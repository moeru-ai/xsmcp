import type { OAuthClientProvider, Transport } from '@xsmcp/client-shared'
import type { JSONRPCMessage, JSONRPCNotification, JSONRPCRequest, JSONRPCResponse, Result } from '@xsmcp/shared'

import { auth, UnauthorizedError } from '@xsmcp/client-shared'
import { EventSourceParserStream } from 'eventsource-parser/stream'

export interface HttpTransportOptions {
  authProvider?: OAuthClientProvider
  url: string | URL
}

export class HttpTransport implements Transport {
  private abortController: AbortController = new AbortController()
  private authProvider?: OAuthClientProvider
  // private lastEventId?: string
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

  public async request<T extends Result = Result>(request: JSONRPCRequest): Promise<T> {
    const res = await this.send(request)

    // Check the response type
    const contentType = res.headers.get('Content-Type')

    if (!res.body)
      throw new Error('No response body')

    if (contentType?.includes('application/json')) {
      const json = await res.json() as JSONRPCResponse
      // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
      return json.result as T
    }
    else if (contentType?.includes('text/event-stream')) {
      const eventStream = res.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream())

      for await (const event of eventStream) {
        // if (event.id != null)
        //   this.lastEventId = event.id

        if (event.event == null || event.event === 'message') {
          const message = JSON.parse(event.data) as JSONRPCNotification | JSONRPCResponse

          if ('id' in message)
            // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
            return message.result as T
        }
      }
    }

    throw new Error(`Invalid content type: ${contentType}`)
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
      body: JSON.stringify(Array.isArray(message) ? message : [message]),
      headers,
      method: 'POST',
      signal: this.abortController.signal,
    })

    const mcpSessionId = res.headers.get('mcp-session-id')
    if (mcpSessionId != null)
      this.mcpSessionId = mcpSessionId

    if (!res.ok) {
      if (res.status === 401 && this.authProvider) {
        const result = await auth(this.authProvider, { serverUrl: this.url })
        if (result !== 'AUTHORIZED')
          throw new UnauthorizedError()

        // Purposely _not_ awaited, so we don't call onerror twice
        return this.send(message)
      }

      const text = await res.text().catch(() => '')
      throw new Error(`Error POSTing to endpoint (HTTP ${res.status}): ${text}`)
    }

    return res
  }
}

export const createHttpTransport = (options: HttpTransportOptions) => new HttpTransport(options)
