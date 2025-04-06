import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'

import { httpServer } from '../src/server/http'
import { server } from './fixture/server'

describe('xsrpc/server', () => {
  it('http-server', async () => {
    const app = new Hono()
      .mount('/', httpServer(server))

    const id = crypto.randomUUID()

    const res = await app.request('/', {
      body: JSON.stringify({
        id,
        jsonrpc: '2.0',
        method: 'ping',
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    expect(await res.json()).toStrictEqual({
      id,
      jsonrpc: '2.0',
      result: {},
    })
  })
})
