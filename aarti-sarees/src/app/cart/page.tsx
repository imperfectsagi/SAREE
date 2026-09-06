"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import { formatPrice } from "@/data/products";
import { Button } from "@/components/ui/Button";
import {
  buildWhatsAppUrl,
  cartInquiryMessage,
} from "@/data/business";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const business = useBusinessSettings();

  const waMessage = cartInquiryMessage(
    items.map((i) => ({
      name: i.product.name,
      qty: i.quantity,
      price: (i.product.salePrice ?? i.product.price) * i.quantity,
    })),
    totalPrice
  );
  const waUrl = buildWhatsAppUrl(waMessage, business.whatsapp);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-[var(--muted)] text-lg">Your cart is empty</p>
          <Link href="/sarees">
            <Button>Browse Sarees</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden bg-[var(--surface)]">
            {items.map((item) => {
              const price = item.product.salePrice ?? item.product.price;
              return (
                <li
                  key={item.product.id}
                  className="flex gap-4 p-4 sm:p-5"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--background)]"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-[var(--primary)] line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-[var(--primary)] font-semibold mt-1">
                        {formatPrice(price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-[var(--border)] rounded-[var(--radius-sm)]">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-[var(--background)]"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-[var(--background)]"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold w-20 text-right">
                        {formatPrice(price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-sm text-[var(--muted)] hover:text-[var(--error)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
            <div>
              <p className="text-sm text-[var(--muted)]">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
              <p className="text-2xl font-semibold text-[var(--primary)]">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="ghost" onClick={clearCart}>
                Clear Cart
              </Button>
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" size="lg">
                  Send Inquiry on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
