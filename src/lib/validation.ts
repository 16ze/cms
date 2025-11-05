/**
 * ✅ VALIDATION ZOD HELPERS
 * =========================
 *
 * Helpers pour validation Zod standardisée dans les API routes
 */

import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { enhancedLogger } from "@/lib/logger";

/**
 * Schémas de validation communs
 */
export const commonSchemas = {
  email: z.string().email("Format d'email invalide"),
  uuid: z.string().uuid("Format UUID invalide"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Format slug invalide (a-z, 0-9, -)"),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Format de téléphone invalide"),
  url: z.string().url("Format URL invalide"),
  nonEmptyString: z.string().min(1, "Champ requis"),
};

/**
 * Wrapper pour valider le body d'une requête avec Zod
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      enhancedLogger.warn("Validation error", {
        errors: error.errors,
        path: request.nextUrl.pathname,
      });

      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    enhancedLogger.error("Request validation error", error as Error, {
      path: request.nextUrl.pathname,
    });

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid request format",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Wrapper pour valider les query params avec Zod
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const validatedData = schema.parse(params);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      enhancedLogger.warn("Query params validation error", {
        errors: error.errors,
        path: request.nextUrl.pathname,
      });

      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid query parameters",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Wrapper pour valider les route params avec Zod
 */
export function validateRouteParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validatedData = schema.parse(params);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      enhancedLogger.warn("Route params validation error", {
        errors: error.errors,
      });

      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Invalid route parameters",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid route parameters",
        },
        { status: 400 }
      ),
    };
  }
}

