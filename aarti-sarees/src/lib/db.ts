import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";

/**
 * Returns the D1 binding for use in dynamic (SSR) contexts: Server
 * Components rendered per-request, Route Handlers, Server Actions.
 * `cache()` de-dupes the getCloudflareContext() call within one request.
 */
export const getDb = cache((): D1Database => {
  const { env } = getCloudflareContext();
  return env.DB;
});

/**
 * Returns the D1 binding for use in STATIC contexts (generateStaticParams,
 * generateMetadata on statically-generated routes, or anything evaluated
 * at build time). Cloudflare's docs require the async form here.
 *
 * NOTE: during `next build`/SSG this reads whatever local D1 state exists
 * at build time (i.e. your local .wrangler state or CI seed), not the
 * live production database. That's expected for SSG — see the OpenNext
 * caching docs on incremental static regeneration for how pages refresh
 * after deploy.
 */
export async function getDbAsync(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

/** Returns the R2 bucket used for admin-uploaded media. */
export const getMediaBucket = cache((): R2Bucket => {
  const { env } = getCloudflareContext();
  return env.MEDIA_BUCKET;
});

export async function getMediaBucketAsync(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.MEDIA_BUCKET;
}

/** Public base URL for reading back R2-uploaded media (dev URL or custom domain). */
export function getR2PublicBaseUrl(): string {
  return (
    getCloudflareContext().env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || ""
  );
}
