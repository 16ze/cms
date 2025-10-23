/**
 * API SUPER ADMIN - GESTION DES TENANTS
 * ======================================
 * Liste et gère tous les clients (tenants)
 */

import { NextRequest, NextResponse } from "next/server";
import { ensureSuperAdmin } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET - Lister tous les tenants
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que c'est un Super Admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Récupérer tous les tenants avec leurs informations
    const tenants = await prisma.tenant.findMany({
      include: {
        template: {
          select: {
            id: true,
            displayName: true,
            category: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            beautyAppointments: true,
            wellnessBookings: true,
            products: true,
            orders: true,
            articles: true,
            restaurantReservations: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les données pour l'affichage
    const formattedTenants = tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email,
      domain: tenant.domain,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      template: tenant.template,
      users: tenant.users,
      stats: {
        totalUsers: tenant._count.users,
        totalBeautyAppointments: tenant._count.beautyAppointments,
        totalWellnessBookings: tenant._count.wellnessBookings,
        totalProducts: tenant._count.products,
        totalOrders: tenant._count.orders,
        totalArticles: tenant._count.articles,
        totalRestaurantReservations: tenant._count.restaurantReservations,
        totalProjects: tenant._count.projects,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedTenants,
    });
  } catch (error: any) {
    console.error("❌ Erreur récupération tenants:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération des tenants",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouveau tenant
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que c'est un Super Admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { name, email, slug, templateId, domain, userPassword } = body;

    // Validation
    if (!name || !email || !slug || !templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Nom, email, slug et template sont requis",
        },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          success: false,
          error: "Un tenant avec ce slug existe déjà",
        },
        { status: 400 }
      );
    }

    // Vérifier si le template existe
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template non trouvé",
        },
        { status: 404 }
      );
    }

    // Créer le tenant avec le premier utilisateur en une transaction
    const bcrypt = require("bcryptjs");
    const password = userPassword || "demo2025";
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le tenant
      const newTenant = await tx.tenant.create({
        data: {
          name,
          email,
          slug,
          templateId,
          domain: domain || null,
          isActive: true,
        },
        include: {
          template: true,
        },
      });

      // 2. Créer le premier utilisateur admin
      const firstName = name.split(" ")[0] || "Admin";
      const lastName = name.split(" ").slice(1).join(" ") || name;

      const tenantUser = await tx.tenantUser.create({
        data: {
          tenantId: newTenant.id,
          email: email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "OWNER", // Premier utilisateur = OWNER
          isActive: true,
        },
      });

      // 3. Activer le template pour ce tenant (créer SiteTemplate)
      await tx.siteTemplate.create({
        data: {
          tenantId: newTenant.id,
          templateId: templateId,
          isActive: true,
          activatedAt: new Date(),
        },
      });

      return { tenant: newTenant, user: tenantUser };
    });

    return NextResponse.json(
      {
        success: true,
        data: result.tenant,
        user: {
          email: result.user.email,
          password: password, // Retourner le mot de passe en clair (à communiquer au client)
        },
        message: `Tenant créé avec succès ! Login: ${result.user.email} / Password: ${password}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Erreur création tenant:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la création du tenant",
      },
      { status: 500 }
    );
  }
}

