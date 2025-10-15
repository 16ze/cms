import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les styles de boutons
export async function GET() {
  try {
    console.log("🎨 API: Récupération des styles de boutons");

    const buttonStyles = await prisma.buttonStyles.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
    });

    console.log(`✅ ${buttonStyles.length} styles de boutons récupérés`);

    return NextResponse.json(buttonStyles);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des styles de boutons:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau style de bouton
export async function POST(request: NextRequest) {
  try {
    console.log("🎨 API: Création d'un nouveau style de bouton");

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
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const newButtonStyle = await prisma.buttonStyles.create({
      data: {
        name,
        displayName,
        configJson,
        isDefault,
      },
    });

    console.log(`✅ Style de bouton "${displayName}" créé avec succès`);

    return NextResponse.json(newButtonStyle, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur lors de la création du style de bouton:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
