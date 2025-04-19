import type { ReadResourceResult, Resource } from '@xsmcp/shared'

export interface ResourceOptions extends Resource {
  load: () => Promise<ReadResourceResult['contents']> | ReadResourceResult['contents']
}

export const defineResource = (options: ResourceOptions) => options

export const listResource = ({ load, ...resource }: ResourceOptions): Resource => resource
