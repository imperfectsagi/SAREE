import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { hashPassword, generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth("users.write", async () => {
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at ASC`
      )
      .all();
    return NextResponse.json({ users: results });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("users.write", async () => {
    const body = (await req.json()) as {
      name: string;
      email: string;
      password: string;
      role: "super_admin" | "admin" | "editor";
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }
    if (body.password.length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters" },
        { status: 400 }
      );
    }
    if (!["super_admin", "admin", "editor"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const db = getDb();
    const existing = await db
      .prepare(`SELECT 1 FROM users WHERE email = ?`)
      .bind(body.email.trim().toLowerCase())
      .first();
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const id = generateId();
    const passwordHash = await hashPassword(body.password);
    await db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, 1)`
      )
      .bind(id, body.name.trim(), body.email.trim().toLowerCase(), passwordHash, body.role)
      .run();

    return NextResponse.json({ id }, { status: 201 });
  });
}
