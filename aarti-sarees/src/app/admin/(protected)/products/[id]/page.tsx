import Link from "next/link";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin/products"
          style={{ fontSize: 12.5, color: "var(--admin-text-muted)", textDecoration: "none" }}
        >
          ← Back to Products
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Edit Product</h1>
      </div>
      <ProductForm productId={id} />
    </div>
  );
}
