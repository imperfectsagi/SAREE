import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
