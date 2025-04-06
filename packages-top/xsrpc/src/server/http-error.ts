const response = (code: number, message: string, status: number, id: null | number | string = null) => new Response(JSON.stringify({
  error: { code, message },
  id,
  jsonrpc: '2.0',
}), {
  headers: { 'Content-Type': 'application/json' },
  status,
})

export const parseError = () => response(-32700, 'Parse error', 500)
export const invalidRequest = () => response(-32600, 'Invalid Request', 400)
export const methodNotFound = () => response(-32601, 'Method not found', 404)
export const invalidParams = () => response(-32602, 'Invalid params', 500)
export const internalError = () => response(-32603, 'Internal error', 500)
export const serverError = (code: number = 32000) => response(code, 'Server error', 500)
