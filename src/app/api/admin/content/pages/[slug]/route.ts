import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/content/pages/[slug] - Récupérer une page par slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const page = await prisma.contentPage.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la page:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la page" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content/pages/[slug] - Modifier une page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, metaTitle, metaDescription, status, isActive, orderIndex } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Titre requis" },
        { status: 400 }
      );
    }

    const page = await prisma.contentPage.update({
      where: { slug },
      data: {
        title,
        metaTitle,
        metaDescription,
        status,
        isActive,
        orderIndex
      },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error("❌ Erreur lors de la modification de la page:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la page" },
      { status: 500 }
    );
  }
}
