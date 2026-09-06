import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { AuthError } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireUser("users.write");
    const { id } = await params;
    const body = (await req.json()) as {
      name: string;
      role: "super_admin" | "admin" | "editor";
      isActive: boolean;
    };

    const db = getDb();

    // Prevent demoting/deactivating the last remaining super_admin — this
    // would lock everyone out of user management permanently.
    if (body.role !== "super_admin" || body.isActive === false) {
      const target = await db
        .prepare(`SELECT role FROM users WHERE id = ?`)
        .bind(id)
        .first<{ role: string }>();
      if (target?.role === "super_admin") {
        const { count } = (await db
          .prepare(
            `SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND is_active = 1`
          )
          .first<{ count: number }>()) ?? { count: 0 };
        if (count <= 1) {
          return NextResponse.json(
            { error: "Cannot remove the last active Super Admin." },
            { status: 400 }
          );
        }
      }
    }

    await db
      .prepare(
        `UPDATE users SET name = ?, role = ?, is_active = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         WHERE id = ?`
      )
      .bind(body.name.trim(), body.role, body.isActive ? 1 : 0, id)
      .run();

    return NextResponse.json({ success: true, currentUserId: currentUser.id });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireUser("users.write");
    const { id } = await params;

    if (id === currentUser.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const db = getDb();
    const target = await db
      .prepare(`SELECT role FROM users WHERE id = ?`)
      .bind(id)
      .first<{ role: string }>();

    if (target?.role === "super_admin") {
      const { count } = (await db
        .prepare(
          `SELECT COUNT(*) as count FROM users WHERE role = 'super_admin' AND is_active = 1`
        )
        .first<{ count: number }>()) ?? { count: 0 };
      if (count <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last active Super Admin." },
          { status: 400 }
        );
      }
    }

    await db.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
