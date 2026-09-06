"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Product,
  formatPrice,
  getRelatedProducts,
} from "@/data/products";
import { Badge, badgeVariantFromLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "./ProductGrid";
import { useCart } from "@/context/CartContext";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import { buildWhatsAppUrl, productInquiryMessage } from "@/data/business";

export function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const business = useBusinessSettings();

  const displayPrice = product.salePrice ?? product.price;
  const hasSale = !!product.salePrice;
  const related = getRelatedProducts(product);

  const waMessage = productInquiryMessage(
    product.name,
    formatPrice(displayPrice)
  );
  const waUrl = buildWhatsAppUrl(waMessage, business.whatsapp);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)] mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-[var(--primary)]">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/${product.category}`}
          className="hover:text-[var(--primary)] capitalize"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[var(--text)] line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-product rounded-[var(--radius)] overflow-hidden bg-[var(--background)] border border-[var(--border)]">
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant={badgeVariantFromLabel(product.badge)}>
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-colors ${
                  activeImage === i
                    ? "border-[var(--primary)]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold leading-tight">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)] capitalize">
              {product.fabric} · {product.subcategory.replace("-", " ")}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[var(--primary)]">
              {formatPrice(displayPrice)}
            </span>
            {hasSale && (
              <>
                <span className="text-lg text-[var(--muted)] line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="sale">
                  {Math.round(
                    ((product.price - displayPrice) / product.price) * 100
                  )}
                  % OFF
                </Badge>
              </>
            )}
          </div>

          {/* Availability */}
          <p className="text-sm">
            {product.availability === "in-stock" && (
              <span className="text-[var(--success)] font-medium">
                ● In Stock
              </span>
            )}
            {product.availability === "low-stock" && (
              <span className="text-[var(--warning)] font-medium">
                ● Low Stock — Order soon
              </span>
            )}
            {product.availability === "out-of-stock" && (
              <span className="text-[var(--error)] font-medium">
                ● Out of Stock
              </span>
            )}
          </p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Color: <span className="font-normal">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedColor === c
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Size: <span className="font-normal">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] px-3 py-1.5 text-sm rounded-[var(--radius-sm)] border transition-colors ${
                      selectedSize === s
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="inline-flex items-center border border-[var(--border)] rounded-[var(--radius-sm)]">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--background)]"
              >
                −
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-[var(--background)]"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="lg"
              className="flex-1"
              onClick={() =>
                addItem(product, qty, {
                  color: selectedColor,
                  size: selectedSize,
                })
              }
              disabled={product.availability === "out-of-stock"}
            >
              Add to Cart
            </Button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="whatsapp" size="lg" fullWidth>
                WhatsApp Inquiry
              </Button>
            </a>
          </div>
          <a href={`tel:${business.phoneRaw}`}>
            <Button variant="outline" size="lg" fullWidth>
              Call Now · {business.phone}
            </Button>
          </a>

          {/* Details */}
          <div className="pt-4 border-t border-[var(--border)] space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-[var(--muted)]">Fabric</span>
              <span>{product.fabric}</span>
              <span className="text-[var(--muted)]">Occasion</span>
              <span>{product.occasion.join(", ")}</span>
              <span className="text-[var(--muted)]">Category</span>
              <span className="capitalize">
                {product.category} / {product.subcategory.replace("-", " ")}
              </span>
            </div>
            <div className="pt-2">
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl md:text-2xl font-serif font-semibold mb-6">
            You May Also Like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
