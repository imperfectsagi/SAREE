import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/images";
import { buildWhatsAppUrl } from "@/data/business";
import type { BusinessSettings } from "@/lib/repo/settings";
import { Button } from "@/components/ui/Button";

export function StoreSection({ business }: { business: BusinessSettings }) {
  const waUrl = buildWhatsAppUrl(
    `Hello ${business.name}! I would like to visit your store / know more.`,
    business.whatsapp
  );

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden">
            <Image
              src={images.storeImage}
              alt="Aarti Sarees Store"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              Visit Our Boutique
            </h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Experience the texture and drape of our collection in person. Our
              team is ready to help you find the perfect piece for your special
              occasions.
            </p>
            <address className="not-italic text-sm space-y-1">
              <p className="font-medium">{business.address.full}</p>
              <p className="text-[var(--muted)]">{business.hours}</p>
            </address>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp">WhatsApp Us</Button>
              </a>
              <a href={`tel:${business.phoneRaw}`}>
                <Button variant="outline">Call Now</Button>
              </a>
              <Link href="/contact">
                <Button variant="ghost">Get Directions</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
