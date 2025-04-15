import type { Server } from '@xsmcp/server-shared'

import { fetch } from './fetch'

export const createHttpServer = (server: Server) => ({
  fetch: fetch(server),
})
