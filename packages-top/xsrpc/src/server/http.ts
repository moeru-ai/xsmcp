import type { RPCRequest } from '../types/msg'

import { invalidRequest, methodNotFound, parseError } from './http-error'

export const httpServer = <T extends Record<string, (params: any) => unknown>>(server: T) =>
  async (req: Request): Promise<Response> => {
    if (req.method !== 'POST')
      return invalidRequest()

    try {
      const body = await req.json() as RPCRequest

      const handler = server[body.method] as ((params: unknown) => unknown) | undefined

      if (!handler)
        return methodNotFound()

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

      // if (typeof body !== 'object' || body == null || Array.isArray(body) ||
      //   body.jsonrpc !== '2.0' ||
      //   typeof body.method !== 'string') {
      //   return new Response(JSON.stringify({
      //     jsonrpc: '2.0',
      //     error: { code: -32600, message: 'Invalid Request' },
      //     id: body ? body.id : null,
      //   }), {
      //     status: 400,
      //     headers: { 'Content-Type': 'application/json' },
      //   });
      // }
    }
    catch {
      return parseError()
    }
  }
