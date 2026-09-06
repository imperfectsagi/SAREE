import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // Uses the NEXT_INC_CACHE_R2_BUCKET binding defined in wrangler.jsonc
  // to store Next.js' own ISR/data cache. This is separate from the
  // MEDIA_BUCKET used for product/banner/blog images and videos.
  incrementalCache: r2IncrementalCache,
});
