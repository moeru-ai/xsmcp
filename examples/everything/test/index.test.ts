import { createHttpClient } from '@xsmcp/client-http'
import { describe, expect, it } from 'vitest'

import '../src'

describe('@xsmcp/everything', async () => {
  const client = createHttpClient({
    name: 'example-client',
    version: '1.0.0',
  }, { url: 'http://localhost:3001' })

  it('listTools', async () => {
    const result = await client.listTools()
    expect(result).toMatchSnapshot()
  })

  it('callTool', async () => {
    const addResult = await client.callTool('add', { a: 1, b: 1 })
    expect(addResult).toMatchSnapshot()

    const echoResult = await client.callTool('echo', { message: 'Hello, World!' })
    expect(echoResult).toMatchSnapshot()

    const longRunningOperationResult = await client.callTool('longRunningOperation', { duration: 1, steps: 2 })
    expect(longRunningOperationResult).toMatchSnapshot()

    const getTinyImageResult = await client.callTool('getTinyImage', {})
    expect(getTinyImageResult).toMatchSnapshot()
  })

  it('listPrompts', async () => {
    const result = await client.listPrompts()
    expect(result).toMatchSnapshot()
  })

  it('getPrompt', async () => {
    const simpleResult = await client.getPrompt('simple_prompt')
    expect(simpleResult).toMatchSnapshot()

    const complexResult = await client.getPrompt('complex_prompt', { style: 'dark', temperature: 42 })
    expect(complexResult).toMatchSnapshot()

    // TODO: add resource_prompt
    // const resourceResult = await client.getPrompt('resource_prompt', { resourceId: 2 })
    // expect(resourceResult).toMatchSnapshot()
  })
})
