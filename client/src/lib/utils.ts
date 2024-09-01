export function dex2hex(dec: number) {
  return dec.toString(16).padStart(2, '0')
}

export function generatedId(len = 10) {
  const arr = new Uint8Array(len / 2)
  crypto.getRandomValues(arr)
  return Array.from(arr, dex2hex).join('')
}
