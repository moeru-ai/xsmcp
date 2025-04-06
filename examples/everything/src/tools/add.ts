import type { ToolOptions } from '@xsmcp/server-shared'

import { description, number, object, pipe } from 'valibot'

const addSchema = object({
  a: pipe(
    number(),
    description('First number'),
  ),
  b: pipe(
    number(),
    description('Second number'),
  ),
})

export const add = {
  description: 'Echoes back the input',
  execute: ({ a, b }) => [{ text: `The sum of ${a} and ${b} is ${a + b}.`, type: 'text' }],
  name: 'add',
  parameters: addSchema,
} satisfies ToolOptions<typeof addSchema>
