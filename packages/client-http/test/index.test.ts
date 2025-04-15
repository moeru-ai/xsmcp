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
    const addResult = await client.callTool('add', { a: 1, b: 1 })
    expect(cleanId(addResult)).toMatchSnapshot()

    const echoResult = await client.callTool('echo', { message: 'Hello, World!' })
    expect(cleanId(echoResult)).toMatchSnapshot()

    const longRunningOperationResult = await client.callTool('longRunningOperation', { duration: 1, steps: 2 })
    expect(cleanId(longRunningOperationResult)).toMatchSnapshot()

    const getTinyImageResult = await client.callTool('getTinyImage', {})
    expect(cleanId(getTinyImageResult)).toMatchSnapshot()
  })
})
