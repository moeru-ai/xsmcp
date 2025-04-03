export interface JSONRPCRequest<T extends Record<string, unknown> = Record<string, unknown>> extends JSONRPCCommon {
  method: string
  params?: T
}

export type JSONRPCResponse<T extends Record<string, unknown> = Record<string, unknown>> = JSONRPCResponseError | JSONRPCResponseResult<T>

export interface JSONRPCResponseError extends JSONRPCCommon {
  error: {
    code: number
    data?: unknown
    message: string
  }
  method: string
}

export interface JSONRPCResponseResult<T extends Record<string, unknown> = Record<string, unknown>> extends JSONRPCCommon {
  method: string
  result: T
}

interface JSONRPCCommon {
  id?: number | string
  jsonrpc: '2.0'
}
