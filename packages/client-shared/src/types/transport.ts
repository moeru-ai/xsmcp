import type { JSONRPCRequest, JSONRPCResponse } from './jsonrpc'

export abstract class Transport {
  public abstract send<T extends Record<string, unknown> = Record<string, unknown>>(request: JSONRPCRequest): JSONRPCResponse<T> | Promise<JSONRPCResponse<T>>

  public abstract shutdown?(): Promise<void> | void
}
