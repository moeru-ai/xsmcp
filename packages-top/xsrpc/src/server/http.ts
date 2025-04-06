import type { RPCRequest } from '../types/msg'

import { InvalidRequest, MethodNotFound, XSRPCError } from '../utils/error'

export const httpServer = <T extends Record<string, (params: any) => unknown>>(server: T) =>
  async (req: Request): Promise<Response> => {
    try {
      if (req.method !== 'POST')
        throw InvalidRequest()

      const body = await req.json() as RPCRequest

      const handler = server[body.method] as ((params: unknown) => unknown) | undefined

      if (!handler)
        throw MethodNotFound()

      try {
        const result = await handler(body.params)
        return new Response(JSON.stringify({
          id: body.id,
          jsonrpc: '2.0',
          result,
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      catch (error) {
        console.error('Error during method execution:', error)
        return new Response(JSON.stringify({
          error: { code: -32603, data: error instanceof Error ? error.message : String(error), message: 'Internal server error' },
          id: body.id,
          jsonrpc: '2.0',
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }
    catch (err: unknown) {
      if (err instanceof XSRPCError) {
        return new Response(JSON.stringify({
          data: err.data,
          error: { code: err.code, message: err.message },
          id: err.id,
          jsonrpc: '2.0',
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: err.status,
        })
      }
      else if (err instanceof Error) {
        return new Response(JSON.stringify({
          error: { code: -32603, data: err.message, message: 'Internal server error' },
          id: null,
          jsonrpc: '2.0',
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        })
      }
      else {
        return new Response(JSON.stringify({
          error: { code: -32603, message: 'Internal Error' },
          id: null,
          jsonrpc: '2.0',
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    }
  }
