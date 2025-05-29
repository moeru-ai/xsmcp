import { fetch } from '@xsmcp/server-http'
import { server } from './server'

import { serve } from 'srvx'

serve({
  fetch: fetch(server),
  port: 3001,
})
