/**
 * 🔒 API ADMIN CONTENT MEDIA UPLOAD - REFACTORISÉE AVEC SAFE HANDLER
 * ==================================================================
 *
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Authentification requise (ajoutée)
 * - Validation des fichiers
 * - Isolation tenant garantie
 * - Logs structurés
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { safeHandler, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { z } from "zod";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/admin/content/media/upload
 * Uploader un fichier média
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
      return secureErrorResponse(
        "Aucun fichier fourni",
        400
      );
    }

    // Validation du type de fichier
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      return secureErrorResponse(
        "Type de fichier non autorisé",
        400
      );
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      return secureErrorResponse(
        "Fichier trop volumineux (max 10MB)",
        400
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Créer le dossier de destination
    const uploadDir = join(process.cwd(), "public", "uploads", "media");
    await mkdir(uploadDir, { recursive: true });

    // Chemin complet du fichier
    const filePath = join(uploadDir, filename);
    const publicPath = `/uploads/media/${filename}`;

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Sauvegarder en base de données avec tenantId
    const media = await prisma.contentMedia.create({
      data: {
        tenantId, // Explicite pour la sécurité
        filename,
        originalName: file.name,
        altText: altText.trim(),
        filePath: publicPath,
        mimeType: file.type,
        fileSize: file.size,
        isActive: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: media,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    // Note: Pas de schema Zod car FormData utilisé
  }
);

