/**
 * API: Configuration du Site
 * ==========================
 * Gère la configuration du template pour chaque tenant
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Récupérer la configuration
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const config = await prisma.siteConfiguration.findUnique({
      where: { tenantId },
    });

    if (!config) {
      return NextResponse.json(
        { success: false, message: "Configuration non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        pages: JSON.parse(config.pages),
        features: JSON.parse(config.features),
        colors: config.colors,
        businessType: config.businessType,
        specialties: JSON.parse(config.specialties),
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération configuration:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la configuration" },
      { status: 500 }
    );
  }
}

// POST - Créer/Mettre à jour la configuration
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    // Vérifier si une configuration existe déjà
    const existingConfig = await prisma.siteConfiguration.findUnique({
      where: { tenantId },
    });

    let config;

    if (existingConfig) {
      // Mettre à jour
      config = await prisma.siteConfiguration.update({
        where: { tenantId },
        data: {
          pages: JSON.stringify(data.pages || []),
          features: JSON.stringify(data.features || []),
          colors: data.colors || "",
          businessType: data.businessType || "",
          specialties: JSON.stringify(data.specialties || []),
        },
      });
    } else {
      // Créer
      config = await prisma.siteConfiguration.create({
        data: {
          tenantId,
          pages: JSON.stringify(data.pages || []),
          features: JSON.stringify(data.features || []),
          colors: data.colors || "",
          businessType: data.businessType || "",
          specialties: JSON.stringify(data.specialties || []),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pages: JSON.parse(config.pages),
        features: JSON.parse(config.features),
        colors: config.colors,
        businessType: config.businessType,
        specialties: JSON.parse(config.specialties),
      },
    });
  } catch (error) {
    console.error("❌ Erreur sauvegarde configuration:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de la configuration" },
      { status: 500 }
    );
  }
}
