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

    const author = await prisma.author.findUnique({
      where: { id: params.id },
    });

    if (!author) {
      return NextResponse.json(
        { success: false, error: "Auteur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: author });
  } catch (error: any) {
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
    if ((data.firstName || data.lastName) && !data.slug) {
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      data.slug = `${firstName}-${lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const author = await prisma.author.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: author });
  } catch (error: any) {
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

    await prisma.author.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Auteur supprimé avec succès",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
