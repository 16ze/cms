/**
 * API: PROJET INDIVIDUEL
 * ======================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant, verifyTenantAccess } from "@/middleware/tenant-context";

// GET - Un projet spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.MODELNAME.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("❌ Erreur récupération projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du projet" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un projet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.MODELNAME.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { id } = await params;
    const data = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        category: data.category,
        client: data.client,
        technologies: data.technologies,
        imageUrl: data.imageUrl,
        images: data.images,
        projectUrl: data.projectUrl,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        featured: data.featured,
        orderIndex: data.orderIndex,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("❌ Erreur modification projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du projet" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.MODELNAME.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Ressource introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Projet supprimé" });
  } catch (error) {
    console.error("❌ Erreur suppression projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}
