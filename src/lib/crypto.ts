export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function toHex(buffer: ArrayBuffer): string {
  const view = new DataView(buffer)
  const hex: string[] = []
  for (let i = 0; i < view.byteLength; i++) {
    const v = view.getUint8(i).toString(16).padStart(2, '0')
    hex.push(v)
  }
  return hex.join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}
