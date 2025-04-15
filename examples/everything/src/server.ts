/* eslint-disable @masknet/no-top-level */
// import { createHttpServer } from '@xsmcp/server-http'
import { createServer } from '@xsmcp/server-shared'

import * as tools from './tools'

const server = createServer({
  name: 'everything',
  version: '1.0.0',
})

for (const tool of Object.values(tools)) {
  server.addTool(tool)
}

export { server }
