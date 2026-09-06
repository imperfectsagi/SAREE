import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BusinessSettingsProvider } from "@/context/BusinessSettingsContext";
import { business } from "@/data/business";
import { SITE_URL } from "@/lib/site";
import { getActiveThemeDbAsync } from "@/lib/repo/theme";
import { getBusinessSettingsDbAsync } from "@/lib/repo/settings";
import type { ThemeConfig } from "@/data/theme";

// NOTE (AUDIT FIX): next/font/google requires fetching from fonts.googleapis.com
// at BUILD TIME. This fails in restricted/offline build environments and adds an
// external network dependency to every production build (including Cloudflare CI).
// Replaced with a system font stack (zero network calls, zero layout shift,
// visually very close to Geist) via CSS variables defined in globals.css.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.name} | Premium Sarees & Suits in New Delhi`,
    template: `%s | ${business.name}`,
  },
  description:
    "Premium ethnic wear boutique in New Delhi. Authentic Banarasi, Kanjeevaram sarees and designer suits. Visit us in Palam or inquire on WhatsApp.",
  keywords: [
    "sarees",
    "suits",
    "Banarasi",
    "Kanjeevaram",
    "Anarkali",
    "New Delhi",
    "ethnic wear",
    "Aarti Sarees",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: business.name,
    title: `${business.name} | Premium Sarees & Suits in New Delhi`,
    description:
      "Premium ethnic wear boutique in New Delhi. Authentic Banarasi, Kanjeevaram sarees and designer suits.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

// LocalBusiness structured data — built only from real, provided business
// facts (name, address, phone). No invented email/social/hours source.
function localBusinessJsonLd(settings: {
  name: string;
  phone: string;
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: settings.name,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${settings.address.line1}, ${settings.address.line2}`,
      addressLocality: settings.address.city,
      addressRegion: settings.address.state,
      postalCode: settings.address.pincode,
      addressCountry: "IN",
    },
    url: SITE_URL,
  };
}

// Converts the DB-stored theme into a :root CSS override. This is what
// makes "changing the theme from admin updates the customer website"
// actually true — the storefront's globals.css :root block only supplies
// fallback defaults; this always-rendered <style> tag (fed by a live D1
// read) takes precedence for every visitor, with no rebuild needed.
function themeToCss(theme: ThemeConfig): string {
  return `:root {
  --primary: ${theme.primary};
  --secondary: ${theme.secondary};
  --accent: ${theme.accent};
  --background: ${theme.background};
  --surface: ${theme.surface};
  --text: ${theme.text};
  --muted: ${theme.muted};
  --border: ${theme.border};
  --button: ${theme.button};
  --button-text: ${theme.buttonText};
  --success: ${theme.success};
  --error: ${theme.error};
  --warning: ${theme.warning};
  --header: ${theme.header};
  --footer: ${theme.footer};
  --card: ${theme.card};
  --sale: ${theme.sale};
  --badge: ${theme.badge};
  --links: ${theme.links};
  --overlay: ${theme.overlay};
}`;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, settings] = await Promise.all([
    getActiveThemeDbAsync(),
    getBusinessSettingsDbAsync(),
  ]);

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd(settings)),
          }}
        />
        <BusinessSettingsProvider value={settings}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer business={settings} />
            <CartDrawer />
          </CartProvider>
        </BusinessSettingsProvider>
      </body>
    </html>
  );
}
