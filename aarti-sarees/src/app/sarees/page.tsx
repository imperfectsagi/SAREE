import { Suspense } from "react";
import { getProductsByCategoryDb } from "@/lib/repo/products";
import { ProductListing } from "@/components/product/ProductListing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sarees Collection",
  description:
    "Explore our exquisite collection of Banarasi, Kanjeevaram, Designer, Party Wear and Wedding sarees.",
};

export default async function SareesPage() {
  const products = await getProductsByCategoryDb("sarees");

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProductListing
        products={products}
        categorySlug="sarees"
        title="Sarees Collection"
        description="From timeless Banarasi silks to contemporary designer pieces — find the perfect saree for every occasion."
      />
    </Suspense>
  );
}
