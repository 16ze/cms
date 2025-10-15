import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/content/sections - Récupérer toutes les sections
export async function GET() {
  try {
    console.log("📝 API: Récupération de toutes les sections");

    const sections = await prisma.contentSection.findMany({
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: [
        { page: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
    });

    console.log(`✅ ${sections.length} sections récupérées`);

    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des sections:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des sections",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/sections/[id] - Supprimer une section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("id");

    if (!sectionId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de section requis",
        },
        { status: 400 }
      );
    }

    console.log(`🗑️ API: Suppression de la section ${sectionId}`);

    // Vérifier que la section existe
    const existingSection = await prisma.contentSection.findUnique({
      where: { id: sectionId },
      include: {
        page: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!existingSection) {
      return NextResponse.json(
        {
          success: false,
          error: "Section non trouvée",
        },
        { status: 404 }
      );
    }

    // Supprimer la section
    await prisma.contentSection.delete({
      where: { id: sectionId },
    });

    console.log(
      `✅ Section "${existingSection.sectionName}" supprimée de la page "${existingSection.page.title}"`
    );

    return NextResponse.json({
      success: true,
      message: `Section "${existingSection.sectionName}" supprimée avec succès`,
      deletedSection: {
        id: existingSection.id,
        sectionName: existingSection.sectionName,
        pageSlug: existingSection.page.slug,
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la section:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression de la section",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content/sections/[id] - Modifier une section
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("id");
    const body = await request.json();

    if (!sectionId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de section requis",
        },
        { status: 400 }
      );
    }

    console.log(`✏️ API: Modification de la section ${sectionId}`);

    // Vérifier que la section existe
    const existingSection = await prisma.contentSection.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      return NextResponse.json(
        {
          success: false,
          error: "Section non trouvée",
        },
        { status: 404 }
      );
    }

    // Mettre à jour la section
    const updatedSection = await prisma.contentSection.update({
      where: { id: sectionId },
      data: {
        sectionName: body.sectionName,
        sectionType: body.sectionType,
        orderIndex: body.orderIndex,
        isActive: body.isActive,
        contentJson: body.contentJson,
      },
      include: {
        page: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    console.log(
      `✅ Section "${updatedSection.sectionName}" mise à jour dans la page "${updatedSection.page.title}"`
    );

    return NextResponse.json({
      success: true,
      message: `Section "${updatedSection.sectionName}" mise à jour avec succès`,
      data: updatedSection,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la modification de la section:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la modification de la section",
      },
      { status: 500 }
    );
  }
}