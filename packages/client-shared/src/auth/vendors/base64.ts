const base64abc = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/']

export const encodeBase64 = (data: ArrayBuffer): string => {
  // eslint-disable-next-line @masknet/array-prefer-from
  const uint8 = new Uint8Array(data)
  let result = ''
  let i
  const l = uint8.length
  for (i = 2; i < l; i += 3) {
    result += base64abc[(uint8[i - 2]) >> 2]
    result += base64abc[
      (((uint8[i - 2]) & 0x03) << 4)
      | ((uint8[i - 1]) >> 4)
    ]
    result += base64abc[
      (((uint8[i - 1]) & 0x0F) << 2)
      | ((uint8[i]) >> 6)
    ]
    result += base64abc[(uint8[i]) & 0x3F]
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[(uint8[i - 2]) >> 2]
    result += base64abc[((uint8[i - 2]) & 0x03) << 4]
    result += '=='
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[(uint8[i - 2]) >> 2]
    result += base64abc[
      (((uint8[i - 2]) & 0x03) << 4)
      | ((uint8[i - 1]) >> 4)
    ]
    result += base64abc[((uint8[i - 1]) & 0x0F) << 2]
    result += '='
  }
  return result
}
