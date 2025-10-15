import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ContentStore } from "@/lib/content-store";

// GET /api/content/[page] - Récupérer le contenu d'une page spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    console.log(`📝 API: Traitement GET /api/content/${page}`);

    // Vérifier l'authentification admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le contenu de la page
    const pageContent = ContentStore.getPage(page);

    if (!pageContent) {
      return NextResponse.json(
        { error: "Page non trouvée" },
        { status: 404 }
      );
    }

    console.log(`✅ Contenu de la page ${page} chargé avec succès`);
    return NextResponse.json(pageContent);
  } catch (error) {
    console.error("❌ Erreur lors du chargement du contenu de la page:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/content/[page] - Mettre à jour le contenu d'une page spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    console.log(`📝 API: Traitement PUT /api/content/${page}`);

    // Vérifier l'authentification admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const pageContent = await request.json();
    
    // Mettre à jour le contenu de la page
    ContentStore.updatePage(page, pageContent);

    console.log(`✅ Contenu de la page ${page} sauvegardé avec succès`);
    return NextResponse.json({ 
      success: true, 
      message: `Contenu de la page ${page} mis à jour avec succès` 
    });
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde du contenu de la page:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
