export const createServerPrimitive = () => {
  const tools: string[] = []

  return {
    addTool(tool: string) {
      tools.push(tool)
      return this
    },
    fetch: (_req: Request) => Response.json(tools)
  }
}
