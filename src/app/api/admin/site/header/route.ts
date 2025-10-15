import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site/header - Récupérer la configuration du header
export async function GET() {
  try {
    console.log("📝 API: Récupération de la configuration du header");

    const header = await prisma.siteHeader.findFirst({
      where: { isActive: true }
    });

    if (!header) {
      return NextResponse.json(
        { error: "Configuration du header non trouvée" },
        { status: 404 }
      );
    }

    console.log("✅ Configuration du header récupérée avec succès");
    return NextResponse.json({
      success: true,
      data: header
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du header:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site/header - Mettre à jour la configuration du header
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 API: Mise à jour de la configuration du header");

    const body = await request.json();
    const { logo, logoUrl, navigation, buttons, buttonUrls } = body;

    // Validation
    if (!logo || !navigation || !buttons) {
      return NextResponse.json(
        { error: "Logo, navigation et boutons requis" },
        { status: 400 }
      );
    }

    // Trouver le header existant
    const existingHeader = await prisma.siteHeader.findFirst({
      where: { isActive: true }
    });

    let header;
    if (existingHeader) {
      // Mettre à jour le header existant
      header = await prisma.siteHeader.update({
        where: { id: existingHeader.id },
        data: {
          logo,
          logoUrl,
          navigation,
          buttons,
          buttonUrls: buttonUrls || {}
        }
      });
    } else {
      // Créer un nouveau header
      header = await prisma.siteHeader.create({
        data: {
          logo,
          logoUrl,
          navigation,
          buttons,
          buttonUrls: buttonUrls || {}
        }
      });
    }

    console.log("✅ Configuration du header mise à jour avec succès");
    return NextResponse.json({
      success: true,
      data: header
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du header:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
