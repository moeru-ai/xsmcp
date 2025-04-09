import { encodeBase64 } from './base64'
import { convertBase64ToBase64url } from './base64url'

export const generateChallenge = async (code_verifier: string) =>
  convertBase64ToBase64url(encodeBase64(await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code_verifier),
  )))

export const verifyChallenge = async (
  code_verifier: string,
  expectedChallenge: string,
) => {
  const actualChallenge = await generateChallenge(code_verifier)
  return actualChallenge === expectedChallenge
}

const getRandomValues = async (size: number) =>
  // eslint-disable-next-line @masknet/array-prefer-from
  globalThis.crypto.getRandomValues(new Uint8Array(size))

const generateVerifier = async (length: number): Promise<string> => {
  const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'
  let result = ''
  const randomUInts = await getRandomValues(length)
  for (let i = 0; i < length; i++) {
    // cap the value of the randomIndex to mask.length - 1
    const randomIndex = randomUInts[i] % mask.length
    result += mask[randomIndex]
  }
  return result
}

export const pkceChallenge = async (length?: number): Promise<{
  code_challenge: string
  code_verifier: string
}> => {
  if (length == null)
    length = 43

  if (length < 43 || length > 128)
    throw new Error(`Expected a length between 43 and 128. Received ${length}.`)

  const code_verifier = await generateVerifier(length)
  const code_challenge = await generateChallenge(code_verifier)
  return {
    code_challenge,
    code_verifier,
  }
}
