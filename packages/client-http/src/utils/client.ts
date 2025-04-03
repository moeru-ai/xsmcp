import type { CreateClientOptions } from '@xsmcp/client-shared'

import { createClient } from '@xsmcp/client-shared'

import type { HttpTransportOptions } from './transport'

import { createHttpTransport } from './transport'

export const createHttpClient = (options: Omit<CreateClientOptions, 'transport'>, transportOptions: HttpTransportOptions) => createClient({
  ...options,
  transport: createHttpTransport(transportOptions),
})
