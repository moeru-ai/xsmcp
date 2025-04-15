import type { CreateServerOptions } from '@xsmcp/server-shared'

import { Server } from '@xsmcp/server-shared'

import { fetch } from './fetch'

export class HttpServer extends Server {
  constructor(options: CreateServerOptions) {
    super(options)
  }

  public async fetch(req: Request): Promise<Response> {
    return fetch(this)(req)
  }
}

export const createHttpServer = (options: CreateServerOptions) => new HttpServer(options)
