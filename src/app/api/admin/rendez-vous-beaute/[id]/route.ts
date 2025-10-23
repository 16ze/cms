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

    const appointment = await prisma.beautyAppointment.findUnique({
      where: { id: params.id },
      include: {
        treatment: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("Erreur GET rendez-vous:", error);
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

    // Convertir la date si présente
    if (data.date) {
      data.date = new Date(data.date);
    }

    // Gérer les dates de confirmation/annulation
    if (data.status === "CONFIRMED" && !data.confirmedAt) {
      data.confirmedAt = new Date();
    }
    if (data.status === "CANCELLED" && !data.cancelledAt) {
      data.cancelledAt = new Date();
    }

    const appointment = await prisma.beautyAppointment.update({
      where: { id: params.id },
      data,
      include: {
        treatment: true,
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("Erreur PUT rendez-vous:", error);
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

    await prisma.beautyAppointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Rendez-vous supprimé",
    });
  } catch (error: any) {
    console.error("Erreur DELETE rendez-vous:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
