import type { JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export abstract class Transport {
  public abstract close?(): Promise<void> | void

  public abstract notification(request: JSONRPCNotification | JSONRPCNotification[]): Promise<void> | void

  public abstract request(request: JSONRPCRequest): Promise<JSONRPCResponse>

  public abstract start?(): Promise<void> | void
}
