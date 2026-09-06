import Link from "next/link";
import type { BusinessSettings } from "@/lib/repo/settings";

export function Footer({ business }: { business: BusinessSettings }) {
  return (
    <footer className="bg-[var(--secondary)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-semibold">
              Aarti <span className="text-[var(--accent)]">Sarees</span>
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Premium ethnic wear boutique in New Delhi. Authentic sarees and
              suits crafted for timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--accent)]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/sarees" className="hover:text-white transition">
                  Sarees
                </Link>
              </li>
              <li>
                <Link href="/suits" className="hover:text-white transition">
                  Suits
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--accent)]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link
                  href="/sarees?sub=wedding"
                  className="hover:text-white transition"
                >
                  Wedding Sarees
                </Link>
              </li>
              <li>
                <Link
                  href="/sarees?sub=designer"
                  className="hover:text-white transition"
                >
                  Designer Sarees
                </Link>
              </li>
              <li>
                <Link
                  href="/suits?sub=anarkali"
                  className="hover:text-white transition"
                >
                  Anarkali Suits
                </Link>
              </li>
              <li>
                <Link
                  href="/suits?sub=party-wear"
                  className="hover:text-white transition"
                >
                  Party Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[var(--accent)]">
              Visit Us
            </h4>
            <address className="not-italic text-sm text-white/80 space-y-2">
              <p>{business.address.line1}</p>
              <p>{business.address.line2}</p>
              <p>
                {business.address.city}, {business.address.state} –{" "}
                {business.address.pincode}
              </p>
              <p className="pt-2">
                <a
                  href={`tel:${business.phoneRaw}`}
                  className="hover:text-white transition"
                >
                  {business.phone}
                </a>
              </p>
              <p className="text-white/60 text-xs pt-1">{business.hours}</p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Aarti Sarees. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
            {business.social.instagram && (
              <a
                href={business.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
