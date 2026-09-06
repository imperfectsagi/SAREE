// Centralized image URLs - replace these later with real assets
// All product/category/hero images live here for easy replacement

export const images = {
  // Hero
  heroDesktop: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80",
  heroMobile: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
  heroVideoPlaceholder: "", // optional video src later

  // Category banners
  sareesBanner: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80",
  suitsBanner: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80",

  // Featured categories
  catDesigner: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  catParty: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
  catTraditional: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
  catWedding: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
  catDaily: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
  catAnarkali: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  catSalwar: "https://images.unsplash.com/photo-1610030469730-0d0a2c5f7d5a?w=600&q=80",
  catPunjabi: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&q=80",

  // Promo
  promoBanner: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1400&q=80",

  // Store / About
  storeImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80",
  aboutImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1000&q=80",

  // Blog
  blog1: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
  blog2: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80",
  blog3: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
  blog4: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",

  // Product placeholders (will be overridden per product)
  placeholder: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
} as const;

// Helper for consistent product image arrays
export function productImages(base: string, count = 4): string[] {
  // In real app these would be different angles; for demo we reuse with slight variations
  return Array.from({ length: count }, (_, i) =>
    base.includes("?") ? `${base}&v=${i}` : `${base}?v=${i}`
  );
}
