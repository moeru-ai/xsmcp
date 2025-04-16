import { source } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'

export const generateMetadata = async (props: {
  params: Promise<{ slug?: string[] }>
}) => {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page)
    notFound()

  return {
    description: page.data.description,
    title: page.data.title,
  }
}

export const generateStaticParams = async () =>
  source.generateParams()

export default async (props: {
  params: Promise<{ slug?: string[] }>
}) => {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page)
    notFound()

  const MDXContent = page.data.body

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}
