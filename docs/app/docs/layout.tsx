import type { PropsWithChildren } from 'react'

import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'

export default ({ children }: Readonly<PropsWithChildren>) => (
  <DocsLayout tree={source.pageTree} {...baseOptions}>
    {children}
  </DocsLayout>
)
