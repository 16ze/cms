import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const treatmentId = searchParams.get("treatmentId");
    const date = searchParams.get("date");

    const where: any = {};
    if (status) where.status = status;
    if (treatmentId) where.treatmentId = treatmentId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const appointments = await prisma.beautyAppointment.findMany({
      where,
      include: {
        treatment: true,
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    console.error("Erreur GET rendez-vous beauté:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const data = await request.json();

    // Validation
    if (!data.treatmentId) {
      return NextResponse.json(
        { success: false, error: "Le soin est requis" },
        { status: 400 }
      );
    }

    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Informations client requises" },
        { status: 400 }
      );
    }

    if (!data.date || !data.time) {
      return NextResponse.json(
        { success: false, error: "Date et heure requises" },
        { status: 400 }
      );
    }

    const appointment = await prisma.beautyAppointment.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: {
        treatment: true,
      },
    });

    return NextResponse.json(
      { success: true, data: appointment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erreur POST rendez-vous beauté:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
