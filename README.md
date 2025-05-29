# xsMCP

extra-small MCP SDK for mcp builders hating bloat.

## About

> 🚧 This project is under active development, stay tuned!

### Why is there this project?

[`@modelcontextprotocol/sdk` is large](https://pkg-sized.dev/@modelcontextprotocol/sdk) and has dependencies on libraries like `zod`, `express`, etc. that you probably don't even want to use.

Like [xsAI](https://github.com/moeru-ai/xsai), xsMCP does not force you to use a particular server or schema library and is very small.

### Roadmap

Our current target is Streamable HTTP Client / Server, Stdio have lower priority.

### Compatibility

xsMCP v0.1 is targeted to be compatible with the `2025-03-26` revision and is not backward compatible.

### HTTP Server Structure

`@xsmcp/server-http` is based on [Web Standards](https://hono.dev/docs/concepts/web-standard), not Express.

```ts
import { fetch } from '@xsmcp/server-http'
import { createServer } from '@xsmcp/server-shared'
import { serve } from 'srvx'

import * as tools from '...'

const server = createServer({ ...options })

for (const tool of tools) {
  server.addTool(tool)
}

// (req: Request) => Promise<Response>
const app = fetch(server)

// node.js, deno, bun
serve({ fetch: app })

// next.js
export const POST = app

// cloudflare workers
export default { fetch: app }
```

It can be used as a server on its own or with `hono`, `elysia` and `itty-router` for more features:

```ts
import { fetch } from '@xsmcp/server-http'
import { createServer } from '@xsmcp/server-shared'
import { Elysia } from 'elysia'
import { Hono } from 'hono'
import { AutoRouter } from 'itty-router'

import * as tools from '...'

const server = createServer({ ...options })

for (const tool of tools) {
  server.addTool(tool)
}

const app = fetch(server)

// hono
new Hono()
  .post('/mcp', ({ req }) => app(req.raw))

// elysia
new Elysia()
  .post('/mcp', ({ request }) => app(request))

// itty-router
AutoRouter()
  .post('/mcp', req => app(req))
```

At the same time, it does not depends on any server framework thus minimizing the size.

For simplicity reasons, this server only returns JSON Response, not SSE.

## License

[MIT](LICENSE.md)

### Third Party Licenses

This project partially copies code from the following projects:

| Project | License |
| -- | -- |
| [modelcontextprotocol/specification](https://github.com/modelcontextprotocol/specification) | [MIT](https://github.com/modelcontextprotocol/specification/blob/main/LICENSE) |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | [MIT](https://github.com/modelcontextprotocol/servers/blob/main/LICENSE) |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | [MIT](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/LICENSE) |
| [crouchcd/pkce-challenge](https://github.com/crouchcd/pkce-challenge) | [MIT](https://github.com/crouchcd/pkce-challenge/blob/master/LICENSE) |
| [denoland/std](https://github.com/denoland/std) | [MIT](https://github.com/denoland/std/blob/main/LICENSE) |
