import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site/themes - Récupérer tous les thèmes
export async function GET() {
  try {
    console.log("📝 API: Récupération des thèmes");

    const themes = await prisma.siteTheme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log(`✅ ${themes.length} thèmes récupérés avec succès`);
    return NextResponse.json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des thèmes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/admin/site/themes - Créer un nouveau thème
export async function POST(request: NextRequest) {
  try {
    console.log("📝 API: Création d'un nouveau thème");

    const body = await request.json();
    const { name, displayName, configJson, isDefault } = body;

    // Validation
    if (!name || !displayName || !configJson) {
      return NextResponse.json(
        { error: "Nom, nom d'affichage et configuration requis" },
        { status: 400 }
      );
    }

    // Si c'est le thème par défaut, désactiver les autres
    if (isDefault) {
      await prisma.siteTheme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const theme = await prisma.siteTheme.create({
      data: {
        name,
        displayName,
        configJson,
        isDefault: isDefault || false
      }
    });

    console.log("✅ Nouveau thème créé avec succès");
    return NextResponse.json({
      success: true,
      data: theme
    }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur lors de la création du thème:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
