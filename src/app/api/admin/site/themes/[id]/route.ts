import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site/themes/[id] - Récupérer un thème spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Récupération du thème ${id}`);

    const theme = await prisma.siteTheme.findUnique({
      where: { id }
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Thème non trouvé" },
        { status: 404 }
      );
    }

    console.log("✅ Thème récupéré avec succès");
    return NextResponse.json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du thème:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site/themes/[id] - Mettre à jour un thème
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Mise à jour du thème ${id}`);

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
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const theme = await prisma.siteTheme.update({
      where: { id },
      data: {
        name,
        displayName,
        configJson,
        isDefault: isDefault || false
      }
    });

    console.log("✅ Thème mis à jour avec succès");
    return NextResponse.json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du thème:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/site/themes/[id] - Supprimer un thème
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Suppression du thème ${id}`);

    const theme = await prisma.siteTheme.findUnique({
      where: { id }
    });

    if (!theme) {
      return NextResponse.json(
        { error: "Thème non trouvé" },
        { status: 404 }
      );
    }

    // Ne pas supprimer le thème par défaut
    if (theme.isDefault) {
      return NextResponse.json(
        { error: "Impossible de supprimer le thème par défaut" },
        { status: 400 }
      );
    }

    await prisma.siteTheme.delete({
      where: { id }
    });

    console.log("✅ Thème supprimé avec succès");
    return NextResponse.json({
      success: true,
      message: "Thème supprimé avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du thème:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
