"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/data/products";
import { ProductGrid } from "./ProductGrid";
import {
  ProductFilters,
  SortSelect,
  type FilterState,
  type SortOption,
} from "./ProductFilters";
import { Button } from "@/components/ui/Button";

const defaultFilters: FilterState = {
  subcategory: "",
  priceMin: 0,
  priceMax: 999999,
  color: "",
  size: "",
  fabric: "",
  occasion: "",
  availability: "",
};

export function ProductListing({
  products,
  categorySlug,
  title,
  description,
}: {
  products: Product[];
  categorySlug?: "sarees" | "suits";
  title: string;
  description?: string;
}) {
  const searchParams = useSearchParams();
  const initialSub = searchParams.get("sub") || "";

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    subcategory: initialSub,
  });
  const [sort, setSort] = useState<SortOption>("latest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (filters.subcategory) {
      list = list.filter((p) => p.subcategory === filters.subcategory);
    }
    list = list.filter((p) => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceMin && price <= filters.priceMax;
    });
    if (filters.color) {
      list = list.filter((p) =>
        p.colors.some((c) =>
          c.toLowerCase().includes(filters.color.toLowerCase())
        )
      );
    }
    if (filters.size) {
      list = list.filter((p) => p.sizes.includes(filters.size));
    }
    if (filters.fabric) {
      list = list.filter((p) =>
        p.fabric.toLowerCase().includes(filters.fabric.toLowerCase())
      );
    }
    if (filters.occasion) {
      list = list.filter((p) =>
        p.occasion.some((o) =>
          o.toLowerCase().includes(filters.occasion.toLowerCase())
        )
      );
    }
    if (filters.availability) {
      list = list.filter((p) => p.availability === filters.availability);
    }

    switch (sort) {
      case "price-asc":
        list.sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
        );
        break;
      case "featured":
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "latest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return list;
  }, [products, filters, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[var(--muted)] text-sm md:text-base max-w-2xl">
            {description}
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              categorySlug={categorySlug}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6">
            <p className="text-sm text-[var(--muted)]">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                Filters
              </Button>
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <ProductGrid
            products={filtered}
            emptyMessage="No products match your filters. Try adjusting them."
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 drawer-overlay"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--surface)] rounded-t-[var(--radius-lg)] overflow-y-auto shadow-2xl">
            <ProductFilters
              categorySlug={categorySlug}
              filters={filters}
              onChange={setFilters}
              onClose={() => setMobileFiltersOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
