import type { Metadata } from "next";
import { business as staticBusiness } from "@/data/business";
import { getBusinessSettingsDb } from "@/lib/repo/settings";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${staticBusiness.name}. Visit our store in Palam, New Delhi, call, or message us on WhatsApp.`,
};

export default async function ContactPage() {
  const business = await getBusinessSettingsDb();
  const mapQuery = encodeURIComponent(business.address.full);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[var(--primary)]">
          Contact Us
        </h1>
        <p className="mt-2 text-[var(--muted)] max-w-xl mx-auto">
          Have a question about a product, sizing, or availability? Reach out
          — we typically respond fastest on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Details + Map */}
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-[var(--accent)] uppercase text-xs tracking-wide mb-2">
                Visit Our Store
              </h2>
              <address className="not-italic text-sm leading-relaxed">
                {business.address.line1}
                <br />
                {business.address.line2}
                <br />
                {business.address.city}, {business.address.state} –{" "}
                {business.address.pincode}
              </address>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--accent)] uppercase text-xs tracking-wide mb-2">
                Store Hours
              </h2>
              <p className="text-sm">{business.hours}</p>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--accent)] uppercase text-xs tracking-wide mb-2">
                Phone / WhatsApp
              </h2>
              <a
                href={`tel:${business.phoneRaw}`}
                className="text-sm hover:text-[var(--primary)]"
              >
                {business.phone}
              </a>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp">WhatsApp Us</Button>
              </a>
              <a href={`tel:${business.phoneRaw}`}>
                <Button variant="outline">Call Now</Button>
              </a>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] aspect-[4/3]">
            <iframe
              title="Aarti Sarees location"
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
          <h2 className="font-serif text-xl font-semibold mb-1">
            Send a Message
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Fill this in and we&apos;ll open WhatsApp with your message ready
            to send.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
