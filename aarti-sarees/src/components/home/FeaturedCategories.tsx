import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import { images } from "@/data/images";

const featured = [
  {
    name: "Designer Sarees",
    href: "/sarees?sub=designer",
    image: images.catDesigner,
  },
  {
    name: "Wedding Collection",
    href: "/sarees?sub=wedding",
    image: images.catWedding,
  },
  {
    name: "Party Wear",
    href: "/sarees?sub=party-wear",
    image: images.catParty,
  },
  {
    name: "Anarkali Suits",
    href: "/suits?sub=anarkali",
    image: images.catAnarkali,
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--text)]">
            Shop by Category
          </h2>
          <p className="mt-2 text-[var(--muted)] text-sm md:text-base">
            Curated collections for every occasion
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-[3/4] rounded-[var(--radius)] overflow-hidden"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium text-sm sm:text-base">
                  {cat.name}
                </h3>
                <span className="text-white/70 text-xs group-hover:text-[var(--accent)] transition-colors">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick category links */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="px-4 py-2 text-sm border border-[var(--border)] rounded-full hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              All {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
