import Image from "next/image";
import Link from "next/link";
import { getAllCategoriesDb } from "@/lib/repo/categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories",
  description: "Browse all saree and suit categories at Aarti Sarees.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategoriesDb();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
        Shop by Category
      </h1>
      <p className="text-[var(--muted)] mb-10">
        Explore our curated collections
      </p>

      <div className="space-y-14">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-semibold">
                  {cat.name}
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {cat.description}
                </p>
              </div>
              <Link
                href={`/${cat.slug}`}
                className="text-sm font-medium text-[var(--primary)] hover:underline hidden sm:block"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {cat.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${cat.slug}?sub=${sub.slug}`}
                  className="group relative aspect-[3/4] rounded-[var(--radius)] overflow-hidden bg-[var(--surface)] border border-[var(--border)]"
                >
                  <Image
                    src={cat.image}
                    alt={sub.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                    sizes="(max-width: 640px) 50vw, 20vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-white text-sm font-medium">
                      {sub.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
