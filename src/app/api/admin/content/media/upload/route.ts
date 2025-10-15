import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    // Validation de la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
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

    // Récupérer les dimensions si c'est une image
    let width: number | undefined;
    let height: number | undefined;

    if (file.type.startsWith("image/")) {
      // Pour une vraie implémentation, utiliser sharp ou jimp pour obtenir les dimensions
      // width = image.width;
      // height = image.height;
    }

    // Sauvegarder en base de données
    const media = await prisma.contentMedia.create({
      data: {
        filename,
        originalName: file.name,
        altText: altText || "",
        filePath: publicPath,
        mimeType: file.type,
        fileSize: file.size,
        width,
        height,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: media
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur lors de l'upload du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du média" },
      { status: 500 }
    );
  }
}
