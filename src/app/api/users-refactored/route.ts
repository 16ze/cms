/**
 * 🔒 API ADMIN USERS - REFACTORISÉE AVEC SAFE HANDLER
 * ====================================================
 *
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Accès super-admin uniquement
 * - Validation automatique
 * - Logs structurés
 * - Gestion d'erreurs centralisée
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { adminUserService } from "@/lib/admin-user-service";
import { commonSchemas } from "@/lib/validation";

const createUserSchema = z.object({
  name: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});

/**
 * GET /api/users
 * Récupérer tous les utilisateurs admin (super-admin uniquement)
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    // Vérifier que l'utilisateur est super-admin
    // safeHandler avec requireSuperAdmin garantit déjà cela
    // Mais on peut ajouter une vérification supplémentaire si nécessaire
    
    const users = await adminUserService.list();
    
    return secureResponse(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    requireSuperAdmin: true, // Accès super-admin uniquement
    methods: ["GET"],
  }
);

/**
 * POST /api/users
 * Créer un nouvel utilisateur admin (super-admin uniquement)
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const data = getValidatedBody<z.infer<typeof createUserSchema>>(request);

    try {
      const user = await adminUserService.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      return secureResponse(
        {
          success: true,
          data: user,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        return secureErrorResponse(
          "Email déjà utilisé",
          409
        );
      }
      
      // Re-lancer l'erreur pour que safeHandler la capture
      throw error;
    }
  },
  {
    requireAuth: true,
    requireSuperAdmin: true, // Accès super-admin uniquement
    methods: ["POST"],
    schema: createUserSchema,
  }
);

