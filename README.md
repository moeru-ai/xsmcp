# xsMCP

extra-small MCP SDK for quick client/server builds.

## About

> 🚧 This project is under active development, stay tuned!

### Why is there this project?

[`@modelcontextprotocol/sdk` is large](https://pkg-sized.dev/@modelcontextprotocol/sdk) and has dependencies on libraries like `zod`, `express`, etc. that you probably don't even want to use.

Like [xsAI](https://github.com/moeru-ai/xsai), xsMCP does not force you to use a particular server or schema library and is very small.

### Roadmap

Our current target is Streamable HTTP Client / Server (Waiting [modelcontextprotocol/typescript-sdk#266](https://github.com/modelcontextprotocol/typescript-sdk/pull/266) for testing), Stdio have lower priority.

### Compatibility

xsMCP v0.1 is targeted to be compatible with the `2025-03-26` revision and is not backward compatible.

## License

[MIT](LICENSE.md)

### Third Party Licenses

This project partially copies code from the following projects:

| Project | License |
| -- | -- |
| [modelcontextprotocol/specification](https://github.com/modelcontextprotocol/specification) | [MIT](https://github.com/modelcontextprotocol/specification/blob/main/LICENSE) |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | [MIT](https://github.com/modelcontextprotocol/servers/blob/main/LICENSE) |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | [MIT](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/LICENSE) |
| [crouchcd/pkce-challenge](https://github.com/crouchcd/pkce-challenge) | [MIT](https://github.com/crouchcd/pkce-challenge/blob/master/LICENSE) |
| [denoland/std](https://github.com/denoland/std) | [MIT](https://github.com/denoland/std/blob/main/LICENSE) |
