import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import { createServerPrimitive } from '../src/utils/server-primitive'

describe('@xsmcp/server-http', () => {
  it('basic', async () => {
    const server = createServerPrimitive()
      .addTool('test1')
      .addTool('test2')

    const app = new Hono()
      .mount('/', server.fetch)

    const res = await app.request('/', { method: 'POST' })

    expect(await res.json()).toStrictEqual(['test1', 'test2'])
  })
})
