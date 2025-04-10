import type { OAuthClientProvider, Transport } from '@xsmcp/client-shared'
import type { JSONRPCMessage, JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

import { auth, UnauthorizedError } from '@xsmcp/client-shared'
import { EventSourceParserStream } from 'eventsource-parser/stream'

export interface HttpTransportOptions {
  authProvider?: OAuthClientProvider
  url: string | URL
}

export class HttpTransport implements Transport {
  private abortController: AbortController = new AbortController()
  private authProvider?: OAuthClientProvider
  private lastEventId?: string
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

  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async request(request: JSONRPCRequest | JSONRPCRequest[]): Promise<JSONRPCResponse[]> {
    const res = await this.send(request)

    // Check the response type
    const contentType = res.headers.get('Content-Type')

    if (!res.body)
      throw new Error('No response body')

    if (contentType?.includes('application/json')) {
      // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
      return res.json() as Promise<JSONRPCResponse[]>
    }
    else if (contentType?.includes('text/event-stream')) {
      const stream = res.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream())

      const reader = stream.getReader()

      const messages: JSONRPCResponse[] = []

      while (true) {
        const { done, value: event } = await reader.read()

        if (done)
          break

        if (event.id != null)
          this.lastEventId = event.id

        if (event.event == null || event.event === 'message') {
          const message = JSON.parse(event.data) as JSONRPCNotification | JSONRPCResponse

          if ('id' in message)
            messages.push(message)
        }
      }

      return messages
    }

    throw new Error(`Invalid content type: ${contentType}`)
  }

  // private async handleSseStream(stream: ReadableStream<Uint8Array>): void {
  //   // Create a pipeline: binary stream -> text decoder -> SSE parser
  //   const eventStream = stream
  //     .pipeThrough(new TextDecoderStream())
  //     .pipeThrough(new EventSourceParserStream())

  //   const reader = eventStream.getReader()
  //   const processStream = async () => {
  //     while (true) {
  //       const { done, value: event } = await reader.read()
  //       if (done) {
  //         break
  //       }

  //       // Update last event ID if provided
  //       if (event.id != null) {
  //         this.lastEventId = event.id
  //       }

  //       // Handle message events (default event type is undefined per docs)
  //       // or explicit 'message' event type
  //       if (event.event == null || event.event === 'message') {
  //         const message = JSON.parse(event.data) as JSONRPCMessage
  //       }
  //     }
  //   }

  //   void processStream()
  // }

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
