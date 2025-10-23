import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const articles = await prisma.article.findMany({
      include: { author: true, category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error("❌ Erreur récupération articles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const data = await request.json();

    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const article = await prisma.article.create({
      data,
      include: { author: true, category: true },
    });

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur création article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'article" },
      { status: 500 }
    );
  }
}

