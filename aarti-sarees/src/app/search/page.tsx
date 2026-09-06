import { Suspense } from "react";
import { searchProductsDb } from "@/lib/repo/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchForm } from "@/components/product/SearchForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search",
  description: "Search Aarti Sarees' collection of sarees and suits.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SearchResults query={searchParams.q ?? ""} />
    </Suspense>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = query ? await searchProductsDb(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--primary)]">
          Search
        </h1>
        <SearchForm initialQuery={query} />
        {query && (
          <p className="text-sm text-[var(--muted)]">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {query ? (
        <ProductGrid
          products={results}
          emptyMessage={`No products found for "${query}". Try “Banarasi”, “Anarkali”, or “Wedding”.`}
        />
      ) : (
        <p className="text-[var(--muted)] py-12 text-center">
          Try searching for a fabric, color, or occasion — e.g. “Banarasi”,
          “Anarkali”, “Wedding”.
        </p>
      )}
    </div>
  );
}
