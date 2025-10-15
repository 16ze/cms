import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer les paramètres de couleurs depuis SiteSettings
    const colorSettings = await prisma.siteSettings.findMany({
      where: {
        category: "colors",
        isActive: true,
      },
    });

    // Transformer les données en format objet
    const colors = colorSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      colors: {
        primary: colors.primary || "#3B82F6",
        secondary: colors.secondary || "#8B5CF6",
        accent: colors.accent || "#F59E0B",
        background: colors.background || "#FFFFFF",
        surface: colors.surface || "#F8FAFC",
        text: colors.text || "#1F2937",
        textSecondary: colors.textSecondary || "#6B7280",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des couleurs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des couleurs",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { primary, secondary, accent, background, text, footerText } = body;

    // Préparer les mises à jour
    const updates = [
      { key: "primary", value: primary },
      { key: "secondary", value: secondary },
      { key: "accent", value: accent },
      { key: "background", value: background },
      { key: "text", value: text },
      { key: "footerText", value: footerText },
    ].filter((update) => update.value !== undefined);

    // Mettre à jour chaque paramètre de couleur
    for (const update of updates) {
      await prisma.siteSettings.upsert({
        where: {
          key_category: {
            key: update.key,
            category: "colors",
          },
        },
        update: {
          value: update.value,
          updatedAt: new Date(),
        },
        create: {
          key: update.key,
          value: update.value,
          category: "colors",
          description: `Couleur ${update.key}`,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Couleurs mises à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des couleurs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour des couleurs",
      },
      { status: 500 }
    );
  }
}
