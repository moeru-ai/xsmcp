import { createHttpClient } from '@xsmcp/client-http'
import { describe, expect, it } from 'vitest'

const cleanId = <T>(obj: T) => ({ ...obj, id: undefined })

describe('@xsmcp/client-http', async () => {
  const client = createHttpClient({
    name: 'example-client',
    version: '1.0.0',
  }, { url: 'http://localhost:3000/mcp' })

  it('listTools', async () => {
    const result = await client.listTools()
    expect(cleanId(result)).toMatchSnapshot()
  })

  it('callTool', async () => {
    const result = await client.callTool('add', { a: 1, b: 1 })
    expect(cleanId(result)).toMatchSnapshot()
  })
})
