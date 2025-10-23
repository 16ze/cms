import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const tables = await prisma.restaurantTable.findMany({ orderBy: { number: "asc" } });
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const data = await request.json();
    const table = await prisma.restaurantTable.create({ data });
    return NextResponse.json({ success: true, data: table }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

