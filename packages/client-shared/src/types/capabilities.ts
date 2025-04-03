export interface Capabilities {
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/client/roots/#capabilities} */
  roots?: ListChanged
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/client/sampling/#capabilities} */
  sampling?: Empty
}

/** @internal */
export interface ServerCapabilities {
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/utilities/completion/#capabilities} */
  completions?: Empty
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/utilities/logging/#capabilities} */
  logging?: Empty
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/prompts/#capabilities} */
  prompts?: ListChanged
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/resources/#capabilities} */
  resources?: ListChanged & Subscribe
  /** @see {@link https://spec.modelcontextprotocol.io/specification/2025-03-26/server/tools/#capabilities} */
  tools?: ListChanged
}

type Empty = Record<string, never>

interface ListChanged {
  listChanged?: true
}

interface Subscribe {
  subscribe?: true
}
