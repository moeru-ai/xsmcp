import type { Prompt, PromptArgument, PromptMessage } from '@xsmcp/shared'
import type { InferIn, JsonSchema, Schema } from 'xsschema'

import { toJsonSchema } from 'xsschema'

export interface PromptOptions<T extends Schema | undefined = Schema | undefined> {
  description?: string
  execute: (input: T extends Schema ? InferIn<T> : undefined) => Promise<PromptMessage[]> | PromptMessage[]
  name: string
  parameters?: T
}

/** @internal */
const promptArgumentsFromSchema = async (schema: Schema): Promise<PromptArgument[]> =>
  toJsonSchema(schema)
    .then(json => Object.entries(json.properties ?? {}).map(([name, property]) => ({
      description: (property as JsonSchema).description,
      name,
      required: json.required?.includes(name),
    })))

export const definePrompt = <T extends Schema | undefined = Schema | undefined>(options: PromptOptions<T>) => options

export const listPrompt = async <T extends Schema | undefined = Schema | undefined>({ description, name, parameters }: PromptOptions<T>): Promise<Prompt> => ({
  arguments: parameters ? await promptArgumentsFromSchema(parameters) : undefined,
  description,
  name,
})
