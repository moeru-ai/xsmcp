import type { PropsWithChildren } from 'react'

import { HomeLayout } from 'fumadocs-ui/layouts/home'

import { baseOptions } from '@/app/layout.config'

export default ({ children }: Readonly<PropsWithChildren>) =>
  <HomeLayout {...baseOptions}>{children}</HomeLayout>
