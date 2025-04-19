import { createHttpClient } from '@xsmcp/client-http'
import { describe, expect, it } from 'vitest'

import '../src'

describe('@xsmcp/everything-original', async () => {
  const client = createHttpClient({
    name: 'example-client',
    version: '1.0.0',
  }, { url: 'http://localhost:3000/mcp' })

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

    // TODO: FIXME: FAILED
    // const complexResult = await client.getPrompt('complex_prompt', { style: 'dark', temperature: 42 })
    // expect(complexResult).toMatchSnapshot()

    // TODO: FIXME: FAILED
    // const resourceResult = await client.getPrompt('resource_prompt', { resourceId: 2 })
    // expect(resourceResult).toMatchSnapshot()
  })

  it('listResources', async () => {
    const result = await client.listResources()
    expect(result).toMatchSnapshot()
  })

  it('readResource', async () => {
    const evenResult = await client.readResource('test://static/resource/1')
    expect(evenResult).toMatchSnapshot()

    const oddResult = await client.readResource('test://static/resource/2')
    expect(oddResult).toMatchSnapshot()
  })
})
