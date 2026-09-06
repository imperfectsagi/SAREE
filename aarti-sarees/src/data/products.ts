import { productImages } from "./images";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: "sarees" | "suits";
  subcategory: string;
  colors: string[];
  sizes: string[];
  fabric: string;
  occasion: string[];
  availability: "in-stock" | "low-stock" | "out-of-stock";
  badge?: "New" | "Sale" | "Bestseller" | "Limited";
  images: string[];
  featured?: boolean;
  createdAt: string;
};

const sareeImgs = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
  "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&q=80",
];

const suitImgs = [
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  "https://images.unsplash.com/photo-1610030469730-0d0a2c5f7d5a?w=800&q=80",
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&q=80",
  "https://images.unsplash.com/photo-1583391733981-5b0c6f7c1b1a?w=800&q=80",
  "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
  "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80",
];

export const products: Product[] = [
  // Sarees
  {
    id: "s1",
    slug: "banarasi-silk-maroon-gold",
    name: "Banarasi Silk Maroon Gold Zari",
    description:
      "Exquisite pure Banarasi silk saree featuring intricate gold zari work on a rich maroon base. Perfect for weddings and festive occasions. Comes with matching unstitched blouse piece.",
    price: 12999,
    salePrice: 9999,
    category: "sarees",
    subcategory: "wedding",
    colors: ["Maroon", "Gold"],
    sizes: ["Free Size"],
    fabric: "Pure Banarasi Silk",
    occasion: ["Wedding", "Festive"],
    availability: "in-stock",
    badge: "Bestseller",
    images: productImages(sareeImgs[0]),
    featured: true,
    createdAt: "2025-11-01",
  },
  {
    id: "s2",
    slug: "kanjeevaram-temple-border",
    name: "Kanjeevaram Temple Border Saree",
    description:
      "Traditional South Indian Kanjeevaram silk with classic temple border and rich contrast pallu. Lightweight yet luxurious.",
    price: 15999,
    category: "sarees",
    subcategory: "traditional",
    colors: ["Royal Blue", "Gold"],
    sizes: ["Free Size"],
    fabric: "Kanjeevaram Silk",
    occasion: ["Wedding", "Traditional"],
    availability: "in-stock",
    badge: "New",
    images: productImages(sareeImgs[1]),
    featured: true,
    createdAt: "2025-12-15",
  },
  {
    id: "s3",
    slug: "georgette-party-wear-floral",
    name: "Georgette Party Wear Floral",
    description:
      "Lightweight georgette saree with delicate floral embroidery and sequin highlights. Ideal for evening parties and cocktail events.",
    price: 4999,
    salePrice: 3499,
    category: "sarees",
    subcategory: "party-wear",
    colors: ["Black", "Silver"],
    sizes: ["Free Size"],
    fabric: "Georgette",
    occasion: ["Party", "Evening"],
    availability: "in-stock",
    badge: "Sale",
    images: productImages(sareeImgs[2]),
    featured: true,
    createdAt: "2025-10-20",
  },
  {
    id: "s4",
    slug: "designer-organza-pastel",
    name: "Designer Organza Pastel Saree",
    description:
      "Contemporary designer organza saree in soft pastel tones with hand-embroidered motifs. Modern elegance for receptions.",
    price: 8999,
    category: "sarees",
    subcategory: "designer",
    colors: ["Blush Pink", "Ivory"],
    sizes: ["Free Size"],
    fabric: "Organza",
    occasion: ["Party", "Reception"],
    availability: "low-stock",
    badge: "Limited",
    images: productImages(sareeImgs[3]),
    featured: true,
    createdAt: "2026-01-05",
  },
  {
    id: "s5",
    slug: "cotton-linen-daily-wear",
    name: "Cotton Linen Daily Wear",
    description:
      "Breathable cotton-linen blend saree perfect for office and daily wear. Soft drape with minimal border design.",
    price: 2499,
    category: "sarees",
    subcategory: "daily-wear",
    colors: ["Beige", "Olive"],
    sizes: ["Free Size"],
    fabric: "Cotton Linen",
    occasion: ["Daily", "Office"],
    availability: "in-stock",
    images: productImages(sareeImgs[4]),
    createdAt: "2025-09-12",
  },
  {
    id: "s6",
    slug: "tussar-silk-natural-weave",
    name: "Tussar Silk Natural Weave",
    description:
      "Handwoven pure Tussar silk with natural texture and subtle zari. Timeless piece for traditional gatherings.",
    price: 7499,
    category: "sarees",
    subcategory: "traditional",
    colors: ["Natural Gold", "Brown"],
    sizes: ["Free Size"],
    fabric: "Pure Tussar Silk",
    occasion: ["Traditional", "Festive"],
    availability: "in-stock",
    images: productImages(sareeImgs[5]),
    createdAt: "2025-11-22",
  },
  {
    id: "s7",
    slug: "chiffon-ruffle-party",
    name: "Chiffon Ruffle Party Saree",
    description:
      "Flowing chiffon with ruffle border and scattered sequins. Lightweight and glamorous for cocktail parties.",
    price: 3999,
    salePrice: 2799,
    category: "sarees",
    subcategory: "party-wear",
    colors: ["Emerald", "Gold"],
    sizes: ["Free Size"],
    fabric: "Chiffon",
    occasion: ["Party"],
    availability: "in-stock",
    badge: "Sale",
    images: productImages(sareeImgs[0]),
    createdAt: "2025-12-01",
  },
  {
    id: "s8",
    slug: "designer-velvet-winter",
    name: "Designer Velvet Winter Saree",
    description:
      "Luxurious velvet saree with intricate thread work. Perfect for winter weddings and evening events.",
    price: 11999,
    category: "sarees",
    subcategory: "designer",
    colors: ["Deep Wine", "Gold"],
    sizes: ["Free Size"],
    fabric: "Velvet",
    occasion: ["Wedding", "Evening"],
    availability: "in-stock",
    badge: "New",
    images: productImages(sareeImgs[1]),
    featured: true,
    createdAt: "2026-01-10",
  },

  // Suits
  {
    id: "u1",
    slug: "anarkali-floor-length-maroon",
    name: "Floor Length Anarkali Maroon",
    description:
      "Elegant floor-length Anarkali suit with heavy embroidery on the yoke and sleeves. Includes matching dupatta and bottom.",
    price: 8999,
    salePrice: 6999,
    category: "suits",
    subcategory: "anarkali",
    colors: ["Maroon", "Gold"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Georgette with Silk Lining",
    occasion: ["Wedding", "Festive"],
    availability: "in-stock",
    badge: "Bestseller",
    images: productImages(suitImgs[0]),
    featured: true,
    createdAt: "2025-11-15",
  },
  {
    id: "u2",
    slug: "punjabi-suit-phulkari",
    name: "Punjabi Suit Phulkari Work",
    description:
      "Authentic Punjabi suit featuring traditional Phulkari embroidery. Comfortable cotton silk blend with vibrant colors.",
    price: 5499,
    category: "suits",
    subcategory: "punjabi",
    colors: ["Mustard", "Red"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "Cotton Silk",
    occasion: ["Festive", "Traditional"],
    availability: "in-stock",
    badge: "New",
    images: productImages(suitImgs[1]),
    featured: true,
    createdAt: "2025-12-20",
  },
  {
    id: "u3",
    slug: "salwar-kameez-daily",
    name: "Comfort Salwar Kameez Set",
    description:
      "Soft cotton salwar kameez ideal for daily wear and office. Simple yet elegant with delicate lace detailing.",
    price: 2999,
    category: "suits",
    subcategory: "salwar",
    colors: ["Sky Blue", "White"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Cotton",
    occasion: ["Daily", "Office"],
    availability: "in-stock",
    images: productImages(suitImgs[2]),
    createdAt: "2025-10-05",
  },
  {
    id: "u4",
    slug: "party-wear-sharara-set",
    name: "Party Wear Sharara Set",
    description:
      "Stunning sharara set with heavy stone work and sequins. Perfect statement outfit for sangeet and parties.",
    price: 9999,
    salePrice: 7999,
    category: "suits",
    subcategory: "party-wear",
    colors: ["Black", "Silver"],
    sizes: ["S", "M", "L"],
    fabric: "Chinon with Net",
    occasion: ["Party", "Sangeet"],
    availability: "low-stock",
    badge: "Sale",
    images: productImages(suitImgs[3]),
    featured: true,
    createdAt: "2025-11-28",
  },
  {
    id: "u5",
    slug: "festive-silk-suit-gold",
    name: "Festive Silk Suit Gold Work",
    description:
      "Rich silk suit with all-over gold thread work. Ideal for Diwali, Eid and other festive celebrations.",
    price: 7499,
    category: "suits",
    subcategory: "festive",
    colors: ["Magenta", "Gold"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Pure Silk",
    occasion: ["Festive"],
    availability: "in-stock",
    badge: "Limited",
    images: productImages(suitImgs[4]),
    featured: true,
    createdAt: "2025-12-10",
  },
  {
    id: "u6",
    slug: "anarkali-pastel-designer",
    name: "Pastel Designer Anarkali",
    description:
      "Soft pastel Anarkali with delicate thread embroidery and pearl accents. Modern cut with traditional charm.",
    price: 8499,
    category: "suits",
    subcategory: "anarkali",
    colors: ["Mint", "Peach"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Organza",
    occasion: ["Party", "Reception"],
    availability: "in-stock",
    images: productImages(suitImgs[5]),
    createdAt: "2026-01-02",
  },
  {
    id: "u7",
    slug: "punjabi-suit-patiala",
    name: "Patiala Style Punjabi Suit",
    description:
      "Classic Patiala salwar with short kurta and heavy embroidered dupatta. Comfortable and stylish.",
    price: 4499,
    salePrice: 3499,
    category: "suits",
    subcategory: "punjabi",
    colors: ["Teal", "Pink"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Rayon",
    occasion: ["Daily", "Festive"],
    availability: "in-stock",
    badge: "Sale",
    images: productImages(suitImgs[0]),
    createdAt: "2025-09-30",
  },
  {
    id: "u8",
    slug: "designer-gharara-suit",
    name: "Designer Gharara Suit",
    description:
      "Traditional gharara style suit with intricate gota patti work. Perfect for weddings and formal occasions.",
    price: 13999,
    category: "suits",
    subcategory: "party-wear",
    colors: ["Ivory", "Gold"],
    sizes: ["S", "M", "L"],
    fabric: "Silk with Net",
    occasion: ["Wedding", "Formal"],
    availability: "in-stock",
    badge: "New",
    images: productImages(suitImgs[1]),
    featured: true,
    createdAt: "2026-01-12",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: "sarees" | "suits"): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.description,
      p.category,
      p.subcategory,
      p.fabric,
      ...p.colors,
      ...p.occasion,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
