import { NextRequest, NextResponse } from "next/server";
import { hasPageAccess, UserRole, isSuperAdmin } from "./permissions";
import { ensureAdmin } from "./require-admin";

type SessionData = {
  email: string;
  name: string;
  id: string;
  role: UserRole;
  loginTime?: string;
};

export async function verifyAdminAccess(
  request: NextRequest,
  requiredPage?: string
): Promise<{
  success: boolean;
  user?: SessionData;
  error?: string;
  redirectTo?: string;
}> {
  try {
    const admin = await ensureAdmin(request);
    if (admin instanceof NextResponse) {
      return {
        success: false,
        error: "Session invalide",
        redirectTo: "/login",
      };
    }

    const sessionData: SessionData = {
      email: admin.email,
      name: admin.name,
      id: admin.id,
      role: admin.role as UserRole,
    };

    // Si une page spécifique est requise, vérifier les permissions
    if (requiredPage) {
      const hasAccess = hasPageAccess(sessionData.role, requiredPage);

      if (!hasAccess) {
        // Rediriger vers le dashboard si l'utilisateur n'a pas accès
        return {
          success: false,
          error: "Accès refusé à cette page",
          redirectTo: "/admin/dashboard",
        };
      }
    }

    return {
      success: true,
      user: sessionData,
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return {
      success: false,
      error: "Erreur interne",
      redirectTo: "/login",
    };
  }
}

// Utilitaire pour créer une réponse d'erreur d'accès
export function createAccessDeniedResponse(
  requiredPage: string,
  userRole: UserRole,
  userEmail: string
): NextResponse {
  const isMainAdmin = isSuperAdmin(userRole, userEmail);

  return NextResponse.json(
    {
      error: "Accès refusé",
      message: `Cette page est réservée ${
        isMainAdmin
          ? "aux super administrateurs"
          : "à l'administrateur principal"
      }`,
      requiredPage,
      userRole,
      userEmail,
      accessLevel: isMainAdmin ? "super_admin" : "admin",
    },
    { status: 403 }
  );
}

// Vérifier les permissions pour les APIs
export async function verifyApiAccess(
  request: NextRequest,
  requiredRoles: UserRole[] = ["admin", "super_admin"]
): Promise<{
  success: boolean;
  user?: SessionData;
  response?: NextResponse;
}> {
  const admin = await ensureAdmin(request);

  if (admin instanceof NextResponse) {
    return {
      success: false,
      response: admin,
    };
  }

  if (!requiredRoles.includes(admin.role as UserRole)) {
    return {
      success: false,
      response: createAccessDeniedResponse("api", admin.role as UserRole, admin.email),
    };
  }

  return {
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as UserRole,
      loginTime: new Date().toISOString(),
    },
  };
}
