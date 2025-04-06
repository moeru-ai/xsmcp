import type { JSONRPCRequest, JSONRPCResponse } from '@xsmcp/shared'

export abstract class Transport {
  public abstract send(request: JSONRPCRequest): JSONRPCResponse | Promise<JSONRPCResponse>

  public abstract shutdown?(): Promise<void> | void
}
