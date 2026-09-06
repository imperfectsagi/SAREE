# Aarti Sarees

Full-stack storefront + admin CMS for Aarti Sarees, built on Next.js 16
(App Router) and deployed to Cloudflare Workers via
`@opennextjs/cloudflare`, with Cloudflare D1 (database) and R2 (media
storage).

See **AUDIT.md** for a full account of what was audited, fixed, built, and
verified — including known gaps.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- Cloudflare Workers (via `@opennextjs/cloudflare`)
- Cloudflare D1 (SQLite) for structured data
- Cloudflare R2 for images/videos
- No ORM — raw D1 `prepare()`/`batch()` calls (kept dependency-free per
  the project brief)
- Auth: Web Crypto PBKDF2 password hashing, cookie sessions — no external
  auth library

## Local Development

`cloudflare-env.d.ts` (TypeScript types for your D1/R2/etc bindings) is
included pre-generated so the project type-checks out of the box. If you
change any binding names in `wrangler.jsonc`, regenerate it with:

```bash
npm run cf-typegen
```

```bash
npm install
npx wrangler d1 migrations apply aarti-sarees-db --local
npx wrangler d1 execute aarti-sarees-db --local --file=./seed/seed.sql
npm run dev
```

This runs the Next.js dev server with D1/R2 access proxied to local
Cloudflare bindings (via `initOpenNextCloudflareForDev()` in
`next.config.ts`). Visit `http://localhost:3000`.

To test against the actual compiled Cloudflare Worker locally (closer to
production behavior):

```bash
npm run build && npx opennextjs-cloudflare build
npx wrangler dev
```

## Deployment (Cloudflare)

### 1. Create your D1 database

```bash
npx wrangler d1 create aarti-sarees-db
```

Copy the returned `database_id` into `wrangler.jsonc` under
`d1_databases[0].database_id`.

### 2. Create your R2 buckets

```bash
npx wrangler r2 bucket create aarti-sarees-media
npx wrangler r2 bucket create aarti-sarees-cache
```

`aarti-sarees-media` holds product/banner/blog/category images and
videos. `aarti-sarees-cache` is used only for Next.js's own ISR/data
cache — keep them separate.

### 3. Enable public access on the media bucket

Cloudflare dashboard -> R2 -> `aarti-sarees-media` -> Settings -> enable
public access (or attach a custom domain). Copy the resulting URL
(`https://pub-xxxx.r2.dev` or your custom domain) into `wrangler.jsonc`
under `vars.R2_PUBLIC_BASE_URL`.

Until this is set, uploaded media is served through a fallback Worker
route and still works — just slightly slower.

### 4. Set your site URL

Update `vars.NEXT_PUBLIC_SITE_URL` in `wrangler.jsonc` to your real
domain (used for sitemap, canonical URLs, Open Graph, structured data).

### 5. Run migrations against the remote database

```bash
npx wrangler d1 migrations apply aarti-sarees-db --remote
npx wrangler d1 execute aarti-sarees-db --remote --file=./seed/seed.sql
```

The seed data is demo data (Unsplash placeholder images) so the site and
admin panel have something to show immediately. Replace it via the admin
panel whenever you're ready.

### 6. Deploy

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` then `opennextjs-cloudflare
deploy`, which publishes the Worker to Cloudflare.

### 7. Create your Super Admin account

Visit `https://your-domain.com/admin/login`. Since no admin user exists
yet, you'll see a one-time setup form instead of a login form. Fill it in
— this is the only time this form will ever appear; it self-disables
permanently once an account exists.

**This is the only manual step required to get a working admin login.**
There is no default password anywhere in this codebase.

### 8. Configure your business info

In the admin panel, go to **Settings** and fill in your real WhatsApp
number, address, and any social links. These replace the placeholder
values and immediately update the live site (no redeploy needed).

## Required Cloudflare Bindings / Environment Variables

| Name | Type | Where configured | Purpose |
|---|---|---|---|
| DB | D1 binding | wrangler.jsonc | All structured application data |
| MEDIA_BUCKET | R2 binding | wrangler.jsonc | Product/banner/blog/category media |
| NEXT_INC_CACHE_R2_BUCKET | R2 binding | wrangler.jsonc | Next.js's own ISR cache (not your media) |
| ASSETS | Assets binding | wrangler.jsonc | Static build output |
| IMAGES | Images binding | wrangler.jsonc | Next.js Image optimization |
| NEXT_PUBLIC_SITE_URL | var | wrangler.jsonc | Canonical site URL |
| R2_PUBLIC_BASE_URL | var | wrangler.jsonc | Public URL for serving R2 media |

No API tokens, account IDs, or secrets need to be committed anywhere —
`wrangler` picks up your Cloudflare credentials from your own
authenticated session (`npx wrangler login`) or CI environment.

## Project Structure

```
src/
  app/                    Storefront routes (App Router)
  app/admin/              Admin panel routes
    (auth)/               Login + first-run setup (no sidebar)
    (protected)/          Authenticated admin pages (sidebar shell)
  app/api/admin/          Admin API routes (all server-side auth-guarded)
  app/api/auth/           Login/logout/session/setup routes
  components/             Storefront UI components
  components/admin/       Admin UI primitives + sidebar
  lib/auth/               Password hashing, sessions, permissions, guards
  lib/repo/               D1 data-access layer (maps DB rows to frontend types)
  lib/db.ts               D1/R2 binding accessors
  data/                   Static demo data + fallback business defaults
migrations/
  0001_initial_schema.sql D1 schema
seed/
  seed.sql                 Generated seed data (see scripts/generate-seed.mts)
scripts/
  generate-seed.mts        Regenerates seed.sql from src/data/*.ts
```

## Notes

- Admin routes are excluded from search indexing via robots.txt.
- The `/api/media/[...key]` route is a fallback proxy for R2 objects —
  set R2_PUBLIC_BASE_URL in production so media is served directly from
  R2 instead of proxied through the Worker.
- See AUDIT.md section 6 for known incomplete features (homepage
  section-content wiring, drag-and-drop reordering UI, related-products
  DB wiring).
