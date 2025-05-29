import Link from 'fumadocs-core/link'
import {
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page'
import React from 'react'

export default () => (
  <div className="flex w-full h-[80vh] justify-center">
    <div className="flex flex-col my-auto p-8">
      <DocsTitle>
        <small>extra-small</small>
        {' '}
        <span>MCP SDK</span>
      </DocsTitle>
      <DocsDescription className="mb-2">for mcp builders hating bloat.</DocsDescription>
      <DocsBody className="flex gap-4">
        <Link href="/docs/client">Client</Link>
        <Link href="/docs/server">Server</Link>
      </DocsBody>
    </div>
  </div>
)
