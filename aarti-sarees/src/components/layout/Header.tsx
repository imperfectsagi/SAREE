"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import { buildWhatsAppUrl } from "@/data/business";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sarees", label: "Sarees" },
  { href: "/suits", label: "Suits" },
  { href: "/categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const pathname = usePathname();
  const business = useBusinessSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu & search overlay on route change.
  // Guarded with a ref (not plain state-in-effect) so it only fires on
  // actual navigation, not on every render — avoids cascading re-renders.
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setMobileOpen(false);
      setSearchOpen(false);
    }
  }, [pathname]);

  const waUrl = buildWhatsAppUrl(
    `Hello ${business.name}! I would like to know more about your collection.`,
    business.whatsapp
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-[var(--surface)]/95 backdrop-blur-md shadow-sm border-b border-[var(--border)]"
            : "bg-[var(--surface)] border-b border-transparent"
        )}
      >
        {/* Top bar */}
        <div className="hidden md:block bg-[var(--primary)] text-white text-xs py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span>Free consultation · Authentic ethnic wear</span>
            <a href={`tel:${business.phoneRaw}`} className="hover:underline">
              {business.phone}
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-[var(--primary)]">
                Aarti <span className="text-[var(--accent)]">Sarees</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors",
                    pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href))
                      ? "text-[var(--primary)] bg-[var(--background)]"
                      : "text-[var(--text)] hover:text-[var(--primary)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-[var(--background)] transition-colors"
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-[var(--background)] transition-colors"
                aria-label="Cart"
              >
                <CartIcon />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-[var(--primary)] text-white rounded-full px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-[#25D366] text-white rounded-[var(--radius-sm)] hover:bg-[#1ebe57] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>

              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2.5 rounded-full hover:bg-[var(--background)]"
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 drawer-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[min(320px,85vw)] bg-[var(--surface)] shadow-xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-serif text-lg font-semibold text-[var(--primary)]">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-[var(--background)]"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-[var(--radius)] text-base font-medium",
                    pathname === link.href
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text)] hover:bg-[var(--background)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/about"
                className="px-4 py-3 rounded-[var(--radius)] text-base font-medium text-[var(--text)] hover:bg-[var(--background)]"
              >
                About Us
              </Link>
            </nav>
            <div className="p-4 border-t border-[var(--border)] space-y-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-[var(--radius)] font-medium"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${business.phoneRaw}`}
                className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--border)] rounded-[var(--radius)] font-medium"
              >
                Call {business.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 drawer-overlay" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-[var(--surface)] shadow-lg p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
            <input
              autoFocus
              type="search"
              placeholder="Search sarees, suits, fabrics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  onClose();
                }
              }}
              className="flex-1 text-lg bg-transparent outline-none placeholder:text-[var(--muted)]"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--background)]"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Press Enter to search · Try “Banarasi”, “Anarkali”, “Wedding”
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function CartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}

function MenuIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
