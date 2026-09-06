import "server-only";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { generateSessionToken } from "@/lib/auth/crypto";

export const SESSION_COOKIE = "aarti_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
};

/** Creates a new session row and sets the session cookie. Call after verifying credentials. */
export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await db
    .prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, userId, expiresAt)
    .run();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Reads the session cookie, validates it against D1, and returns the user (or null). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')
         AND u.is_active = 1`
    )
    .bind(token)
    .first<SessionUser>();

  return row ?? null;
}

/** Destroys the current session (logout). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    await db.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Deletes expired sessions. Safe to call opportunistically (e.g. on login). */
export async function pruneExpiredSessions(): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `DELETE FROM sessions WHERE expires_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now')`
    )
    .run();
}
