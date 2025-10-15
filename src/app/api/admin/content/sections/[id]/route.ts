import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/content/sections/[id] - Modifier une section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { contentJson, sectionName, sectionType, orderIndex, isActive } = body;

    // Validation
    if (!contentJson) {
      return NextResponse.json(
        { error: "Contenu requis" },
        { status: 400 }
      );
    }

    // Mettre à jour la section
    const section = await prisma.contentSection.update({
      where: { id },
      data: {
        contentJson,
        sectionName,
        sectionType,
        orderIndex,
        isActive
      },
      include: {
        page: true
      }
    });

    // Créer une nouvelle version
    const latestVersion = await prisma.contentVersion.findFirst({
      where: { sectionId: id },
      orderBy: { versionNumber: 'desc' }
    });

    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    await prisma.contentVersion.create({
      data: {
        sectionId: id,
        contentJson,
        versionNumber: newVersionNumber,
        changeDescription: "Modification du contenu"
      }
    });

    return NextResponse.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error("❌ Erreur lors de la modification de la section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la section" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/sections/[id] - Supprimer une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Supprimer la section (les versions seront supprimées automatiquement par CASCADE)
    await prisma.contentSection.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Section supprimée avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la section" },
      { status: 500 }
    );
  }
}
