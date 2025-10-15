import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/design/section/[sectionId]/styles - Récupérer les styles d'une section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;

    const sectionStyles = await prisma.designSectionStyles.findUnique({
      where: { contentSectionId: sectionId },
      include: {
        contentSection: {
          select: {
            sectionName: true,
            sectionType: true
          }
        }
      }
    });

    if (!sectionStyles) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Aucun style personnalisé trouvé pour cette section"
      });
    }

    return NextResponse.json({
      success: true,
      data: sectionStyles
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des styles de section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des styles de section" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/design/section/[sectionId]/styles - Mettre à jour les styles d'une section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const body = await request.json();
    const { styleConfig } = body;

    if (!styleConfig) {
      return NextResponse.json(
        { error: "Configuration de style requise" },
        { status: 400 }
      );
    }

    // Vérifier que la section existe
    const section = await prisma.contentSection.findUnique({
      where: { id: sectionId }
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour ou créer les styles de la section
    const sectionStyles = await prisma.designSectionStyles.upsert({
      where: { contentSectionId: sectionId },
      update: {
        styleConfigJson: styleConfig,
        updatedAt: new Date()
      },
      create: {
        contentSectionId: sectionId,
        styleConfigJson: styleConfig,
        isActive: true
      }
    });

    // Enregistrer dans l'historique
    await prisma.designHistory.create({
      data: {
        changeType: 'section_styles',
        oldValue: null, // Pas d'ancienne valeur lors de la création
        newValue: JSON.stringify(styleConfig),
        metadata: {
          sectionId,
          sectionName: section.sectionName,
          sectionType: section.sectionType
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: sectionStyles,
      message: "Styles de section mis à jour avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des styles de section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des styles de section" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/design/section/[sectionId]/styles - Supprimer les styles d'une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;

    const sectionStyles = await prisma.designSectionStyles.findUnique({
      where: { contentSectionId: sectionId },
      include: {
        contentSection: {
          select: {
            sectionName: true,
            sectionType: true
          }
        }
      }
    });

    if (!sectionStyles) {
      return NextResponse.json({
        success: true,
        message: "Aucun style à supprimer"
      });
    }

    // Enregistrer dans l'historique avant suppression
    await prisma.designHistory.create({
      data: {
        changeType: 'section_styles_deleted',
        oldValue: JSON.stringify(sectionStyles.styleConfigJson),
        newValue: null,
        metadata: {
          sectionId,
          sectionName: sectionStyles.contentSection.sectionName,
          sectionType: sectionStyles.contentSection.sectionType
        }
      }
    });

    // Supprimer les styles
    await prisma.designSectionStyles.delete({
      where: { contentSectionId: sectionId }
    });

    return NextResponse.json({
      success: true,
      message: "Styles de section supprimés avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des styles de section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des styles de section" },
      { status: 500 }
    );
  }
}
