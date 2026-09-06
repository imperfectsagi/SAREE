import { images } from "./images";

export type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: SubCategory[];
};

export const categories: Category[] = [
  {
    id: "sarees",
    name: "Sarees",
    slug: "sarees",
    description: "Exquisite handcrafted sarees for every occasion",
    image: images.sareesBanner,
    subcategories: [
      { id: "designer", name: "Designer", slug: "designer" },
      { id: "party-wear", name: "Party Wear", slug: "party-wear" },
      { id: "traditional", name: "Traditional", slug: "traditional" },
      { id: "daily-wear", name: "Daily Wear", slug: "daily-wear" },
      { id: "wedding", name: "Wedding", slug: "wedding" },
    ],
  },
  {
    id: "suits",
    name: "Suits",
    slug: "suits",
    description: "Elegant suits and salwar kameez collections",
    image: images.suitsBanner,
    subcategories: [
      { id: "anarkali", name: "Anarkali", slug: "anarkali" },
      { id: "salwar", name: "Salwar", slug: "salwar" },
      { id: "punjabi", name: "Punjabi", slug: "punjabi" },
      { id: "party-wear-suits", name: "Party Wear", slug: "party-wear" },
      { id: "festive", name: "Festive", slug: "festive" },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllSubcategories(): (SubCategory & { parent: string })[] {
  return categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({ ...sub, parent: cat.slug }))
  );
}
