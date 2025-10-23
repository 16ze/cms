/**
 * API: LOGOUT
 * Route: POST /api/auth/logout
 */

import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/tenant-auth";

export async function POST(request: NextRequest) {
  return logout();
}
