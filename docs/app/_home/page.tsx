import Link from 'next/link'

export default () => (
  <main className="flex flex-1 flex-col justify-center text-center">
    <h1 className="mb-4 text-2xl font-bold">Hello World</h1>
    <p className="text-fd-muted-foreground">
      You can open
      {' '}
      <Link
        className="text-fd-foreground font-semibold underline"
        href="/docs"
      >
        /docs
      </Link>
      {' '}
      and see the documentation.
    </p>
  </main>
)
