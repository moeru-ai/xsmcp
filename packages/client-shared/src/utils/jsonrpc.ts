import type { JSONRPCRequest } from '../types/jsonrpc'

export const jsonrpcRequest = <T extends Record<string, unknown>>(method: string, params?: T, withoutId?: true): JSONRPCRequest<T> => ({
  id: withoutId ? undefined : crypto.randomUUID(),
  jsonrpc: '2.0',
  method,
  params,
})
