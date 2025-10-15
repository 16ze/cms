import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/design/global-settings - Récupérer tous les paramètres de design globaux
export async function GET() {
  try {
    const settings = await prisma.designGlobalSettings.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { property: 'asc' }
      ]
    });

    // Organiser les paramètres par catégorie
    const organizedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.property] = {
        value: setting.value,
        deviceType: setting.deviceType
      };
      return acc;
    }, {} as Record<string, Record<string, { value: string; deviceType: string }>>);

    return NextResponse.json({
      success: true,
      data: organizedSettings
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres de design:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres de design" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/design/global-settings - Mettre à jour les paramètres de design globaux
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, property, value, deviceType = 'all' } = body;

    if (!category || !property || value === undefined) {
      return NextResponse.json(
        { error: "Catégorie, propriété et valeur sont requises" },
        { status: 400 }
      );
    }

    // Mettre à jour ou créer le paramètre
    const setting = await prisma.designGlobalSettings.upsert({
      where: {
        category_property_deviceType: {
          category,
          property,
          deviceType
        }
      },
      update: {
        value,
        updatedAt: new Date()
      },
      create: {
        category,
        property,
        value,
        deviceType,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des paramètres de design:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres de design" },
      { status: 500 }
    );
  }
}

// POST /api/admin/design/global-settings - Créer plusieurs paramètres de design
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Le corps de la requête doit contenir un tableau 'settings'" },
        { status: 400 }
      );
    }

    const createdSettings = [];

    for (const settingData of settings) {
      const { category, property, value, deviceType = 'all' } = settingData;

      if (!category || !property || value === undefined) {
        continue; // Ignorer les paramètres invalides
      }

      const setting = await prisma.designGlobalSettings.upsert({
        where: {
          category_property_deviceType: {
            category,
            property,
            deviceType
          }
        },
        update: {
          value,
          updatedAt: new Date()
        },
        create: {
          category,
          property,
          value,
          deviceType,
          isActive: true
        }
      });

      createdSettings.push(setting);
    }

    return NextResponse.json({
      success: true,
      data: createdSettings,
      message: `${createdSettings.length} paramètre(s) de design mis à jour/créé(s)`
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création des paramètres de design:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des paramètres de design" },
      { status: 500 }
    );
  }
}
