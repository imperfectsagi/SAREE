-- Migration 0001: Initial schema
-- Aarti Sarees CMS — D1 (SQLite) schema
--
-- Design notes:
-- * D1 stores structured data only. Actual image/video bytes live in R2
--   (bucket: MEDIA_BUCKET); this schema stores only their R2 object keys
--   and derived public URLs.
-- * Booleans are stored as INTEGER (0/1) — SQLite has no native boolean.
-- * Timestamps are stored as TEXT in ISO-8601 (UTC) for readability and
--   because SQLite's date functions work fine with ISO-8601 strings.
-- * `sort_order` columns support admin-driven manual reordering.

-- ---------------------------------------------------------------------
-- USERS, ROLES, SESSIONS (admin authentication)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,           -- uuid
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,              -- scrypt/PBKDF2 hash, never plaintext
  role          TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,               -- random session token (opaque, high-entropy)
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ---------------------------------------------------------------------
-- MEDIA LIBRARY (metadata only — bytes live in R2)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media (
  id            TEXT PRIMARY KEY,            -- uuid
  r2_key        TEXT NOT NULL UNIQUE,        -- object key inside MEDIA_BUCKET
  url           TEXT NOT NULL,               -- public URL (R2 public dev URL or custom domain)
  kind          TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  mime_type     TEXT NOT NULL,
  width         INTEGER,
  height        INTEGER,
  size_bytes    INTEGER,
  alt_text      TEXT,
  uploaded_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_media_kind ON media(kind);

-- ---------------------------------------------------------------------
-- CATEGORIES & SUBCATEGORIES (sarees / suits kept as top-level categories)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,              -- e.g. "sarees", "suits"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_id    TEXT REFERENCES media(id) ON DELETE SET NULL,
  is_enabled  INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS subcategories (
  id          TEXT PRIMARY KEY,              -- uuid
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  image_id    TEXT REFERENCES media(id) ON DELETE SET NULL,
  is_enabled  INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,          -- uuid
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  sku             TEXT UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  price           INTEGER NOT NULL,          -- stored in paise-free whole INR (matches existing frontend Product.price)
  sale_price      INTEGER,                   -- nullable; matches Product.salePrice
  category_id     TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id  TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  colors          TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  sizes           TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  fabric          TEXT NOT NULL DEFAULT '',
  occasion        TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  tags            TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
  availability    TEXT NOT NULL DEFAULT 'in-stock'
                    CHECK (availability IN ('in-stock', 'low-stock', 'out-of-stock')),
  badge           TEXT CHECK (badge IN ('New', 'Sale', 'Bestseller', 'Limited') OR badge IS NULL),
  video_url       TEXT,                      -- optional product video (R2-hosted)
  is_published    INTEGER NOT NULL DEFAULT 1,
  is_featured     INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

CREATE TABLE IF NOT EXISTS product_images (
  id          TEXT PRIMARY KEY,              -- uuid
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id    TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  is_primary  INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ---------------------------------------------------------------------
-- BANNERS (homepage image/video banners)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS banners (
  id                TEXT PRIMARY KEY,        -- uuid
  type              TEXT NOT NULL CHECK (type IN ('image', 'video')),
  heading           TEXT,
  subtitle          TEXT,
  cta_label         TEXT,
  link_url          TEXT,
  overlay           TEXT,                    -- e.g. rgba() or hex+opacity, image banners only
  desktop_media_id  TEXT REFERENCES media(id) ON DELETE SET NULL,
  mobile_media_id   TEXT REFERENCES media(id) ON DELETE SET NULL,
  poster_media_id   TEXT REFERENCES media(id) ON DELETE SET NULL, -- video banners only
  is_enabled        INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_banners_enabled ON banners(is_enabled);

-- ---------------------------------------------------------------------
-- BLOG
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS blog_posts (
  id                TEXT PRIMARY KEY,        -- uuid
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  excerpt           TEXT NOT NULL DEFAULT '',
  content           TEXT NOT NULL DEFAULT '', -- HTML, matches existing BlogPost.content shape
  featured_image_id TEXT REFERENCES media(id) ON DELETE SET NULL,
  category          TEXT,
  tags              TEXT NOT NULL DEFAULT '[]', -- JSON array
  author            TEXT NOT NULL DEFAULT 'Aarti Sarees Team',
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at      TEXT,
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- ---------------------------------------------------------------------
-- REVIEWS (real reviews only — admin-entered, never auto-generated)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,              -- uuid
  product_id  TEXT REFERENCES products(id) ON DELETE CASCADE, -- nullable = general store review
  author_name TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 0,   -- admin must explicitly publish
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);

-- ---------------------------------------------------------------------
-- HOMEPAGE SECTIONS (lightweight, ordered section management)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS homepage_sections (
  id           TEXT PRIMARY KEY,             -- uuid
  section_key  TEXT NOT NULL UNIQUE,         -- e.g. "hero", "featured_categories", "collection", "why_choose_us", "store", "blog_preview", "promo_banner"
  heading      TEXT,
  description  TEXT,
  cta_label    TEXT,
  cta_link     TEXT,
  -- JSON array of product IDs or category IDs, meaning depends on section_key
  selected_ids TEXT NOT NULL DEFAULT '[]',
  banner_id    TEXT REFERENCES banners(id) ON DELETE SET NULL,
  is_enabled   INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------------------------------------------------------------------
-- SITE SETTINGS (business info, WhatsApp number, social links — all
-- editable so nothing is hardcoded in source going forward)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,              -- e.g. "business_name", "whatsapp_number"
  value       TEXT,                          -- stored as plain text or JSON, interpreted by app layer
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------------------------------------------------------------------
-- THEME SETTINGS (single active theme; HEX color tokens)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS theme_settings (
  id          INTEGER PRIMARY KEY CHECK (id = 1), -- single-row table (only one active theme)
  tokens      TEXT NOT NULL,                 -- JSON object of { primary, secondary, accent, background, surface, text, muted, border, button, buttonText, header, footer, card, sale, badge, links, overlay, ... }
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
