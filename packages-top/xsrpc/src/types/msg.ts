export type RPCNotification<T extends Record<string, unknown> = Record<string, unknown>> = Omit<RPCRequest<T>, 'id'>

export interface RPCRequest<T extends Record<string, unknown> | unknown[] = Record<string, unknown> | unknown[]> extends RPCCommon {
  method: string
  params?: T
}

export type RPCResponse<T extends Record<string, unknown> = Record<string, unknown>> = RPCResponseError | RPCResponseResult<T>

export interface RPCResponseError extends RPCCommon {
  error: {
    code: number
    data?: Record<string, unknown>
    message: string
  }
}

export interface RPCResponseResult<T = unknown> extends RPCCommon {
  result: T
}

interface RPCCommon {
  id: number | string
  jsonrpc: '2.0'
}
