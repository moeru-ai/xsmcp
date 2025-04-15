/* eslint-disable @masknet/no-top-level */
// import { createHttpServer } from '@xsmcp/server-http'
import { createServer } from '@xsmcp/server-shared'

import * as pkg from '../package.json' with { type: 'json' }
import * as tools from './tools'

const server = createServer({
  name: pkg.name,
  version: pkg.version,
})

for (const tool of Object.values(tools)) {
  server.addTool(tool)
}

export { server }
