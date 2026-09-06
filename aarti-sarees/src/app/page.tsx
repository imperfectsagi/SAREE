import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { CollectionSection } from "@/components/home/CollectionSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { BlogPreview } from "@/components/home/BlogPreview";
import { StoreSection } from "@/components/home/StoreSection";
import {
  getFeaturedProductsDb,
  getProductsByCategoryDb,
} from "@/lib/repo/products";
import { getBusinessSettingsDb } from "@/lib/repo/settings";
import { getActiveBannersDb } from "@/lib/repo/banners";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredAll, sareesAll, suitsAll, business, banners] = await Promise.all([
    getFeaturedProductsDb(),
    getProductsByCategoryDb("sarees"),
    getProductsByCategoryDb("suits"),
    getBusinessSettingsDb(),
    getActiveBannersDb(),
  ]);
  const featured = featuredAll.slice(0, 8);
  const sarees = sareesAll.slice(0, 4);
  const suits = suitsAll.slice(0, 4);
  const heroBanner = banners[0];

  return (
    <>
      <Hero
        desktopImage={heroBanner?.type === "image" ? heroBanner.desktopUrl || undefined : undefined}
        mobileImage={heroBanner?.type === "image" ? heroBanner.mobileUrl || undefined : undefined}
        videoSrc={heroBanner?.type === "video" ? heroBanner.desktopUrl || undefined : undefined}
        heading={heroBanner?.heading || undefined}
        subtitle={heroBanner?.subtitle || undefined}
        primaryCta={
          heroBanner?.ctaLabel
            ? { label: heroBanner.ctaLabel, href: heroBanner.linkUrl || "/sarees" }
            : undefined
        }
      />
      <FeaturedCategories />
      <CollectionSection
        title="Featured Collection"
        subtitle="Handpicked pieces loved by our customers"
        products={featured}
        viewAllHref="/sarees"
      />
      <PromoBanner />
      <CollectionSection
        title="Sarees Collection"
        subtitle="From daily elegance to bridal grandeur"
        products={sarees}
        viewAllHref="/sarees"
      />
      <CollectionSection
        title="Suits Collection"
        subtitle="Anarkali, Punjabi, Party & Festive styles"
        products={suits}
        viewAllHref="/suits"
      />
      <WhyChooseUs />
      <BlogPreview />
      <StoreSection business={business} />
    </>
  );
}
