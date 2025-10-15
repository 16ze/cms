import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type && type !== 'all') {
      if (type === 'images') {
        where.mimeType = { startsWith: 'image/' };
      } else if (type === 'videos') {
        where.mimeType = { startsWith: 'video/' };
      } else if (type === 'documents') {
        where.OR = [
          { mimeType: { startsWith: 'application/' } },
          { mimeType: { startsWith: 'text/' } }
        ];
      }
    }

    // Récupérer les médias avec pagination
    const [media, total] = await Promise.all([
      prisma.contentMedia.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contentMedia.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        media,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des médias:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des médias" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID du média requis" },
        { status: 400 }
      );
    }

    // Supprimer le média
    await prisma.contentMedia.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Média supprimé avec succès"
    });

  } catch (error) {
    console.error("❌ Erreur lors de la suppression du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du média" },
      { status: 500 }
    );
  }
}
