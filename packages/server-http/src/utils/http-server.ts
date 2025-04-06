import type { CreateServerOptions } from '@xsmcp/server-shared'

import { Server } from '@xsmcp/server-shared'

export class HttpServer extends Server {
  constructor(options?: CreateServerOptions) {
    super(options)
  }
}
