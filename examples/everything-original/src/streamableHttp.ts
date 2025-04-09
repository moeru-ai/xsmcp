import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { JSONRPCMessage, RequestId } from '@modelcontextprotocol/sdk/types.js'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { JSONRPCMessageSchema } from '@modelcontextprotocol/sdk/types.js'
import contentType from 'content-type'
import getRawBody from 'raw-body'

const MAXIMUM_MESSAGE_SIZE = '4mb'

/**
 * Configuration options for StreamableHTTPServerTransport
 */
export interface StreamableHTTPServerTransportOptions {
  /**
   * Function that generates a session ID for the transport.
   * The session ID SHOULD be globally unique and cryptographically secure (e.g., a securely generated UUID, a JWT, or a cryptographic hash)
   *
   * Return undefined to disable session management.
   */
  sessionIdGenerator: () => string | undefined

}

/**
 * Server transport for Streamable HTTP: this implements the MCP Streamable HTTP transport specification.
 * It supports both SSE streaming and direct HTTP responses.
 *
 * Usage example:
 *
 * ```typescript
 * // Stateful mode - server sets the session ID
 * const statefulTransport = new StreamableHTTPServerTransport({
 *  sessionId: randomUUID(),
 * });
 *
 * // Stateless mode - explicitly set session ID to undefined
 * const statelessTransport = new StreamableHTTPServerTransport({
 *    sessionId: undefined,
 * });
 *
 * // Using with pre-parsed request body
 * app.post('/mcp', (req, res) => {
 *   transport.handleRequest(req, res, req.body);
 * });
 * ```
 *
 * In stateful mode:
 * - Session ID is generated and included in response headers
 * - Session ID is always included in initialization responses
 * - Requests with invalid session IDs are rejected with 404 Not Found
 * - Non-initialization requests without a session ID are rejected with 400 Bad Request
 * - State is maintained in-memory (connections, message history)
 *
 * In stateless mode:
 * - Session ID is only included in initialization responses
 * - No session validation is performed
 */
export class StreamableHTTPServerTransport implements Transport {
  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: (message: JSONRPCMessage) => void
  sessionId?: string

  private _initialized: boolean = false
  private _sseResponseMapping: Map<RequestId, ServerResponse> = new Map()
  private _started: boolean = false
  // when sessionId is not set (undefined), it means the transport is in stateless mode
  private sessionIdGenerator: () => string | undefined

  constructor(options: StreamableHTTPServerTransportOptions) {
    this.sessionIdGenerator = options.sessionIdGenerator
  }

  async close(): Promise<void> {
    // Close all SSE connections
    this._sseResponseMapping.forEach((response) => {
      response.end()
    })
    this._sseResponseMapping.clear()
    this.onclose?.()
  }

  /**
   * Handles an incoming HTTP request, whether GET or POST
   */
  async handleRequest(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void> {
    if (req.method === 'POST') {
      await this.handlePostRequest(req, res, parsedBody)
    }
    else if (req.method === 'DELETE') {
      await this.handleDeleteRequest(req, res)
    }
    else {
      await this.handleUnsupportedRequest(res)
    }
  }

  async send(message: JSONRPCMessage, options?: { relatedRequestId?: RequestId }): Promise<void> {
    let requestId = options?.relatedRequestId
    if ('result' in message || 'error' in message) {
      // If the message is a response, use the request ID from the message
      requestId = message.id
    }
    if (requestId === undefined) {
      throw new Error('No request ID provided for the message')
    }

    const sseResponse = this._sseResponseMapping.get(requestId)
    if (!sseResponse) {
      throw new Error(`No SSE connection established for request ID: ${String(requestId)}`)
    }

    // Send the message as an SSE event
    sseResponse.write(
      `event: message\ndata: ${JSON.stringify(message)}\n\n`,
    )
    // After all JSON-RPC responses have been sent, the server SHOULD close the SSE stream.
    if ('result' in message || 'error' in message) {
      this._sseResponseMapping.delete(requestId)
      // Only close the connection if it's not needed by other requests
      const canCloseConnection = ![...this._sseResponseMapping.entries()].some(([id, res]) => res === sseResponse && id !== requestId)
      if (canCloseConnection) {
        sseResponse?.end()
      }
    }
  }

  /**
   * Starts the transport. This is required by the Transport interface but is a no-op
   * for the Streamable HTTP transport as connections are managed per-request.
   */
  async start(): Promise<void> {
    if (this._started) {
      throw new Error('Transport already started')
    }
    this._started = true
  }

  /**
   * Handles DELETE requests to terminate sessions
   */
  private async handleDeleteRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.validateSession(req, res)) {
      return
    }
    await this.close()
    res.writeHead(200).end()
  }

  /**
   * Handles POST requests containing JSON-RPC messages
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private async handlePostRequest(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void> {
    try {
      // Validate the Accept header
      const acceptHeader = req.headers.accept
      // The client MUST include an Accept header, listing both application/json and text/event-stream as supported content types.
      if (!acceptHeader?.includes('application/json') || !acceptHeader.includes('text/event-stream')) {
        res.writeHead(406).end(JSON.stringify({
          error: {
            code: -32000,
            message: 'Not Acceptable: Client must accept both application/json and text/event-stream',
          },
          id: null,
          jsonrpc: '2.0',
        }))
        return
      }

      const ct = req.headers['content-type']
      if (ct == null || !ct.includes('application/json')) {
        res.writeHead(415).end(JSON.stringify({
          error: {
            code: -32000,
            message: 'Unsupported Media Type: Content-Type must be application/json',
          },
          id: null,
          jsonrpc: '2.0',
        }))
        return
      }

      let rawMessage
      if (parsedBody !== undefined) {
        rawMessage = parsedBody
      }
      else {
        const parsedCt = contentType.parse(ct)
        const body = await getRawBody(req, {
          encoding: parsedCt.parameters.charset ?? 'utf-8',
          limit: MAXIMUM_MESSAGE_SIZE,
        })
        rawMessage = JSON.parse(body) as unknown
      }

      let messages: JSONRPCMessage[]

      // handle batch and single messages
      if (Array.isArray(rawMessage)) {
        messages = rawMessage.map(msg => JSONRPCMessageSchema.parse(msg))
      }
      else {
        messages = [JSONRPCMessageSchema.parse(rawMessage)]
      }

      // Check if this is an initialization request
      // https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle/
      const isInitializationRequest = messages.some(
        msg => 'method' in msg && msg.method === 'initialize',
      )
      if (isInitializationRequest) {
        if (this._initialized) {
          res.writeHead(400).end(JSON.stringify({
            error: {
              code: -32600,
              message: 'Invalid Request: Server already initialized',
            },
            id: null,
            jsonrpc: '2.0',
          }))
          return
        }
        if (messages.length > 1) {
          res.writeHead(400).end(JSON.stringify({
            error: {
              code: -32600,
              message: 'Invalid Request: Only one initialization request is allowed',
            },
            id: null,
            jsonrpc: '2.0',
          }))
          return
        }
        this.sessionId = this.sessionIdGenerator()
        this._initialized = true
      }
      // If an Mcp-Session-Id is returned by the server during initialization,
      // clients using the Streamable HTTP transport MUST include it
      // in the Mcp-Session-Id header on all of their subsequent HTTP requests.
      if (!isInitializationRequest && !this.validateSession(req, res)) {
        return
      }

      // check if it contains requests
      const hasRequests = messages.some(msg => 'method' in msg && 'id' in msg)
      const hasOnlyNotificationsOrResponses = messages.every(msg =>
        ('method' in msg && !('id' in msg)) || ('result' in msg || 'error' in msg))

      if (hasOnlyNotificationsOrResponses) {
        // if it only contains notifications or responses, return 202
        res.writeHead(202).end()

        // handle each message
        for (const message of messages) {
          this.onmessage?.(message)
        }
      }
      else if (hasRequests) {
        const headers: Record<string, string> = {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Content-Type': 'text/event-stream',
        }

        // After initialization, always include the session ID if we have one
        if (this.sessionId !== undefined) {
          headers['mcp-session-id'] = this.sessionId
        }

        res.writeHead(200, headers)

        // Store the response for this request to send messages back through this connection
        // We need to track by request ID to maintain the connection
        for (const message of messages) {
          if ('method' in message && 'id' in message) {
            this._sseResponseMapping.set(message.id, res)
          }
        }

        // Set up close handler for client disconnects
        res.on('close', () => {
          // Remove all entries that reference this response
          for (const [id, storedRes] of this._sseResponseMapping.entries()) {
            if (storedRes === res) {
              this._sseResponseMapping.delete(id)
            }
          }
        })

        // handle each message
        for (const message of messages) {
          this.onmessage?.(message)
        }
        // The server SHOULD NOT close the SSE stream before sending all JSON-RPC responses
        // This will be handled by the send() method when responses are ready
      }
    }
    catch (error) {
      // return JSON-RPC formatted error
      res.writeHead(400).end(JSON.stringify({
        error: {
          code: -32700,
          data: String(error),
          message: 'Parse error',
        },
        id: null,
        jsonrpc: '2.0',
      }))
      this.onerror?.(error as Error)
    }
  }

  /**
   * Handles unsupported requests (GET, PUT, PATCH, etc.)
   * For now we support only POST and DELETE requests. Support for GET for SSE connections will be added later.
   */
  private async handleUnsupportedRequest(res: ServerResponse): Promise<void> {
    res.writeHead(405, {
      Allow: 'POST, DELETE',
    }).end(JSON.stringify({
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
      jsonrpc: '2.0',
    }))
  }

  /**
   * Validates session ID for non-initialization requests
   * Returns true if the session is valid, false otherwise
   */
  private validateSession(req: IncomingMessage, res: ServerResponse): boolean {
    if (!this._initialized) {
      // If the server has not been initialized yet, reject all requests
      res.writeHead(400).end(JSON.stringify({
        error: {
          code: -32000,
          message: 'Bad Request: Server not initialized',
        },
        id: null,
        jsonrpc: '2.0',
      }))
      return false
    }
    if (this.sessionId === undefined) {
      // If the session ID is not set, the session management is disabled
      // and we don't need to validate the session ID
      return true
    }
    const sessionId = req.headers['mcp-session-id']

    if (sessionId == null) {
      // Non-initialization requests without a session ID should return 400 Bad Request
      res.writeHead(400).end(JSON.stringify({
        error: {
          code: -32000,
          message: 'Bad Request: Mcp-Session-Id header is required',
        },
        id: null,
        jsonrpc: '2.0',
      }))
      return false
    }
    else if (Array.isArray(sessionId)) {
      res.writeHead(400).end(JSON.stringify({
        error: {
          code: -32000,
          message: 'Bad Request: Mcp-Session-Id header must be a single value',
        },
        id: null,
        jsonrpc: '2.0',
      }))
      return false
    }
    else if (sessionId !== this.sessionId) {
      // Reject requests with invalid session ID with 404 Not Found
      res.writeHead(404).end(JSON.stringify({
        error: {
          code: -32001,
          message: 'Session not found',
        },
        id: null,
        jsonrpc: '2.0',
      }))
      return false
    }

    return true
  }
}
