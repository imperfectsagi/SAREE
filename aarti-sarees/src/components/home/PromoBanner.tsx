import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/images";
import { Button } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden min-h-[280px] md:min-h-[340px]">
          <Image
            src={images.promoBanner}
            alt="Special Collection"
            fill
            className="object-cover"
            sizes="100vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)]/90 to-transparent" />
          <div className="relative h-full flex items-center p-6 md:p-12">
            <div className="max-w-md text-white space-y-4">
              <span className="inline-block text-[var(--accent)] text-xs font-semibold tracking-widest uppercase">
                Limited Time
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-semibold leading-tight">
                Wedding Season Specials
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                Explore our exclusive bridal and festive collection with
                handcrafted zari and premium silk weaves.
              </p>
              <Link href="/sarees?sub=wedding">
                <Button size="lg" className="mt-2">
                  Shop Wedding Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
