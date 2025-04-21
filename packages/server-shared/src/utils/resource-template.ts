import type { ReadResourceResult, ResourceTemplate } from '@xsmcp/shared'

export interface ResourceTemplateOptions extends ResourceTemplate {
  load: () => Promise<ReadResourceResult['contents']> | ReadResourceResult['contents']
}

export const defineResourceTemplate = (options: ResourceTemplateOptions) => options

export const listResourceTemplate = ({ load, ...resource }: ResourceTemplateOptions): ResourceTemplate => resource
