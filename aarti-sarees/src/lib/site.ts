// Canonical site URL used for sitemap, robots, canonical tags, and JSON-LD.
// Falls back to localhost in dev. Set NEXT_PUBLIC_SITE_URL in production
// (e.g. https://aartisarees.com) via Cloudflare environment variables.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
