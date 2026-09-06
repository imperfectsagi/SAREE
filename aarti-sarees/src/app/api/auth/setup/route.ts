import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

// One-time bootstrap: creates the first SUPER ADMIN account. This route
// deliberately requires NO authentication (there is no admin yet to
// authenticate as) — but it self-disables the instant one user exists in
// the `users` table, which is why no default/weak password ever ships
// with the project. Run this exactly once immediately after your first
// deploy, then it becomes permanently inert.
export async function POST(req: NextRequest) {
  const db = getDb();

  const existing = await db
    .prepare(`SELECT COUNT(*) as count FROM users`)
    .first<{ count: number }>();

  if (existing && existing.count > 0) {
    return NextResponse.json(
      {
        error:
          "Setup already completed. An admin account already exists — use /admin/login instead.",
      },
      { status: 403 }
    );
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 10) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const id = generateId();

  await db
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'super_admin', 1)`
    )
    .bind(id, name, email, passwordHash)
    .run();

  return NextResponse.json({ success: true });
}

/** Lets the setup page check whether setup has already run, before showing the form. */
export async function GET() {
  const db = getDb();
  const existing = await db
    .prepare(`SELECT COUNT(*) as count FROM users`)
    .first<{ count: number }>();
  return NextResponse.json({ needsSetup: !existing || existing.count === 0 });
}
