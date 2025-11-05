import { NextRequest, NextResponse } from "next/server";
import { adminUserService } from "@/lib/admin-user-service";
import { ensureAdmin } from "@/lib/require-admin";
import { validateRequest, commonSchemas } from "@/lib/validation";
import { z } from "zod";

const createUserSchema = z.object({
  name: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});

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
    // Validation avec Zod
    const validation = await validateRequest(request, createUserSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, email, password, role } = validation.data;

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
