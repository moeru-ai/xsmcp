import type { RPCNotification, RPCRequest, RPCResponse } from '../types/msg'

export abstract class RPCTransport {
  public abstract notification(notification: RPCNotification): Promise<void> | void

  public abstract request<T extends Record<string, unknown> = Record<string, unknown>>(request: RPCRequest): Promise<RPCResponse<T>> | RPCResponse<T>

  public abstract requestBatch<T extends Record<string, unknown> = Record<string, unknown>>(requests: RPCRequest[]): Promise<RPCResponse<T>[]> | RPCResponse<T>[]
}
