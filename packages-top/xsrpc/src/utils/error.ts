export class XSRPCError extends Error {
  code: number
  data: Record<string, unknown> | undefined
  id: null | number | string
  status: number

  constructor(message: string, code: number, status: number, id: null | number | string = null, data?: Record<string, unknown>) {
    super(message)
    this.name = 'XSRPCError'
    this.code = code
    this.data = data
    this.status = status
    this.id = id
  }
}

export const ParseError = () => new XSRPCError('Parse error', -32700, 500)
export const InvalidRequest = () => new XSRPCError('Invalid Request', -32600, 400)
export const MethodNotFound = () => new XSRPCError('Method not found', -32601, 404)
export const InvalidParams = () => new XSRPCError('Invalid params', -32602, 500)
export const InternalError = () => new XSRPCError('Internal error', -32603, 500)

// export const parseError = () => response(-32700, 'Parse error', 500)
// export const invalidRequest = () => response(-32600, 'Invalid Request', 400)
// export const methodNotFound = () => response(-32601, 'Method not found', 404)
// export const invalidParams = () => response(-32602, 'Invalid params', 500)
// export const internalError = () => response(-32603, 'Internal error', 500)
// export const serverError = (code: number = 32000) => response(code, 'Server error', 500)
