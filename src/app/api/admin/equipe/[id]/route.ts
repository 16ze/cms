import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

// GET - Un membre spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: teamMember });
  } catch (error) {
    console.error("❌ Erreur récupération membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du membre" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un membre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const data = await request.json();

    const teamMember = await prisma.teamMember.update({
      where: { id },
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
        isActive: data.isActive,
        orderIndex: data.orderIndex,
      },
    });

    return NextResponse.json({ success: true, data: teamMember });
  } catch (error) {
    console.error("❌ Erreur modification membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du membre" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un membre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Membre supprimé" });
  } catch (error) {
    console.error("❌ Erreur suppression membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    );
  }
}
