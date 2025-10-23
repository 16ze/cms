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

    const treatment = await prisma.beautyTreatment.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { success: false, error: "Soin introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: treatment });
  } catch (error: any) {
    console.error("Erreur GET soin:", error);
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

    const treatment = await prisma.beautyTreatment.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: treatment });
  } catch (error: any) {
    console.error("Erreur PUT soin:", error);
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

    // Vérifier s'il y a des rendez-vous liés
    const appointmentsCount = await prisma.beautyAppointment.count({
      where: { treatmentId: params.id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer : ${appointmentsCount} rendez-vous lié(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.beautyTreatment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Soin supprimé",
    });
  } catch (error: any) {
    console.error("Erreur DELETE soin:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
