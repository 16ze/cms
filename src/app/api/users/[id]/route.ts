import { NextRequest, NextResponse } from "next/server";
import { adminUserService } from "@/lib/admin-user-service";
import { ensureAdmin } from "@/lib/require-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await ensureAdmin(request);
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const user = await adminUserService.findById(id);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await ensureAdmin(request);
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const user = await adminUserService.update(id, body);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    console.error("Erreur mise à jour admin user:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await ensureAdmin(request);
  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  await adminUserService.delete(id);
  return NextResponse.json({ success: true });
}
