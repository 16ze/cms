import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un style de bouton spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎨 API: Récupération du style de bouton ${params.id}`);

    const buttonStyle = await prisma.buttonStyles.findUnique({
      where: { id: params.id },
    });

    if (!buttonStyle) {
      return NextResponse.json(
        { error: "Style de bouton non trouvé" },
        { status: 404 }
      );
    }

    console.log(`✅ Style de bouton "${buttonStyle.displayName}" récupéré`);

    return NextResponse.json(buttonStyle);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du style de bouton:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un style de bouton
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎨 API: Mise à jour du style de bouton ${params.id}`);

    const body = await request.json();
    const { name, displayName, configJson, isDefault = false } = body;

    // Validation des données
    if (!name || !displayName || !configJson) {
      return NextResponse.json(
        { error: "Nom, nom d'affichage et configuration requis" },
        { status: 400 }
      );
    }

    // Si c'est le nouveau style par défaut, désactiver les autres
    if (isDefault) {
      await prisma.buttonStyles.updateMany({
        where: { 
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false },
      });
    }

    const updatedButtonStyle = await prisma.buttonStyles.update({
      where: { id: params.id },
      data: {
        name,
        displayName,
        configJson,
        isDefault,
      },
    });

    console.log(`✅ Style de bouton "${displayName}" mis à jour avec succès`);

    return NextResponse.json(updatedButtonStyle);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du style de bouton:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un style de bouton
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎨 API: Suppression du style de bouton ${params.id}`);

    // Vérifier si c'est le style par défaut
    const buttonStyle = await prisma.buttonStyles.findUnique({
      where: { id: params.id },
    });

    if (buttonStyle?.isDefault) {
      return NextResponse.json(
        { error: "Impossible de supprimer le style par défaut" },
        { status: 400 }
      );
    }

    await prisma.buttonStyles.delete({
      where: { id: params.id },
    });

    console.log(`✅ Style de bouton supprimé avec succès`);

    return NextResponse.json({ message: "Style de bouton supprimé" });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du style de bouton:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
