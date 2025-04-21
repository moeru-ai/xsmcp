/* eslint-disable @masknet/no-top-level */
// import { createHttpServer } from '@xsmcp/server-http'
import { createServer } from '@xsmcp/server-shared'

import * as pkg from '../package.json' with { type: 'json' }
import * as prompts from './prompts'
import { resources, resourceTemplate } from './resources'
import * as tools from './tools'

const server = createServer({
  name: pkg.name,
  version: pkg.version,
})

for (const tool of Object.values(tools)) {
  server.addTool(tool)
}

for (const prompt of Object.values(prompts)) {
  server.addPrompt(prompt)
}

for (const resource of resources) {
  server.addResource(resource)
}

server.addResourceTemplate(resourceTemplate)

export { server }
