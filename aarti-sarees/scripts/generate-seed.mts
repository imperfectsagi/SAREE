/**
 * Generates seed/seed.sql from the existing frontend demo data
 * (src/data/*.ts). This guarantees the seed data fed into D1 is an
 * accurate, mechanical transcription of the data the frontend already
 * ships with — not a hand-retyped approximation that could drift.
 *
 * NOTE: This seed data is DEMO data (Unsplash placeholder images), kept
 * only so the admin panel and frontend have something to display before
 * you upload real products. It is safe to wipe via the admin panel at
 * any time. Media rows below reference the same Unsplash URLs the
 * frontend currently hardcodes — once you upload real media through
 * Admin → Media, new products/banners should reference those instead.
 *
 * Run with: npx tsx scripts/generate-seed.mts > seed/seed.sql
 */
import { products } from "../src/data/products.ts";
import { categories } from "../src/data/categories.ts";
import { blogs } from "../src/data/blogs.ts";

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonEsc(arr) {
  return esc(JSON.stringify(arr ?? []));
}

function uuid(prefix, index) {
  // Deterministic, readable IDs for seed data (real admin-created rows
  // will use crypto.randomUUID() at write time — see src/lib/db.ts).
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

const lines = [];
lines.push("-- Seed data generated from existing frontend demo data.");
lines.push("-- Safe to delete/replace via the admin panel at any time.");
lines.push("");

// --- Media (collect every unique image URL referenced) ---
const mediaByUrl = new Map();
let mediaCounter = 1;
function mediaIdFor(url, kind = "image") {
  if (!url) return null;
  if (!mediaByUrl.has(url)) {
    const id = uuid("media", mediaCounter++);
    mediaByUrl.set(url, id);
  }
  return mediaByUrl.get(url);
}

// Pre-register category images
for (const cat of categories) {
  mediaIdFor(cat.image);
}
// Pre-register product images
for (const p of products) {
  for (const img of p.images) mediaIdFor(img);
}
// Pre-register blog images
for (const b of blogs) {
  mediaIdFor(b.image);
}

for (const [url, id] of mediaByUrl.entries()) {
  lines.push(
    `INSERT INTO media (id, r2_key, url, kind, mime_type) VALUES (${esc(
      id
    )}, ${esc("demo/" + id)}, ${esc(url)}, 'image', 'image/jpeg');`
  );
}
lines.push("");

// --- Categories & subcategories ---
for (const cat of categories) {
  lines.push(
    `INSERT INTO categories (id, name, slug, description, image_id, is_enabled, sort_order) VALUES (${esc(
      cat.id
    )}, ${esc(cat.name)}, ${esc(cat.slug)}, ${esc(cat.description)}, ${esc(
      mediaIdFor(cat.image)
    )}, 1, 0);`
  );
  cat.subcategories.forEach((sub, i) => {
    lines.push(
      `INSERT INTO subcategories (id, category_id, name, slug, is_enabled, sort_order) VALUES (${esc(
        `${cat.id}-${sub.id}`
      )}, ${esc(cat.id)}, ${esc(sub.name)}, ${esc(sub.slug)}, 1, ${i});`
    );
  });
}
lines.push("");

// Map "categoryId-subSlug" -> subcategory row id for FK lookups below
const subLookup = new Map();
for (const cat of categories) {
  for (const sub of cat.subcategories) {
    subLookup.set(`${cat.id}:${sub.slug}`, `${cat.id}-${sub.id}`);
  }
}

// --- Products & product_images ---
products.forEach((p, i) => {
  const subId = subLookup.get(`${p.category}:${p.subcategory}`) ?? null;
  lines.push(
    `INSERT INTO products (id, slug, name, sku, description, price, sale_price, category_id, subcategory_id, colors, sizes, fabric, occasion, tags, availability, badge, is_published, is_featured, sort_order, created_at, updated_at) VALUES (${esc(
      p.id
    )}, ${esc(p.slug)}, ${esc(p.name)}, ${esc(p.id.toUpperCase())}, ${esc(
      p.description
    )}, ${p.price}, ${p.salePrice ?? "NULL"}, ${esc(p.category)}, ${esc(
      subId
    )}, ${jsonEsc(p.colors)}, ${jsonEsc(p.sizes)}, ${esc(p.fabric)}, ${jsonEsc(
      p.occasion
    )}, ${jsonEsc([])}, ${esc(p.availability)}, ${esc(
      p.badge ?? null
    )}, 1, ${p.featured ? 1 : 0}, ${i}, ${esc(p.createdAt)}, ${esc(
      p.createdAt
    )});`
  );
  p.images.forEach((img, imgIndex) => {
    lines.push(
      `INSERT INTO product_images (id, product_id, media_id, is_primary, sort_order) VALUES (${esc(
        `${p.id}-img-${imgIndex}`
      )}, ${esc(p.id)}, ${esc(mediaIdFor(img))}, ${
        imgIndex === 0 ? 1 : 0
      }, ${imgIndex});`
    );
  });
});
lines.push("");

// --- Blog posts ---
for (const b of blogs) {
  lines.push(
    `INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image_id, category, tags, author, status, published_at, created_at, updated_at) VALUES (${esc(
      b.id
    )}, ${esc(b.slug)}, ${esc(b.title)}, ${esc(b.excerpt)}, ${esc(
      b.content
    )}, ${esc(mediaIdFor(b.image))}, ${esc(b.category)}, ${jsonEsc(
      []
    )}, ${esc(b.author)}, 'published', ${esc(b.date)}, ${esc(b.date)}, ${esc(
      b.date
    )});`
  );
}
lines.push("");

// --- Default theme (matches src/data/theme.ts defaultTheme) ---
lines.push(
  `INSERT INTO theme_settings (id, tokens) VALUES (1, ${esc(
    JSON.stringify({
      primary: "#8B1E3F",
      secondary: "#4A1942",
      accent: "#C9A227",
      background: "#FDF8F5",
      surface: "#FFFFFF",
      text: "#1A1210",
      muted: "#6B5B54",
      border: "#E8DED6",
      button: "#8B1E3F",
      buttonText: "#FFFFFF",
      header: "#FFFFFF",
      footer: "#4A1942",
      card: "#FFFFFF",
      sale: "#C62828",
      badge: "#C9A227",
      links: "#8B1E3F",
      overlay: "rgba(0,0,0,0.4)",
    })
  )});`
);
lines.push("");

// --- Default site settings (real business data only) ---
const settings = {
  business_name: "Aarti Sarees",
  business_tagline: "Timeless Ethnic Elegance",
  business_phone: "+91 92132 85214",
  business_whatsapp: "919213285214",
  business_address_line1: "Wz 625, Palam, Syndicate Market",
  business_address_line2: "Palam Colony, Raj Nagar I, Raj Nagar",
  business_address_city: "New Delhi",
  business_address_state: "Delhi",
  business_address_pincode: "110077",
  business_hours: "Mon – Sat: 10:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM",
  business_email: "",
  social_instagram: "",
  social_facebook: "",
};
for (const [key, value] of Object.entries(settings)) {
  lines.push(
    `INSERT INTO site_settings (key, value) VALUES (${esc(key)}, ${esc(
      value
    )});`
  );
}

console.log(lines.join("\n"));
