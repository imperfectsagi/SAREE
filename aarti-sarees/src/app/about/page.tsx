import Image from "next/image";
import type { Metadata } from "next";
import { business as staticBusiness, buildWhatsAppUrl } from "@/data/business";
import { getBusinessSettingsDb } from "@/lib/repo/settings";
import { images } from "@/data/images";
import { Button } from "@/components/ui/Button";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";

export const dynamic = "force-dynamic";

// Metadata is a static export evaluated at module scope, so it can't await
// a DB call — it uses the static fallback text, which is acceptable since
// SEO metadata doesn't need to be live-reactive the way visible page
// content does. The actual page body below uses live D1-backed settings.
export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${staticBusiness.name}, a premium ethnic wear boutique in New Delhi offering authentic sarees and suits.`,
};

export default async function AboutPage() {
  const business = await getBusinessSettingsDb();
  const waUrl = buildWhatsAppUrl(
    `Hello ${business.name}! I'd like to know more about your store.`,
    business.whatsapp
  );

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-5">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[var(--primary)]">
              About {business.name}
            </h1>
            <p className="text-[var(--muted)] leading-relaxed">
              {business.name} is a premium ethnic wear boutique based in New
              Delhi, offering a curated collection of sarees and suits for
              weddings, festive occasions, and everyday elegance.
            </p>
            <p className="text-[var(--muted)] leading-relaxed">
              Our boutique in Palam brings together traditional
              craftsmanship — from Banarasi and Kanjeevaram silks to
              contemporary Anarkali and party wear suits — with a focus on
              quality fabric and finish. Visit us in store or reach out on
              WhatsApp for personal styling help, availability, and pricing.
            </p>
            <address className="not-italic text-sm space-y-1 pt-2">
              <p className="font-medium text-[var(--text)]">
                {business.address.full}
              </p>
              <p className="text-[var(--muted)]">{business.hours}</p>
            </address>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp">WhatsApp Us</Button>
              </a>
              <a href={`tel:${business.phoneRaw}`}>
                <Button variant="outline">Call Now</Button>
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden">
            <Image
              src={images.aboutImage}
              alt={`${business.name} boutique`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </div>
  );
}
