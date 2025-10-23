import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const coaches = await prisma.wellnessCoach.findMany({
      orderBy: { lastName: "asc" },
    });
    return NextResponse.json({ success: true, data: coaches });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const data = await request.json();
    if (!data.slug)
      data.slug = `${data.firstName}-${data.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    const coach = await prisma.wellnessCoach.create({ data });
    return NextResponse.json({ success: true, data: coach }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
