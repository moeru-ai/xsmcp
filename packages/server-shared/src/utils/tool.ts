import type { CallToolResult, Tool } from '@xsmcp/shared'
import type { InferIn, Schema } from 'xsschema'

import { toJsonSchema } from 'xsschema'

export interface ToolOptions<T extends Schema = Schema> {
  description?: string
  execute: (input: InferIn<T>) => CallToolResult['content'] | Promise<CallToolResult['content']>
  name: string
  parameters: T
}

export const defineTool = <T extends Schema>(options: ToolOptions<T>) => options

export const listTool = async <T extends Schema>({ description, name, parameters }: ToolOptions<T>): Promise<Tool> => ({
  description,
  inputSchema: await toJsonSchema(parameters) as Tool['inputSchema'],
  name,
})
