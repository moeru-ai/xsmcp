export interface ListToolsResult {
  tools: {
    description: string
    inputSchema: Record<string, unknown>
    name: string
  }[]
}
