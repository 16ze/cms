import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/design - Récupérer les paramètres de design publics
export async function GET() {
  try {
    let colors;
    let theme;

    try {
      // Essayer de récupérer depuis la base de données
      const colorSettings = await prisma.designGlobalSettings.findMany({
        where: { category: "colors", isActive: true },
      });

      const themeData = await prisma.siteTheme.findFirst({
        where: { isDefault: true, isActive: true },
      });

      // Transformer les couleurs
      if (colorSettings.length > 0) {
        colors = {};
        colorSettings.forEach((setting) => {
          colors[setting.property] = setting.value;
        });
      }

      if (themeData) {
        theme = {
          name: themeData.name,
          config: themeData.configJson,
        };
      }
    } catch (dbError) {
      console.log("📦 BD non disponible, utilisation des valeurs par défaut");
    }

    // Valeurs par défaut si rien trouvé en BD
    if (!colors) {
      colors = {
        primary: "#3B82F6",
        secondary: "#8B5CF6",
        accent: "#F59E0B",
        background: "#FFFFFF",
        text: "#1F2937",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        footerText: "#6B7280",
      };
    }

    if (!theme) {
      theme = {
        name: "default",
        config: {},
      };
    }

    return NextResponse.json({
      success: true,
      colors,
      theme,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du design:", error);

    // Retourner les valeurs par défaut en cas d'erreur
    return NextResponse.json({
      success: true,
      colors: {
        primary: "#3B82F6",
        secondary: "#8B5CF6",
        accent: "#F59E0B",
        background: "#FFFFFF",
        text: "#1F2937",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        footerText: "#6B7280",
      },
      theme: {
        name: "default",
        config: {},
      },
    });
  }
}
