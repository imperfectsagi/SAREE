"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/data/products";
import { Badge, badgeVariantFromLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import { buildWhatsAppUrl, productInquiryMessage } from "@/data/business";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const business = useBusinessSettings();
  const displayPrice = product.salePrice ?? product.price;
  const hasSale = !!product.salePrice;

  const waMessage = productInquiryMessage(
    product.name,
    formatPrice(displayPrice)
  );
  const waUrl = buildWhatsAppUrl(waMessage, business.whatsapp);

  return (
    <article className="group relative flex flex-col bg-[var(--surface)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] hover:shadow-[var(--shadow)] transition-shadow duration-300">
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-product relative overflow-hidden bg-[var(--background)]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={badgeVariantFromLabel(product.badge)}>
                {product.badge}
              </Badge>
            </div>
          )}
          {product.availability === "low-stock" && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="stock">Low Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-medium text-[var(--text)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-[var(--primary)]">
            {formatPrice(displayPrice)}
          </span>
          {hasSale && (
            <span className="text-sm text-[var(--muted)] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => addItem(product)}
            disabled={product.availability === "out-of-stock"}
          >
            Add to Cart
          </Button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="whatsapp" size="sm" fullWidth>
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}
