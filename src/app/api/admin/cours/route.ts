import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const courses = await prisma.wellnessCourse.findMany({
      include: { coach: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: courses });
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
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const course = await prisma.wellnessCourse.create({
      data,
      include: { coach: true },
    });
    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
