import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/site/footer - Récupérer la configuration du footer
export async function GET() {
  try {
    console.log("📝 API: Récupération de la configuration du footer");

    const footer = await prisma.siteFooter.findFirst({
      where: { isActive: true }
    });

    if (!footer) {
      return NextResponse.json(
        { error: "Configuration du footer non trouvée" },
        { status: 404 }
      );
    }

    console.log("✅ Configuration du footer récupérée avec succès");
    return NextResponse.json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du footer:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site/footer - Mettre à jour la configuration du footer
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 API: Mise à jour de la configuration du footer");

    const body = await request.json();
    const { company, description, contact, social, links } = body;

    // Validation
    if (!company || !description || !contact || !social) {
      return NextResponse.json(
        { error: "Entreprise, description, contact et réseaux sociaux requis" },
        { status: 400 }
      );
    }

    // Mettre à jour ou créer le footer
    const footer = await prisma.siteFooter.upsert({
      where: { id: (await prisma.siteFooter.findFirst())?.id || 'create' },
      update: {
        company,
        description,
        contact,
        social,
        links
      },
      create: {
        company,
        description,
        contact,
        social,
        links
      }
    });

    console.log("✅ Configuration du footer mise à jour avec succès");
    return NextResponse.json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du footer:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
