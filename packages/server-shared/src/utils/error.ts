export class JSONRPCError extends Error {
  code: number
  data: Record<string, unknown> | undefined
  id: null | number | string
  status: number

  constructor(
    message: string,
    code: number,
    status: number,
    id: null | number | string = null,
    data?: Record<string, unknown>,
  ) {
    super(message)
    this.code = code
    this.status = status
    this.id = id
    this.data = data
    this.name = 'JSONRPCError'
  }

  public toResponse(): Response {
    return Response.json({
      data: this.data,
      error: { code: this.code, message: this.message },
      id: this.id,
      jsonrpc: '2.0',
    }, { status: this.status })
  }
}

export const ParseError = () => new JSONRPCError('Parse error', -32700, 500)
export const InvalidRequest = () => new JSONRPCError('Invalid Request', -32600, 400)
export const MethodNotFound = () => new JSONRPCError('Method not found', -32601, 404)
export const InvalidParams = () => new JSONRPCError('Invalid params', -32602, 500)
export const InternalError = () => new JSONRPCError('Internal error', -32603, 500)
