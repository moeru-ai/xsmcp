import type { JSONRPCError, RequestId } from '@xsmcp/shared'

import { INTERNAL_ERROR, INVALID_PARAMS, INVALID_REQUEST, JSONRPC_VERSION, METHOD_NOT_FOUND, PARSE_ERROR } from '@xsmcp/shared'

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
      jsonrpc: JSONRPC_VERSION,
    }
  }

  public toResponse(): Response {
    return Response.json(this.toJSON(), { status: this.status })
  }
}

export const ParseError = () => new XSMCPError('Parse error', PARSE_ERROR, 500)
export const InvalidRequest = () => new XSMCPError('Invalid Request', INVALID_REQUEST, 400)
export const MethodNotFound = (method?: string) => new XSMCPError(method ? `Method not found: ${method}`: 'Method not found', METHOD_NOT_FOUND, 404)
export const InvalidParams = () => new XSMCPError('Invalid params', INVALID_PARAMS, 500)
export const InternalError = () => new XSMCPError('Internal error', INTERNAL_ERROR, 500)
