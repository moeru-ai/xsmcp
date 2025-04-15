import { createHttpClient } from '@xsmcp/client-http'
import { describe, expect, it } from 'vitest'

describe('@xsmcp/client-http', async () => {
  const client = createHttpClient({
    name: 'example-client',
    version: '1.0.0',
  }, { url: 'http://localhost:3000/mcp' })

  await client.initialize()

  it('listTools', async () => {
    const result = await client.listTools()
    expect({
      ...result,
      id: undefined,
    }).toMatchSnapshot()
  })

  it('callTool', async () => {
    const result = await client.callTool('add', {
      a: 1,
      b: 1,
    })
    expect({
      ...result,
      id: undefined,
    }).toMatchSnapshot()
  })
})
