import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_SECONDS } from './constants';

const SESSION_TOKEN_BYTES = 32;
const MS_PER_SECOND = 1000;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SESSION_TOKEN_BYTES));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  for (const cookie of cookieHeader.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === ADMIN_SESSION_COOKIE) return valueParts.join('=') || null;
  }
  return null;
}

function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearedSessionCookie(): string {
  return sessionCookie('', 0);
}

/** Starts a session and returns the Set-Cookie header value for it. */
export async function createAdminSession(db: D1Database, accountId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * MS_PER_SECOND;
  await db.batch([
    db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(Date.now()),
    db
      .prepare('INSERT INTO admin_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)')
      .bind(await hashToken(token), accountId, expiresAt),
  ]);
  return sessionCookie(token, ADMIN_SESSION_TTL_SECONDS);
}

export async function hasAdminSession(request: Request, db: D1Database, accountId: string): Promise<boolean> {
  const token = readSessionToken(request);
  if (!token) return false;
  const session = await db
    .prepare('SELECT 1 AS found FROM admin_sessions WHERE token_hash = ? AND account_id = ? AND expires_at > ?')
    .bind(await hashToken(token), accountId, Date.now())
    .first();
  return session !== null;
}

export async function endAdminSession(request: Request, db: D1Database): Promise<void> {
  const token = readSessionToken(request);
  if (!token) return;
  await db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await hashToken(token)).run();
}

export async function endAllAdminSessions(db: D1Database, accountId: string): Promise<void> {
  await db.prepare('DELETE FROM admin_sessions WHERE account_id = ?').bind(accountId).run();
}
