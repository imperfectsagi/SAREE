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

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
  } = useCart();
  const business = useBusinessSettings();

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 drawer-overlay"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-[var(--surface)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            Your Cart ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-[var(--background)]"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <p className="text-[var(--muted)]">Your cart is empty</p>
              <Button onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <li
                    key={item.product.id}
                    className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-0"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="relative w-20 h-24 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--background)]"
                    >
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium line-clamp-2 hover:text-[var(--primary)]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm font-semibold text-[var(--primary)] mt-1">
                        {formatPrice(price)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[var(--border)] rounded-[var(--radius-sm)]">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[var(--background)]"
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
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[var(--background)]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-xs text-[var(--muted)] hover:text-[var(--error)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] space-y-3 bg-[var(--background)]">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-xl font-semibold text-[var(--primary)]">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" fullWidth size="lg">
                Send Inquiry on WhatsApp
              </Button>
            </a>
            <div className="flex gap-2">
              <Link href="/cart" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" fullWidth>
                  View Cart
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
