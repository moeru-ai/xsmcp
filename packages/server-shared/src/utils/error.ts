import type { JSONRPCError, RequestId } from '@xsmcp/shared'

export class XSMCPError extends Error {
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
    this.name = 'XSMCPError'
  }

  public toJSON(): JSONRPCError {
    return {
      error: { code: this.code, data: this.data, message: this.message },
      id: this.id as RequestId,
      jsonrpc: '2.0',
    }
  }

  public toResponse(): Response {
    return Response.json(this.toJSON(), { status: this.status })
  }
}

export const ParseError = () => new XSMCPError('Parse error', -32700, 500)
export const InvalidRequest = () => new XSMCPError('Invalid Request', -32600, 400)
export const MethodNotFound = () => new XSMCPError('Method not found', -32601, 404)
export const InvalidParams = () => new XSMCPError('Invalid params', -32602, 500)
export const InternalError = () => new XSMCPError('Internal error', -32603, 500)
