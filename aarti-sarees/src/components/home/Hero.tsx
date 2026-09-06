"use client";

import Image from "next/image";
import Link from "next/link";
import { images } from "@/data/images";
import { Button } from "@/components/ui/Button";

type HeroProps = {
  // Designed to later support video without layout change
  desktopImage?: string;
  mobileImage?: string;
  videoSrc?: string;
  heading?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function Hero({
  desktopImage = images.heroDesktop,
  mobileImage = images.heroMobile,
  videoSrc,
  heading = "Timeless Ethnic Elegance",
  subtitle = "Discover exquisite sarees and suits crafted for the modern Indian woman. Authentic weaves, premium fabrics, unforgettable style.",
  primaryCta = { label: "Shop Sarees", href: "/sarees" },
  secondaryCta = { label: "Explore Suits", href: "/suits" },
}: HeroProps) {
  return (
    <section className="relative w-full h-[70vh] min-h-[420px] max-h-[720px] overflow-hidden">
      {/* Media layer - image or video */}
      <div className="absolute inset-0">
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={desktopImage}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <>
            {/* Desktop */}
            <Image
              src={desktopImage}
              alt="Aarti Sarees Hero"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center hidden sm:block"
            />
            {/* Mobile */}
            <Image
              src={mobileImage}
              alt="Aarti Sarees Hero"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center sm:hidden"
            />
          </>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-xl text-white space-y-5">
          <p className="text-[var(--accent)] text-sm font-medium tracking-widest uppercase">
            Aarti Sarees · New Delhi
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight">
            {heading}
          </h1>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-md">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={primaryCta.href}>
              <Button size="lg" className="min-w-[140px]">
                {primaryCta.label}
              </Button>
            </Link>
            <Link href={secondaryCta.href}>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[140px] border-white/40 text-white hover:bg-white/10"
              >
                {secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
