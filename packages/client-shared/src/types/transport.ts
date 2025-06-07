import type { JSONRPCNotification, JSONRPCRequest, JSONRPCResponse, Result } from '@xsmcp/shared'

export abstract class Transport {
  public abstract close?(): Promise<void> | void

  public abstract notification(request: JSONRPCNotification | JSONRPCNotification[]): Promise<void> | void

  public abstract request<T extends Result = Result>(request: JSONRPCRequest): Promise<Omit<JSONRPCResponse, 'result'> & { result: T }>

  public abstract start?(): Promise<void> | void
}
