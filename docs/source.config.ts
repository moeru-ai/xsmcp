import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins'
import { remarkInstall } from 'fumadocs-docgen'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { transformerTwoslash } from 'fumadocs-twoslash'
import { createFileSystemTypesCache } from 'fumadocs-twoslash/cache-fs'

// Options: https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  dir: 'content',
})

export default defineConfig({
  lastModifiedTime: 'git',
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          typesCache: createFileSystemTypesCache(),
        }),
      ],
    },
    remarkPlugins: [remarkInstall],
  },
})
