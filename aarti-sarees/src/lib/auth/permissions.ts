import "server-only";
import type { SessionUser } from "@/lib/auth/session";

export type Role = "super_admin" | "admin" | "editor";

export type Permission =
  | "products.write"
  | "categories.write"
  | "banners.write"
  | "media.write"
  | "blog.write"
  | "homepage.write"
  | "theme.write"
  | "reviews.write"
  | "settings.write"
  | "users.write";

// SUPER ADMIN: everything, including user management.
// ADMIN: everything except managing other users/roles.
// EDITOR: content only — products, categories, banners, media, blog,
// homepage, reviews — but not theme or settings (brand/business-critical)
// or users.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "products.write",
    "categories.write",
    "banners.write",
    "media.write",
    "blog.write",
    "homepage.write",
    "theme.write",
    "reviews.write",
    "settings.write",
    "users.write",
  ],
  admin: [
    "products.write",
    "categories.write",
    "banners.write",
    "media.write",
    "blog.write",
    "homepage.write",
    "theme.write",
    "reviews.write",
    "settings.write",
  ],
  editor: [
    "products.write",
    "categories.write",
    "banners.write",
    "media.write",
    "blog.write",
    "homepage.write",
    "reviews.write",
  ],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function userHasPermission(
  user: SessionUser | null,
  permission: Permission
): boolean {
  if (!user) return false;
  return roleHasPermission(user.role, permission);
}
