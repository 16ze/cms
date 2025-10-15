import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer le thème actif
    const activeTheme = await prisma.siteTheme.findFirst({
      where: {
        isActive: true,
        isDefault: true,
      },
    });

    if (!activeTheme) {
      return NextResponse.json({
        success: false,
        error: "Aucun thème actif trouvé",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: activeTheme.name,
        displayName: activeTheme.displayName,
        isActive: activeTheme.isActive,
        isDefault: activeTheme.isDefault,
        config: activeTheme.configJson,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du thème:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération du thème",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, config } = body;

    // Mettre à jour le thème actif
    const updatedTheme = await prisma.siteTheme.updateMany({
      where: {
        isActive: true,
        isDefault: true,
      },
      data: {
        name: name || "default",
        displayName: displayName || "Thème par défaut",
        configJson: config || {},
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thème mis à jour avec succès",
      data: updatedTheme,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du thème:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour du thème",
      },
      { status: 500 }
    );
  }
}
