import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import pkg from '../package.json' with { type: 'json' }

/**
 * Shared layout configurations
 *
 * you can customize layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  githubUrl: 'https://github.com/moeru-ai/xsmcp',
  // links: [
  //   {
  //     active: 'none',
  //     text: 'Blog',
  //     url: 'https://blog.moeru.ai',
  //   },
  // ],
  nav: {
    title: (
      <div className="prose flex items-center justify-center gap-3">
        <img className="size-6 mb-0 -mr-1" src="https://github.com/moeru-ai.png" />
        <span>xsMCP</span>
        <code className="py-0 px-1">
          {pkg.version}
        </code>
      </div>
    ),
    transparentMode: 'top',
  },
}
