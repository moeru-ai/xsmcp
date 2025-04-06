import type { CallToolResult, Tool } from '@xsmcp/shared'
import type { InferIn, Schema } from 'xsschema'

import { toJsonSchema } from 'xsschema'

export interface ToolOptions<T1 extends Schema = Schema> {
  description?: string
  execute: (input: InferIn<T1>) => CallToolResult['content'] | Promise<CallToolResult['content']>
  name: string
  parameters: T1
}

export const listTool = async <T extends Schema>({ description, name, parameters }: ToolOptions<T>): Promise<Tool> => ({
  description,
  inputSchema: await toJsonSchema(parameters) as Tool['inputSchema'],
  name,
})
