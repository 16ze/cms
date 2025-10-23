import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

// GET - Liste des membres de l'équipe
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const department = searchParams.get("department");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (department) where.department = department;

    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json({ success: true, data: teamMembers });
  } catch (error) {
    console.error("❌ Erreur récupération équipe:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'équipe" },
      { status: 500 }
    );
  }
}

// POST - Créer un membre
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const data = await request.json();

    // Générer le slug si non fourni
    if (!data.slug) {
      data.slug = `${data.firstName}-${data.lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        slug: data.slug,
        position: data.position,
        department: data.department,
        bio: data.bio,
        photoUrl: data.photoUrl,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        twitter: data.twitter,
        github: data.github,
        website: data.website,
        skills: data.skills,
        isActive: data.isActive !== undefined ? data.isActive : true,
        orderIndex: data.orderIndex || 0,
      },
    });

    return NextResponse.json(
      { success: true, data: teamMember },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur création membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du membre" },
      { status: 500 }
    );
  }
}
