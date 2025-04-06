import type { JSONRPCRequest } from '@xsmcp/shared'

export const jsonrpcRequest = (method: string, params?: JSONRPCRequest['params'], withoutId?: true): JSONRPCRequest => ({
  id: withoutId ? '' : crypto.randomUUID(),
  jsonrpc: '2.0',
  method,
  params,
})
