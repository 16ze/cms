import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// POST /api/upload - Upload d'images et vidéos
export async function POST(request: NextRequest) {
  try {
    console.log("📝 API: Traitement POST /api/upload");

    // Vérifier l'authentification admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP, GIF, MP4, WebM, OGG" 
      }, { status: 400 });
    }

    // Limiter la taille du fichier (50MB pour les vidéos, 10MB pour les images)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Taille maximum: ${file.type.startsWith('video/') ? '50MB' : '10MB'}` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Déterminer le dossier de destination
    const uploadDir = file.type.startsWith('video/') ? 'videos' : 'images';
    const uploadPath = join(process.cwd(), 'public', uploadDir, 'uploads');
    
    // Créer le dossier si il n'existe pas
    try {
      await mkdir(uploadPath, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà
    }

    // Écrire le fichier
    const filePath = join(uploadPath, uniqueFileName);
    await writeFile(filePath, buffer);

    // Retourner l'URL publique du fichier
    const publicUrl = `/${uploadDir}/uploads/${uniqueFileName}`;

    console.log(`✅ Fichier uploadé avec succès: ${publicUrl}`);
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
