# Aarti Sarees — Audit & Build Report

This document is an honest account of what was found, fixed, built, and verified.
Every claim of "verified" or "tested" below means it was actually run against a
real local Cloudflare Worker (via `wrangler dev`) and a real local D1 database —
not just reasoned about. Where something was **not** verified, that's stated
explicitly.

---

## 1. What Already Worked (as uploaded)

- Full storefront UI: homepage, `/sarees`, `/suits`, `/categories`,
  `/products/[slug]`, `/cart`, `/blog`, `/blog/[slug]`
- Product filtering, category browsing, cart (localStorage-based), WhatsApp
  inquiry flow (product page, cart)
- Centralized demo data (`src/data/*.ts`) and a CSS-variable theme system
- Clean component architecture, responsive Tailwind v4 styling
- `next dev` and `next build` both ran without crashing

## 2. What Was Missing

- `/about`, `/contact`, `/search` routes — referenced in the Header/Footer
  nav but the pages did not exist (404)
- `/admin` — did not exist at all. No backend, no database, no auth, no
  Cloudflare configuration of any kind. The README was still the untouched
  default from `create-next-app`.
- No sitemap, robots.txt, canonical URLs, Open Graph tags, or JSON-LD
  structured data anywhere
- No Cloudflare deployment configuration (no `wrangler.jsonc`, no D1/R2
  bindings, no OpenNext adapter)

## 3. What Was Broken

| Issue | Detail | Fix |
|---|---|---|
| Build-breaking font fetch | `next/font/google` fetches `fonts.googleapis.com` at build time. Fails in any offline/restricted CI environment. | Replaced with a system font stack — zero network dependency, visually near-identical. |
| Corrupted SVG | A stray typo (`conf-`) inside the WhatsApp icon's SVG path data in `Header.tsx` would have silently broken that icon's render. | Fixed the path data. |
| React anti-pattern | `setState` called synchronously inside `useEffect` in `Header.tsx` (route-change cleanup) and `CartContext.tsx` (localStorage hydration). | `Header.tsx`: ref-guarded effect. `CartContext.tsx`: kept as a justified, documented one-time external-system sync. |
| `window.location.href` for internal nav | Search overlay used a full page reload instead of client-side routing. | Replaced with `router.push()`. |
| Invented business data | `hello@aartisarees.com` email and fake Instagram/Facebook URLs were hardcoded and rendered in the Footer — never provided by you, violating "do not invent" in your brief. | Removed. Set to null/empty until entered in Admin -> Settings. |

## 4. What Was Built

### 4.1 Frontend completion
- `/about`, `/contact`, `/search` — built reusing existing components
  (ProductGrid, WhyChooseUs, Button) to match the existing visual language
  exactly, per your instruction not to redesign
- Contact form composes a WhatsApp message (consistent with the site's
  existing WhatsApp-first pattern — there was no email backend to send to)
- `sitemap.ts`, `robots.ts` (blocks `/admin` and `/api` from indexing),
  Open Graph metadata, LocalBusiness JSON-LD (real address/phone only),
  per-product Product JSON-LD with live price/availability

### 4.2 Cloudflare deployment layer
- `@opennextjs/cloudflare` — confirmed via current official docs as the
  supported adapter for Next.js 16 on Workers
- `wrangler.jsonc`: D1 binding (DB), two R2 buckets (MEDIA_BUCKET for your
  product/banner/blog media, NEXT_INC_CACHE_R2_BUCKET for Next's own ISR
  cache — kept separate so large media never touches D1 or the cache
  bucket), Images binding, Node.js compat flags
- Verified: ran the actual `opennextjs-cloudflare build`, producing a real
  `.open-next/worker.js`, then booted it with `wrangler dev` (genuine
  workerd runtime) and hit it with curl — confirmed real HTTP 200s.

### 4.3 Database (D1)
13 tables: users, sessions, media, categories, subcategories, products,
product_images, banners, blog_posts, reviews, homepage_sections,
site_settings, theme_settings. See `migrations/0001_initial_schema.sql`.

- Verified: applied the migration to a real local D1 instance — all 31
  SQL commands executed successfully, tables confirmed to exist via query.
- `seed/seed.sql` is mechanically generated (via
  `scripts/generate-seed.mts`) from your actual `src/data/products.ts`,
  `categories.ts`, `blogs.ts` — not hand-retyped, so it can't drift from
  the real data. Regenerate with `npx tsx scripts/generate-seed.mts >
  seed/seed.sql` if you edit the source data files.
- Verified: seeded data (16 products, 2 categories, 10 subcategories, 64
  product images, 50 media rows, 4 blog posts) loaded correctly and a real
  join query (product + category + subcategory + primary image) returned
  byte-accurate results matching the source.

### 4.4 Media (R2)
- Upload API (`/api/admin/media/upload`) validates file type/size, streams
  to R2, records metadata in D1
- Fallback proxy route (`/api/media/[...key]`) serves R2 objects directly
  through the Worker if you haven't configured a public R2 URL yet — works
  immediately, just slower than a direct public URL
- Verified: uploaded a real PNG file end-to-end — confirmed stored in R2,
  confirmed the D1 media row has the correct size/MIME type

### 4.5 Authentication
- Password hashing via native Web Crypto PBKDF2-SHA256 (100,000
  iterations — the documented maximum Cloudflare Workers allows). No
  external dependency: Argon2/bcrypt libraries need native Node bindings
  that cannot run inside the Workers V8 isolate.
- Session management: opaque tokens in a sessions table, httpOnly cookies
- Roles: super_admin / admin / editor, each with a distinct permission set
  (editors cannot touch theme/settings/users)
- First-run Super Admin setup (`/api/auth/setup`) that self-disables the
  instant a user exists — no default/weak password ever ships
- Enforcement happens server-side in every API route via
  requireUser()/withAuth() — not just hidden buttons in the UI
- `src/proxy.ts` (Next.js 16's current convention — middleware.ts is
  deprecated as of Next 16) does a fast cookie-presence check as the first
  line of defense; the authoritative D1-backed check happens per-route
- Verified end-to-end: bootstrap -> confirmed self-disabling -> rejected
  duplicate setup (403) -> rejected wrong password (401, generic message
  that doesn't leak account existence) -> successful login -> session
  verified via /api/auth/me -> confirmed protected route access

### 4.6 Admin Panel
Distinct visual language from the storefront (slate/indigo, dark sidebar)
per your explicit instruction. All sections below have working CRUD APIs
protected server-side, and were verified returning HTTP 200 against the
real Worker with an authenticated session:

- Dashboard — live stats from D1 (verified showing correct counts: 16
  products, 2 low-stock, 2 categories, 4 blog posts)
- Products — full CRUD, multi-image upload with primary-image selection,
  publish/unpublish, featured toggle, duplicate, delete, reorder API.
  Verified the full loop: created a product via the admin API, confirmed
  it appeared in the admin list, confirmed it was simultaneously live on
  the public storefront at /products/[slug]
- Categories — CRUD for categories and subcategories, enable/disable,
  sarees kept structurally separate from suits
- Banners — image and video banner support, desktop/mobile media, poster
  fallback for video, enable/disable, reorder API
- Media Library — grid view of all uploads, delete with usage-check
  (blocks deletion if a file is still referenced by a product/banner/etc.)
- Blog CMS — full CRUD, SEO title/description fields, draft/published
  status, publish-date tracking
- Homepage — enable/disable and reorder sections, edit headings and
  descriptions (kept intentionally simple, not a drag-and-drop page
  builder, per your instruction)
- Theme — any CSS color token editable via HEX, live preview panel.
  Verified the actual requirement: updated the theme via the admin API
  with a distinctive test color, confirmed the live public homepage
  immediately reflected it with zero rebuild
- Reviews — manual add/edit/delete/publish. No fake reviews were
  generated, per your instruction — the review list ships empty
- Users — Super-Admin-only. Create/edit/delete/deactivate, role
  assignment, with guardrails preventing removal of the last active Super
  Admin
- Settings — business name, tagline, phone, WhatsApp number, address,
  hours, email, social links — all editable, all stored in D1

### 4.7 Storefront <-> Settings wiring
Business info (name, phone, WhatsApp number, address, hours, email,
social links) is read from D1 everywhere it's displayed on the storefront
— Header, Footer, Cart, Cart page, Contact page, Contact form, About
page, Product card/detail WhatsApp buttons, Store section, and the
LocalBusiness JSON-LD. Changing the WhatsApp number in Admin -> Settings
changes every WhatsApp link/message on the live site immediately,
satisfying your requirement that the number "eventually come from
Settings instead of being scattered throughout the code."

One exception, clearly scoped: the static title/description text inside
Next's `export const metadata` blocks (used for `<title>` tags and meta
descriptions on a few pages) still reads the static fallback file. This
is a Next.js constraint — metadata exports are evaluated at module scope
and cannot await a database call. This only affects SEO title/meta-
description text, not any visible page content, cart behavior, or
WhatsApp links.

---

## 5. Final Verification (this exact build)

Ran immediately before packaging this zip:

1. `npx tsc --noEmit` — clean, zero errors
2. `npx eslint .` — clean, zero errors/warnings
3. `npm run build` (plain Next build) — clean, all routes compiled
   correctly
4. `npx opennextjs-cloudflare build` — clean, produced a real
   `.open-next/worker.js`
5. Booted that Worker with `wrangler dev` and curled every route:

   Storefront: /, /sarees, /suits, /categories, /cart, /blog, /about,
   /contact, /search, /products/[slug], /blog/[slug] — all HTTP 200

   Admin (authenticated): /admin/dashboard, /admin/products,
   /admin/categories, /admin/banners, /admin/media, /admin/blog,
   /admin/homepage, /admin/theme, /admin/reviews, /admin/users,
   /admin/settings — all HTTP 200

## 6. Known Gaps — What Still Needs Attention

Being direct about what wasn't finished, rather than implying full
completeness:

- Homepage section wiring is partial. The admin can enable/disable/
  reorder/rename homepage sections and this is saved to D1, but the
  homepage itself (src/app/page.tsx) does not yet read that configuration
  to decide what to render — it still renders a fixed set of sections.
  The section CRUD is real and working; the "homepage actually reflects
  the admin's section choices" wiring is not done.
- Homepage product/category selection per-section (e.g. "pick which 4
  products show in Featured") is not implemented — the homepage currently
  shows the first N featured/category products automatically.
- Reorder APIs exist but have no drag-and-drop UI — Products and Banners
  have working POST /reorder endpoints, but the admin list pages don't
  yet have drag handles wired to them.
- getRelatedProducts on the product detail page still reads from the
  static src/data/products.ts file rather than D1, so "related products"
  on a live product page may not reflect admin-added products.
- No automated tests (unit or integration) were written — all
  verification in this document was manual, real-Worker testing during
  the build session, not a CI test suite.
- Blog content is a plain HTML textarea, not a rich text editor.
  Functional, but not friendly for non-technical content editing.
- No image resizing/optimization pipeline on upload — R2 stores whatever
  file size is uploaded; Next's Image component still optimizes on the
  fly for display, but very large source uploads will cost more R2
  storage/egress than necessary.

None of the above are broken — they are incomplete features, clearly
scoped above so you know exactly what to expect.

## 7. Security Notes

- Passwords: PBKDF2-SHA256, 100,000 iterations, unique salt per user,
  constant-time comparison on verify
- No default/weak password ships — the Super Admin account only exists
  after you complete the one-time setup form yourself
- Every admin API route is protected server-side via requireUser(), not
  just hidden UI — a rejected curl request without a valid session cookie
  was verified to return 401 for both pages and API routes
- Generic "Invalid email or password" error on login — does not reveal
  whether an account exists
- Session cookies are httpOnly, secure, sameSite: lax
- robots.txt blocks /admin and /api from search indexing
