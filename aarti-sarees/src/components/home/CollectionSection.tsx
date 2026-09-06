import Link from "next/link";
import { Product } from "@/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";

export function CollectionSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-[var(--muted)] text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
          <Link href={viewAllHref}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
