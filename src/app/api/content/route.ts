import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ContentStore } from "@/lib/content-store";

// GET /api/content - Récupérer tout le contenu du site
export async function GET(request: NextRequest) {
  try {
    console.log("📝 API: Traitement GET /api/content");

    // Vérifier l'authentification admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Charger tout le contenu
    const content = ContentStore.load();

    console.log("✅ Contenu chargé avec succès");
    return NextResponse.json(content);
  } catch (error) {
    console.error("❌ Erreur lors du chargement du contenu:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/content - Mettre à jour le contenu complet
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 API: Traitement PUT /api/content");

    // Vérifier l'authentification admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    
    // Sauvegarder le contenu
    ContentStore.save(body);

    console.log("✅ Contenu sauvegardé avec succès");
    return NextResponse.json({ 
      success: true, 
      message: "Contenu mis à jour avec succès" 
    });
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
