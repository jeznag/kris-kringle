// Standalone (no imports) so scripts/hash-admin-password.mjs can run it under Node too.

// Cloudflare Workers reject PBKDF2 above 100,000 iterations.
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const DERIVED_KEY_BITS = 256;
const HASH_SCHEME = 'pbkdf2-sha256';
const HASH_SEPARATOR = '$';

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    DERIVED_KEY_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derivedKey = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return [HASH_SCHEME, PBKDF2_ITERATIONS, toBase64(salt), toBase64(derivedKey)].join(HASH_SEPARATOR);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, iterations, salt, expectedKey] = storedHash.split(HASH_SEPARATOR);
  if (scheme !== HASH_SCHEME || !iterations || !salt || !expectedKey) return false;
  const derivedKey = await deriveKey(password, fromBase64(salt), Number(iterations));
  return constantTimeEqual(derivedKey, fromBase64(expectedKey));
}
