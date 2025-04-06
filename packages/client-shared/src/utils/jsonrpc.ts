import type { JSONRPCRequest } from '@xsmcp/shared'

export const jsonrpcRequest = <T extends Record<string, unknown>>(method: string, params?: T, withoutId?: true): JSONRPCRequest => ({
  id: withoutId ? '' : crypto.randomUUID(),
  jsonrpc: '2.0',
  method,
  params,
})
