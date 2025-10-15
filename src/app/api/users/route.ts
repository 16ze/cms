import { NextRequest, NextResponse } from "next/server";
import { adminUserService } from "@/lib/admin-user-service";
import { ensureAdmin } from "@/lib/require-admin";

export async function GET(request: NextRequest) {
  console.log("👥 API: Récupération des utilisateurs");

  // Vérifier l'authentification
  const authResult = await ensureAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'authentification
  }

  const adminUser = authResult;
  console.log("👥 API: Récupération des utilisateurs pour:", adminUser.email);

  // Vérifier que l'utilisateur a les droits (super admin uniquement)
  if (adminUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const users = await adminUserService.list();
    console.log("✅ API: Utilisateurs récupérés avec succès:", users.length);
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("👥 API: Création d'utilisateur");

  // Vérifier l'authentification
  const authResult = await ensureAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'authentification
  }

  const adminUser = authResult;
  console.log("👥 API: Création d'utilisateur pour:", adminUser.email);

  // Vérifier que l'utilisateur a les droits (super admin uniquement)
  if (adminUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    const user = await adminUserService.create({
      name,
      email,
      password,
      role,
    });

    console.log("✅ API: Utilisateur créé avec succès:", user.email);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 409 }
      );
    }

    console.error("❌ Erreur création utilisateur admin:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
