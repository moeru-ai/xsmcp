import type { PropsWithChildren } from 'react'

import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'

export default ({ children }: Readonly<PropsWithChildren>) => (
  <DocsLayout tree={source.pageTree} {...baseOptions}>
    {children}
  </DocsLayout>
)
