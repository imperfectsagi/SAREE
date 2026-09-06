import { Suspense } from "react";
import { getProductsByCategoryDb } from "@/lib/repo/products";
import { ProductListing } from "@/components/product/ProductListing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suits Collection",
  description: "Elegant Anarkali, Salwar, Punjabi, Party Wear and Festive suits.",
};

export default async function SuitsPage() {
  const products = await getProductsByCategoryDb("suits");

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProductListing
        products={products}
        categorySlug="suits"
        title="Suits Collection"
        description="Discover our range of Anarkali, Punjabi, Salwar and festive suits crafted for comfort and elegance."
      />
    </Suspense>
  );
}
