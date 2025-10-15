import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/maintenance - Vérifier le statut du mode maintenance
export async function GET() {
  try {
    const maintenanceSettings = await prisma.siteSettings.findMany({
      where: { 
        category: 'system',
        key: { startsWith: 'system_' }
      }
    });

    const maintenanceMode = maintenanceSettings.find(s => s.key === 'system_maintenanceMode');
    const maintenanceMessage = maintenanceSettings.find(s => s.key === 'system_maintenanceMessage');

    return NextResponse.json({
      maintenanceMode: maintenanceMode ? JSON.parse(maintenanceMode.value) : false,
      maintenanceMessage: maintenanceMessage ? JSON.parse(maintenanceMessage.value) : "Site en maintenance. Nous serons de retour bientôt !"
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du mode maintenance:", error);
    return NextResponse.json({
      maintenanceMode: false,
      maintenanceMessage: "Site en maintenance. Nous serons de retour bientôt !"
    });
  }
}

// POST /api/maintenance - Activer/désactiver le mode maintenance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenanceMode, maintenanceMessage } = body;

    // Sauvegarder dans la base de données
    await prisma.siteSettings.upsert({
      where: { key: 'system_maintenanceMode' },
      update: { value: JSON.stringify(maintenanceMode) },
      create: {
        key: 'system_maintenanceMode',
        value: JSON.stringify(maintenanceMode),
        category: 'system',
        description: 'Mode maintenance du site',
        isActive: true,
      },
    });

    await prisma.siteSettings.upsert({
      where: { key: 'system_maintenanceMessage' },
      update: { value: JSON.stringify(maintenanceMessage) },
      create: {
        key: 'system_maintenanceMessage',
        value: JSON.stringify(maintenanceMessage),
        category: 'system',
        description: 'Message de maintenance',
        isActive: true,
      },
    });

    // Créer la réponse avec le cookie approprié
    const response = NextResponse.json({
      success: true,
      maintenanceMode,
      maintenanceMessage
    });

    // Définir le cookie pour le middleware
    if (maintenanceMode) {
      response.cookies.set('maintenance-mode', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 heures
      });
    } else {
      // Supprimer le cookie de manière plus agressive
      response.cookies.set('maintenance-mode', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        expires: new Date('1970-01-01'),
        path: '/'
      });
    }

    return response;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mode maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du mode maintenance" },
      { status: 500 }
    );
  }
}
