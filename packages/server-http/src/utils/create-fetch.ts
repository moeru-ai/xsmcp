import type { Server } from '@xsmcp/server-shared'
import type { JSONRPCBatchResponse, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

import { InternalError, XSMCPError } from '@xsmcp/server-shared'
import { JSONRPC_VERSION } from '@xsmcp/shared'

export const createFetch = (server: Server) =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async (req: Request) => {
    try {
      const accept = req.headers.get('Accept')
      if (accept == null || !accept.includes('application/json'))
        throw new XSMCPError('Not Acceptable: Client must accept application/json', -32000, 406)

      const text = await req.text()
      const json = JSON.parse(text) as JSONRPCRequest | JSONRPCRequest[]

      if (Array.isArray(json)) {
        const results: JSONRPCBatchResponse = []
        for (const { id, method, params } of json) {
          const result = await server.handleRequest(method, params)
          if (result)
            results.push({ id, jsonrpc: JSONRPC_VERSION, result })
        }
        return Response.json(results)
      }
      else {
        const { id, method, params } = json
        const result = await server.handleRequest(method, params)
        if (result)
          return Response.json({ id, jsonrpc: JSONRPC_VERSION, result } satisfies JSONRPCResponse)
        else
          return new Response(null, { status: 202 })
      }
    }
    catch (err) {
      if (err instanceof XSMCPError) {
        return err.toResponse()
      }
      else if (err instanceof Error) {
        return new XSMCPError(err.message, -32000, 500).toResponse()
      }
      else {
      // eslint-disable-next-line unicorn/throw-new-error
        return InternalError().toResponse()
      }
    }
  }
