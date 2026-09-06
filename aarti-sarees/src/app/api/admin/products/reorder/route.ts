import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Body: { order: string[] } — array of product IDs in the new desired order.
export async function POST(req: NextRequest) {
  return withAuth("products.write", async () => {
    const body = (await req.json()) as { order: string[] };
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = getDb();
    const stmts = body.order.map((id, index) =>
      db
        .prepare(`UPDATE products SET sort_order = ? WHERE id = ?`)
        .bind(index, id)
    );
    await db.batch(stmts);

    return NextResponse.json({ success: true });
  });
}
