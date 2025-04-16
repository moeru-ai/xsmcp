import { defineTool } from '@xsmcp/server-shared'
import { description, number, object, pipe } from 'valibot'

export const add = defineTool({
  description: 'Adds two numbers',
  execute: ({ a, b }) => [{ text: `The sum of ${a} and ${b} is ${a + b}.`, type: 'text' }],
  name: 'add',
  parameters: object({
    a: pipe(
      number(),
      description('First number'),
    ),
    b: pipe(
      number(),
      description('Second number'),
    ),
  }),
})
