export const convertBase64ToBase64url = (b64: string) => {
  return b64.endsWith('=')
    // eslint-disable-next-line sonarjs/no-nested-conditional
    ? b64.endsWith('==')
      ? b64.replace(/\+/g, '-').replace(/\//g, '_').slice(0, -2)
      : b64.replace(/\+/g, '-').replace(/\//g, '_').slice(0, -1)
    : b64.replace(/\+/g, '-').replace(/\//g, '_')
}
