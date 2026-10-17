import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const TOKEN_BYTES = 32

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function tokenMatchesHash(token: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashToken(token), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  return candidate.length === stored.length && timingSafeEqual(candidate, stored)
}
