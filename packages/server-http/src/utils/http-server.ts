import type { CreateServerOptions } from '@xsmcp/server-shared'
import type { JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

import { InternalError, JSONRPCError, Server } from '@xsmcp/server-shared'

export class HttpServer extends Server {
  constructor(options?: CreateServerOptions) {
    super(options)
  }

  public async fetch(req: Request): Promise<Response> {
    try {
      const accept = req.headers.get('Accept')
      if (accept == null || !accept.includes('text/event-stream'))
        throw new JSONRPCError('Not Acceptable: Client must accept text/event-stream', -32000, 406)

      const { id, method, params } = await req.json() as JSONRPCRequest
      const result = await this.handleRequest(method, params)

      return Response.json({
        id,
        jsonrpc: '2.0',
        result,
      } satisfies JSONRPCResponse)
    }
    catch (err) {
      if (err instanceof JSONRPCError) {
        return err.toResponse()
      }
      else if (err instanceof Error) {
        return new JSONRPCError(err.message, -32000, 500).toResponse()
      }
      else {
        // eslint-disable-next-line unicorn/throw-new-error
        return InternalError().toResponse()
      }
    }
  }
}
