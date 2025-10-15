import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/maintenance/disable - Forcer la désactivation du mode maintenance
export async function POST() {
  try {
    // Mettre à jour la base de données
    await prisma.siteSettings.upsert({
      where: { key: 'system_maintenanceMode' },
      update: { value: JSON.stringify(false) },
      create: {
        key: 'system_maintenanceMode',
        value: JSON.stringify(false),
        category: 'system',
        description: 'Mode maintenance du site',
        isActive: true,
      },
    });

    // Créer la réponse avec suppression forcée du cookie
    const response = NextResponse.json({
      success: true,
      maintenanceMode: false,
      message: "Mode maintenance désactivé avec succès"
    });

    // Supprimer le cookie de manière très agressive
    response.cookies.set('maintenance-mode', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1,
      expires: new Date('1970-01-01'),
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.kairo-digital.fr' : 'localhost'
    });

    // Ajouter des headers pour forcer la suppression
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Erreur lors de la désactivation du mode maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation du mode maintenance" },
      { status: 500 }
    );
  }
}
