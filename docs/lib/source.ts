import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'

import { docs } from '@/.source'

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  // https://fumadocs.dev/docs/headless/source-api#icons
  icon(icon) {
    if (icon == null) {
      // You may set a default icon
      return
    }
    if (icon in icons)
      return createElement(icons[icon as keyof typeof icons])
  },
  source: docs.toFumadocsSource(),
})
