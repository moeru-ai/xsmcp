import type { JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export abstract class Transport {
  public abstract close?(): Promise<void> | void

  public abstract notification(request: JSONRPCNotification): Promise<void> | void

  public abstract request(request: JSONRPCRequest): JSONRPCResponse | Promise<JSONRPCResponse>

  public abstract start?(): Promise<void> | void
}
