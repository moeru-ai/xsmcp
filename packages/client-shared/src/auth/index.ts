import { LATEST_PROTOCOL_VERSION } from '@xsmcp/shared'
import { parse } from 'valibot'

import type { OAuthClientInformation, OAuthClientInformationFull, OAuthClientMetadata, OAuthMetadata, OAuthTokens } from './schema'

import { OAuthClientInformationFullSchema, OAuthMetadataSchema, OAuthTokensSchema } from './schema'
import { pkceChallenge } from './vendors/pkce-challenge'

export type AuthResult = 'AUTHORIZED' | 'REDIRECT'

/**
 * Implements an end-to-end OAuth client to be used with one MCP server.
 *
 * This client relies upon a concept of an authorized "session," the exact
 * meaning of which is application-defined. Tokens, authorization codes, and
 * code verifiers should not cross different sessions.
 */
export interface OAuthClientProvider {
  /**
   * Loads information about this OAuth client, as registered already with the
   * server, or returns `undefined` if the client is not registered with the
   * server.
   */
  clientInformation: () => OAuthClientInformation | Promise<OAuthClientInformation | undefined> | undefined

  /**
   * Metadata about this OAuth client.
   */
  get clientMetadata(): OAuthClientMetadata

  /**
   * Loads the PKCE code verifier for the current session, necessary to validate
   * the authorization result.
   */
  codeVerifier: () => Promise<string> | string

  /**
   * Invoked to redirect the user agent to the given URL to begin the authorization flow.
   */
  redirectToAuthorization: (authorizationUrl: URL) => Promise<void> | void

  /**
   * The URL to redirect the user agent to after authorization.
   */
  get redirectUrl(): string | URL

  /**
   * If implemented, this permits the OAuth client to dynamically register with
   * the server. Client information saved this way should later be read via
   * `clientInformation()`.
   *
   * This method is not required to be implemented if client information is
   * statically known (e.g., pre-registered).
   */
  saveClientInformation?: (clientInformation: OAuthClientInformationFull) => Promise<void> | void

  /**
   * Saves a PKCE code verifier for the current session, before redirecting to
   * the authorization flow.
   */
  saveCodeVerifier: (codeVerifier: string) => Promise<void> | void

  /**
   * Stores new OAuth tokens for the current session, after a successful
   * authorization.
   */
  saveTokens: (tokens: OAuthTokens) => Promise<void> | void

  /**
   * Loads any existing OAuth tokens for the current session, or returns
   * `undefined` if there are no saved tokens.
   */
  tokens: () => OAuthTokens | Promise<OAuthTokens | undefined> | undefined
}

export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Unauthorized')
  }
}

/**
 * Looks up RFC 8414 OAuth 2.0 Authorization Server Metadata.
 *
 * If the server returns a 404 for the well-known endpoint, this function will
 * return `undefined`. Any other errors will be thrown as exceptions.
 */
export const discoverOAuthMetadata = async (
  serverUrl: string | URL,
  opts?: { protocolVersion?: string },
): Promise<OAuthMetadata | undefined> => {
  const url = new URL('/.well-known/oauth-authorization-server', serverUrl)
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'MCP-Protocol-Version': opts?.protocolVersion ?? LATEST_PROTOCOL_VERSION,
      },
    })
  }
  catch (error) {
    // CORS errors come back as TypeError
    if (error instanceof TypeError) {
      response = await fetch(url)
    }
    else {
      throw error
    }
  }

  if (response.status === 404) {
    return undefined
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} trying to load well-known OAuth metadata`,
    )
  }

  return parse(OAuthMetadataSchema, await response.json())
}

/**
 * Exchanges an authorization code for an access token with the given server.
 */
export const exchangeAuthorization = async (
  serverUrl: string | URL,
  {
    authorizationCode,
    clientInformation,
    codeVerifier,
    metadata,
    redirectUri,
  }: {
    authorizationCode: string
    clientInformation: OAuthClientInformation
    codeVerifier: string
    metadata?: OAuthMetadata
    redirectUri: string | URL
  },
): Promise<OAuthTokens> => {
  const grantType = 'authorization_code'

  let tokenUrl: URL
  if (metadata) {
    tokenUrl = new URL(metadata.token_endpoint)

    if (
      metadata.grant_types_supported
      && !metadata.grant_types_supported.includes(grantType)
    ) {
      throw new Error(
        `Incompatible auth server: does not support grant type ${grantType}`,
      )
    }
  }
  else {
    tokenUrl = new URL('/token', serverUrl)
  }

  // Exchange code for tokens
  const params = new URLSearchParams({
    client_id: clientInformation.client_id,
    code: authorizationCode,
    code_verifier: codeVerifier,
    grant_type: grantType,
    redirect_uri: String(redirectUri),
  })

  if (clientInformation.client_secret != null) {
    params.set('client_secret', clientInformation.client_secret)
  }

  const response = await fetch(tokenUrl, {
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: HTTP ${response.status}`)
  }

  return parse(OAuthTokensSchema, await response.json())
}

/**
 * Exchange a refresh token for an updated access token.
 */
export const refreshAuthorization = async (
  serverUrl: string | URL,
  {
    clientInformation,
    metadata,
    refreshToken,
  }: {
    clientInformation: OAuthClientInformation
    metadata?: OAuthMetadata
    refreshToken: string
  },
): Promise<OAuthTokens> => {
  const grantType = 'refresh_token'

  let tokenUrl: URL
  if (metadata) {
    tokenUrl = new URL(metadata.token_endpoint)

    if (
      metadata.grant_types_supported
      && !metadata.grant_types_supported.includes(grantType)
    ) {
      throw new Error(
        `Incompatible auth server: does not support grant type ${grantType}`,
      )
    }
  }
  else {
    tokenUrl = new URL('/token', serverUrl)
  }

  // Exchange refresh token
  const params = new URLSearchParams({
    client_id: clientInformation.client_id,
    grant_type: grantType,
    refresh_token: refreshToken,
  })

  if (clientInformation.client_secret != null) {
    params.set('client_secret', clientInformation.client_secret)
  }

  const response = await fetch(tokenUrl, {
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: HTTP ${response.status}`)
  }

  return parse(OAuthTokensSchema, await response.json())
}

/**
 * Performs OAuth 2.0 Dynamic Client Registration according to RFC 7591.
 */
export const registerClient = async (
  serverUrl: string | URL,
  {
    clientMetadata,
    metadata,
  }: {
    clientMetadata: OAuthClientMetadata
    metadata?: OAuthMetadata
  },
): Promise<OAuthClientInformationFull> => {
  let registrationUrl: URL

  if (metadata) {
    if (metadata.registration_endpoint == null) {
      throw new Error('Incompatible auth server: does not support dynamic client registration')
    }

    registrationUrl = new URL(metadata.registration_endpoint)
  }
  else {
    registrationUrl = new URL('/register', serverUrl)
  }

  const response = await fetch(registrationUrl, {
    body: JSON.stringify(clientMetadata),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Dynamic client registration failed: HTTP ${response.status}`)
  }

  return parse(OAuthClientInformationFullSchema, await response.json())
}

/**
 * Begins the authorization flow with the given server, by generating a PKCE challenge and constructing the authorization URL.
 */
export const startAuthorization = async (
  serverUrl: string | URL,
  {
    clientInformation,
    metadata,
    redirectUrl,
  }: {
    clientInformation: OAuthClientInformation
    metadata?: OAuthMetadata
    redirectUrl: string | URL
  },
): Promise<{ authorizationUrl: URL, codeVerifier: string }> => {
  const responseType = 'code'
  const codeChallengeMethod = 'S256'

  let authorizationUrl: URL
  if (metadata) {
    authorizationUrl = new URL(metadata.authorization_endpoint)

    if (!metadata.response_types_supported.includes(responseType)) {
      throw new Error(
        `Incompatible auth server: does not support response type ${responseType}`,
      )
    }

    if (
      !metadata.code_challenge_methods_supported
      || !metadata.code_challenge_methods_supported.includes(codeChallengeMethod)
    ) {
      throw new Error(
        `Incompatible auth server: does not support code challenge method ${codeChallengeMethod}`,
      )
    }
  }
  else {
    authorizationUrl = new URL('/authorize', serverUrl)
  }

  // Generate PKCE challenge
  const challenge = await pkceChallenge()
  const codeVerifier = challenge.code_verifier
  const codeChallenge = challenge.code_challenge

  authorizationUrl.searchParams.set('response_type', responseType)
  authorizationUrl.searchParams.set('client_id', clientInformation.client_id)
  authorizationUrl.searchParams.set('code_challenge', codeChallenge)
  authorizationUrl.searchParams.set(
    'code_challenge_method',
    codeChallengeMethod,
  )
  authorizationUrl.searchParams.set('redirect_uri', String(redirectUrl))

  return { authorizationUrl, codeVerifier }
}

/**
 * Orchestrates the full auth flow with a server.
 *
 * This can be used as a single entry point for all authorization functionality,
 * instead of linking together the other lower-level functions in this module.
 */
export const auth = async (
  provider: OAuthClientProvider,
  { authorizationCode, serverUrl }: { authorizationCode?: string, serverUrl: string | URL },
): Promise<AuthResult> => {
  const metadata = await discoverOAuthMetadata(serverUrl)

  // Handle client registration if needed
  let clientInformation = await Promise.resolve(provider.clientInformation())
  if (!clientInformation) {
    if (authorizationCode !== undefined) {
      throw new Error('Existing OAuth client information is required when exchanging an authorization code')
    }

    if (!provider.saveClientInformation) {
      throw new Error('OAuth client information must be saveable for dynamic registration')
    }

    const fullInformation = await registerClient(serverUrl, {
      clientMetadata: provider.clientMetadata,
      metadata,
    })

    await provider.saveClientInformation(fullInformation)
    clientInformation = fullInformation
  }

  // Exchange authorization code for tokens
  if (authorizationCode !== undefined) {
    const codeVerifier = await provider.codeVerifier()
    const tokens = await exchangeAuthorization(serverUrl, {
      authorizationCode,
      clientInformation,
      codeVerifier,
      metadata,
      redirectUri: provider.redirectUrl,
    })

    await provider.saveTokens(tokens)
    return 'AUTHORIZED'
  }

  const tokens = await provider.tokens()

  // Handle token refresh or new authorization
  if ((tokens?.refresh_token) != null) {
    try {
      // Attempt to refresh the token
      const newTokens = await refreshAuthorization(serverUrl, {
        clientInformation,
        metadata,
        refreshToken: tokens.refresh_token,
      })

      await provider.saveTokens(newTokens)
      return 'AUTHORIZED'
    }
    catch (error) {
      console.error('Could not refresh OAuth tokens:', error)
    }
  }

  // Start new authorization flow
  const { authorizationUrl, codeVerifier } = await startAuthorization(serverUrl, {
    clientInformation,
    metadata,
    redirectUrl: provider.redirectUrl,
  })

  await provider.saveCodeVerifier(codeVerifier)
  await provider.redirectToAuthorization(authorizationUrl)
  return 'REDIRECT'
}
