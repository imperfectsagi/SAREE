import { notFound } from "next/navigation";
import { getProductBySlugDb } from "@/lib/repo/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { SITE_URL } from "@/lib/site";

// Admin-editable content — render fresh from D1 rather than at build
// time, so publishing/editing a product in Admin shows up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);
  if (!product) return { title: "Product Not Found" };
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

function productJsonLd(
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlugDb>>>
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.salePrice ?? product.price,
      availability:
        product.availability === "in-stock"
          ? "https://schema.org/InStock"
          : product.availability === "low-stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
