import Link from "next/link";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin/products"
          style={{ fontSize: 12.5, color: "var(--admin-text-muted)", textDecoration: "none" }}
        >
          ← Back to Products
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
