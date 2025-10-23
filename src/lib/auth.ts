import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Vérifie que l'utilisateur est authentifié en tant qu'admin
 * Retourne l'utilisateur ou une réponse d'erreur
 */
export async function ensureAdmin(
  request: NextRequest
): Promise<AdminUser | NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Pour la démo, on utilise le token comme identifiant
    // En production, décodez un JWT ici
    const user = await prisma.adminUser.findFirst({
      where: {
        email: "admin@kairodigital.com", // Utilisateur par défaut pour la démo
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error("Erreur authentification:", error);
    return NextResponse.json(
      { error: "Erreur d'authentification" },
      { status: 500 }
    );
  }
}

/**
 * Vérifie que l'utilisateur a le rôle super_admin
 */
export async function ensureSuperAdmin(
  request: NextRequest
): Promise<AdminUser | NextResponse> {
  const result = await ensureAdmin(request);

  if (result instanceof NextResponse) {
    return result;
  }

  if (result.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Accès refusé - Super Admin requis" },
      { status: 403 }
    );
  }

  return result;
}
