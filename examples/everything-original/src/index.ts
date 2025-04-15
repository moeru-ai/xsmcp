/* eslint-disable no-console */
/* eslint-disable @masknet/no-top-level */
import type { Request, Response } from 'express'

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import process from 'node:process'

import { createServer } from './everything'

const app = express()
app.disable('x-powered-by')
app.use(express.json())

const { server } = createServer()

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}

// Helper function to detect initialize requests
const isInitializeRequest = (body: unknown): boolean => {
  if (Array.isArray(body)) {
    // eslint-disable-next-line ts/no-unsafe-member-access
    return body.some(msg => typeof msg === 'object' && msg !== null && 'method' in msg && msg.method === 'initialize')
  }
  return typeof body === 'object' && body !== null && 'method' in body && body.method === 'initialize'
}

app.post('/mcp', async (req: Request, res: Response) => {
  console.log('Received MCP request:', req.body)
  try {
    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined
    let transport: StreamableHTTPServerTransport

    if (sessionId != null && transports[sessionId] != null) {
      // Reuse existing transport
      transport = transports[sessionId]
    }
    else if (sessionId == null && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => globalThis.crypto.randomUUID(),
      })

      // Connect the transport to the MCP server BEFORE handling the request
      // so responses can flow back through the same transport
      await server.connect(transport)

      // After handling the request, if we get a session ID back, store the transport
      await transport.handleRequest(req, res, req.body)

      // Store the transport by session ID for future requests
      if (transport.sessionId != null) {
        transports[transport.sessionId] = transport
      }
      return // Already handled
    }
    else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
        jsonrpc: '2.0',
      })
      return
    }

    // Handle the request with existing transport - no need to reconnect
    // The existing transport is already connected to the server
    // eslint-disable-next-line ts/no-unsafe-argument
    await transport.handleRequest(req as any, res as any, req.body)
  }
  catch (error) {
    console.error('Error handling MCP request:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
        jsonrpc: '2.0',
      })
    }
  }
})

// Start the server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`MCP Streamable HTTP Server listening on port ${PORT}`)
  console.log(`Test with: curl -X POST -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":"1"}' http://localhost:${PORT}/mcp`)
})

// Handle server shutdown
// eslint-disable-next-line ts/no-misused-promises
process.on('SIGINT', async () => {
  console.log('Shutting down server...')
  await server.close()
  process.exit(0)
})
