/**
 * API: PROJETS CORPORATE
 * ======================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant, verifyTenantAccess } from "@/middleware/tenant-context";

// GET - Liste des projets
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const where: any = { ...tenantFilter }; // 🔒 ISOLATION
    if (status) where.status = status;
    if (featured) where.featured = featured === "true";

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("❌ Erreur récupération projets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

// POST - Créer un projet
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const data = await request.json();

    // Générer le slug si non fourni
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const project = await prisma.project.create({
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
        status: data.status || "COMPLETED",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        featured: data.featured || false,
        orderIndex: data.orderIndex || 0,
        tenantId, // 🔒 ISOLATION
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur création projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}
