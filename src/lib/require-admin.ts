import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/lib/admin-session";

type AdminLite = { id: string; email: string; name: string; role: string };

export async function ensureAdmin(
  request: NextRequest
): Promise<AdminLite | NextResponse> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const verification = verifyAdminSession(token, getAdminSessionSecret());
  if (!verification.valid) {
    const message =
      "reason" in verification && verification.reason === "EXPIRED_TOKEN"
        ? "Session expirée"
        : "reason" in verification &&
          verification.reason === "INVALID_SIGNATURE"
        ? "Signature invalide"
        : "Session invalide";

    return NextResponse.json({ error: message }, { status: 401 });
  }

  const { id, email, name, role } = verification.claims;
  return { id, email, name, role };
}
