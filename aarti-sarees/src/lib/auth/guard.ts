import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { userHasPermission, type Permission } from "@/lib/auth/permissions";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Server-side guard for admin Route Handlers. Throws AuthError (401/403)
 * if there's no valid session or the user lacks the required permission.
 * This is the ENFORCEMENT layer — the admin UI hiding buttons is only a
 * convenience, this is what actually blocks unauthorized API calls.
 */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Not authenticated", 401);
  }
  if (permission && !userHasPermission(user, permission)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

/** Wraps a Route Handler body, converting AuthError into a proper JSON response. */
export async function withAuth<T>(
  permission: Permission | undefined,
  handler: (user: SessionUser) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const user = await requireUser(permission);
    return await handler(user);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
