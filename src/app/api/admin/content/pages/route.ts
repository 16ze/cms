import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/content/pages - Récupérer toutes les pages
export async function GET() {
  try {
    const pages = await prisma.contentPage.findMany({
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des pages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des pages" },
      { status: 500 }
    );
  }
}

// POST /api/admin/content/pages - Créer une nouvelle page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, metaTitle, metaDescription, orderIndex } = body;

    // Validation
    if (!slug || !title) {
      return NextResponse.json(
        { error: "Slug et titre requis" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existingPage = await prisma.contentPage.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "Une page avec ce slug existe déjà" },
        { status: 409 }
      );
    }

    const page = await prisma.contentPage.create({
      data: {
        slug,
        title,
        metaTitle,
        metaDescription,
        orderIndex: orderIndex || 0
      },
      include: {
        sections: true
      }
    });

    return NextResponse.json({
      success: true,
      data: page
    }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur lors de la création de la page:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la page" },
      { status: 500 }
    );
  }
}
