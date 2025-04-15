import type { CallToolRequest, CallToolResult, InitializeRequest, InitializeResult, ListToolsRequest, ListToolsResult, ServerCapabilities } from '@xsmcp/shared'

import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'

import type { ToolOptions } from './tool'

import { MethodNotFound } from './error'
import { listTool } from './tool'

export interface CreateServerOptions {
  capabilities?: ServerCapabilities
  name: string
  tools?: ToolOptions[]
  version: string
}

export class Server {
  private capabilities: ServerCapabilities = {}
  private serverInfo: InitializeResult['serverInfo']
  private tools: ToolOptions[] = []

  constructor(options: CreateServerOptions) {
    this.serverInfo = {
      name: options.name,
      version: options.version,
    }

    if (options.capabilities)
      this.capabilities = options.capabilities

    if (options.tools)
      this.tools.push(...options.tools)
  }

  // TODO: fix types
  public addTool(tool: ToolOptions<any>) {
    // eslint-disable-next-line ts/no-unsafe-argument
    this.tools.push(tool)
    return this
  }

  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/tools/#calling-tools} */
  public async callTool(params: CallToolRequest['params']): Promise<CallToolResult> {
    const tool = this.tools.find(tool => tool.name === params.name)

    // TODO: JSONRPCError
    if (!tool)
      throw new Error(`Tool not found: ${params.name}`)

    try {
      const content = await tool.execute(params.arguments)

      return {
        content,
        isError: false,
      }
    }
    catch {
      return {
        content: [],
        isError: true,
      }
    }
  }

  public async handleRequest(method: string, params: unknown) {
    switch (method) {
      case 'initialize':
        return this.initialize(params as InitializeRequest['params'])
      case 'notifications/initialized':
        return
      case 'tools/call':
        return this.callTool(params as CallToolRequest['params'])
      case 'tools/list':
        return this.listTools(params as ListToolsRequest['params'])
      default:
        throw MethodNotFound()
    }
  }

  public initialize(_params: InitializeRequest['params']): InitializeResult {
    return {
      capabilities: {
        ...this.capabilities,
        ...(this.tools.length > 0 ? { tools: {} } : {}),
      },
      protocolVersion: LATEST_PROTOCOL_VERSION,
      serverInfo: this.serverInfo,
    }
  }

  // TODO: support params (cursor)
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/tools/#listing-tools} */
  public async listTools(_params?: ListToolsRequest['params']): Promise<ListToolsResult> {
    return {
      tools: await Promise.all(this.tools.map(async toolOptions => listTool(toolOptions))),
    }
  }
}

export const createServer = (options: CreateServerOptions) => new Server(options)
