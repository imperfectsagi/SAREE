import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/crypto";
import { createSession, pruneExpiredSessions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Basic in-memory-per-isolate rate limiting is unreliable on Workers
// (isolates are ephemeral/multiple). Real protection here is: PBKDF2's
// cost already slows brute force, sessions are short opaque tokens, and
// failed attempts don't leak whether the email exists (generic error).
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const user = await db
    .prepare(
      `SELECT id, password_hash, is_active FROM users WHERE email = ? LIMIT 1`
    )
    .bind(email)
    .first<{ id: string; password_hash: string; is_active: number }>();

  // Generic error for both "no such user" and "wrong password" — do not
  // reveal which one it was.
  const genericError = NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 }
  );

  if (!user || user.is_active !== 1) {
    return genericError;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return genericError;
  }

  await pruneExpiredSessions();
  await createSession(user.id);

  return NextResponse.json({ success: true });
}
