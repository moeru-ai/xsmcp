import { defineResource, defineResourceTemplate } from '@xsmcp/server-shared'
import { Buffer } from 'node:buffer'

export const resources = Array.from({ length: 100 }, (_, i) => {
  const uri = `test://static/resource/${i + 1}`
  const mimeType = i % 2 === 0 ? 'text/plain' : 'application/octet-stream'

  return defineResource({
    load: () => [{
      mimeType,
      uri,
      ...(i % 2 === 0
        ? { text: `Resource ${i + 1}: This is a plaintext resource` }
        : { blob: Buffer.from(`Resource ${i + 1}: This is a base64 blob`).toString('base64') }
      ),
    }],
    mimeType,
    name: `Resource ${i + 1}`,
    uri,
  })
})

export const resourceTemplate = defineResourceTemplate({
  description: 'A static resource with a numeric ID',
  name: 'Static Resource',
  uriTemplate: 'test://static/resource/{id}',
})
