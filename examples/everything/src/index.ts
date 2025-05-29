import { fetch } from '@xsmcp/server-http'
import { serve } from 'srvx'

import { server } from './server'

// eslint-disable-next-line @masknet/no-top-level
serve({
  fetch: fetch(server),
  port: 3001,
})
