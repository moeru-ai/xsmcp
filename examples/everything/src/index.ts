import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'node:http'

import { fetch } from '../../../packages/server-http/src'
import { server } from './server'

const serverAdapter = createServerAdapter(fetch(server))

// eslint-disable-next-line ts/no-misused-promises
const httpServer = createServer(serverAdapter)
// eslint-disable-next-line @masknet/no-top-level, no-console
console.log('Server is listening on http://localhost:3001')
// eslint-disable-next-line @masknet/no-top-level
httpServer.listen(3001)
