import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const category = await prisma.articleCategory.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("Erreur GET category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const data = await request.json();

    // Générer le slug si nécessaire
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const category = await prisma.articleCategory.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("Erreur PUT category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    await prisma.articleCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès",
    });
  } catch (error: any) {
    console.error("Erreur DELETE category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
