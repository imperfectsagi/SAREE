import { getDb } from "@/lib/db";
import { CategoriesManager } from "./CategoriesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const db = getDb();
  const { results: categories } = await db
    .prepare(
      `SELECT id, name, slug, description, is_enabled, sort_order FROM categories ORDER BY sort_order ASC`
    )
    .all();
  const { results: subcategories } = await db
    .prepare(
      `SELECT id, category_id, name, slug, is_enabled, sort_order FROM subcategories ORDER BY category_id, sort_order ASC`
    )
    .all();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Categories</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Manage top-level categories (Sarees, Suits) and their subcategories.
      </p>
      <CategoriesManager
        initialCategories={categories as never}
        initialSubcategories={subcategories as never}
      />
    </div>
  );
}
