import "server-only";

// Password hashing using the native Web Crypto API (PBKDF2-SHA256).
// No external dependency: argon2/bcrypt libraries rely on native Node
// bindings that cannot run inside the Cloudflare Workers V8 isolate.
// 100,000 iterations is the maximum crypto.subtle allows on Workers
// (higher values throw); this matches Cloudflare's documented ceiling.
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_LENGTH_BITS = 256;

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(bytes.map((b) => parseInt(b, 16)));
}

async function deriveBits(
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS
  );
}

/** Hashes a plaintext password. Stored format: "pbkdf2$<iterations>$<saltHex>$<hashHex>" */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await deriveBits(password, salt);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
}

/** Verifies a plaintext password against a stored hash, using constant-time comparison. */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromHex(parts[2]);
  const expected = fromHex(parts[3]);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
      keyMaterial,
      KEY_LENGTH_BITS
    )
  );

  if (derived.length !== expected.length) return false;
  // Constant-time comparison to avoid timing side-channels.
  let diff = 0;
  for (let i = 0; i < derived.length; i++) {
    diff |= derived[i] ^ expected[i];
  }
  return diff === 0;
}

/** Generates a high-entropy, URL-safe opaque session token. */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toHex(bytes);
}

/** Generates a UUID v4 (used for row IDs across the app). */
export function generateId(): string {
  return crypto.randomUUID();
}
