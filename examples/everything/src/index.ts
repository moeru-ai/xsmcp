import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'node:http'

import { server } from './server'

// eslint-disable-next-line ts/unbound-method
const serverAdapter = createServerAdapter(server.fetch)

// eslint-disable-next-line ts/no-misused-promises
const httpServer = createServer(serverAdapter)
// eslint-disable-next-line @masknet/no-top-level, no-console
console.log('Server is listening on http://localhost:3001')
// eslint-disable-next-line @masknet/no-top-level
httpServer.listen(3001)
