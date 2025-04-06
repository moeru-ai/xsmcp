/* eslint-disable @masknet/no-top-level */
import type { ToolOptions } from '@xsmcp/server-shared'

import { createHttpServer } from '@xsmcp/server-http'

import * as tools from './tools'

const server = createHttpServer()

for (const tool of Object.values(tools)) {
  server.addTool(tool as ToolOptions)
}

export { server }
