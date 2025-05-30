import type { Server } from '@xsmcp/server-shared'

import { createFetch } from './create-fetch'

export const createApp = (server: Server) => ({
  fetch: createFetch(server),
})
