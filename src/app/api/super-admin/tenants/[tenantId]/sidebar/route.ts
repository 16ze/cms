/**
 * API: GESTION SIDEBAR PERSONNALISÉE PAR TENANT (SUPER ADMIN)
 * ============================================================
 * Permet au super-admin d'ajouter/retirer des éléments sidebar
 * pour chaque tenant selon leurs besoins spécifiques
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSuperAdmin } from "@/lib/auth";

// Liste de TOUS les éléments disponibles
const AVAILABLE_SIDEBAR_ELEMENTS = [
  // Corporate
  {
    id: "projets",
    label: "Projets",
    icon: "Briefcase",
    href: "/admin/projets",
    category: "CORPORATE",
  },
  {
    id: "equipe",
    label: "Équipe",
    icon: "Users",
    href: "/admin/equipe",
    category: "CORPORATE",
  },

  // E-commerce
  {
    id: "produits",
    label: "Produits",
    icon: "Package",
    href: "/admin/produits",
    category: "ECOMMERCE",
  },
  {
    id: "commandes",
    label: "Commandes",
    icon: "ShoppingCart",
    href: "/admin/commandes",
    category: "ECOMMERCE",
  },

  // Blog
  {
    id: "articles",
    label: "Articles",
    icon: "FileText",
    href: "/admin/articles",
    category: "BLOG",
  },
  {
    id: "categories",
    label: "Catégories",
    icon: "Tag",
    href: "/admin/categories",
    category: "BLOG",
  },
  {
    id: "auteurs",
    label: "Auteurs",
    icon: "UserCheck",
    href: "/admin/auteurs",
    category: "BLOG",
  },

  // Restaurant
  {
    id: "menu",
    label: "Menu",
    icon: "Utensils",
    href: "/admin/menu",
    category: "RESTAURANT",
  },
  {
    id: "tables",
    label: "Tables",
    icon: "Grid",
    href: "/admin/tables",
    category: "RESTAURANT",
  },

  // Bien-être & Fitness
  {
    id: "cours",
    label: "Cours",
    icon: "Dumbbell",
    href: "/admin/cours",
    category: "WELLNESS",
  },
  {
    id: "coaches",
    label: "Coaches",
    icon: "UserCheck",
    href: "/admin/coaches",
    category: "WELLNESS",
  },

  // Beauté & Esthétique
  {
    id: "soins",
    label: "Soins",
    icon: "Sparkles",
    href: "/admin/soins",
    category: "BEAUTY",
  },
  {
    id: "rendez-vous-beaute",
    label: "Rendez-vous",
    icon: "Calendar",
    href: "/admin/rendez-vous-beaute",
    category: "BEAUTY",
  },
  {
    id: "estheticiennes",
    label: "Esthéticiennes",
    icon: "Users",
    href: "/admin/estheticiennes",
    category: "BEAUTY",
  },
  {
    id: "clients-beaute",
    label: "Clients",
    icon: "UserCheck",
    href: "/admin/clients-beaute",
    category: "BEAUTY",
  },
  {
    id: "planning-beaute",
    label: "Planning",
    icon: "Calendar",
    href: "/admin/planning-beaute",
    category: "BEAUTY",
  },
  {
    id: "produits-beaute",
    label: "Produits",
    icon: "Package",
    href: "/admin/produits-beaute",
    category: "BEAUTY",
  },
  {
    id: "stats-beaute",
    label: "Rapports",
    icon: "BarChart3",
    href: "/admin/stats-beaute",
    category: "BEAUTY",
  },

  // Consultation & Thérapie
  {
    id: "patients",
    label: "Patients",
    icon: "Users",
    href: "/admin/patients",
    category: "CONSULTATION",
  },
  {
    id: "therapeutes",
    label: "Thérapeutes",
    icon: "UserCheck",
    href: "/admin/therapeutes",
    category: "CONSULTATION",
  },

  // Prestations Professionnelles
  {
    id: "devis",
    label: "Devis",
    icon: "FileText",
    href: "/admin/devis",
    category: "SERVICES",
  },
  {
    id: "facturation",
    label: "Facturation",
    icon: "CreditCard",
    href: "/admin/facturation",
    category: "SERVICES",
  },

  // Galerie
  {
    id: "galerie",
    label: "Galerie",
    icon: "Image",
    href: "/admin/galerie",
    category: "PORTFOLIO",
  },
];

/**
 * GET - Récupérer les éléments sidebar d'un tenant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    console.log("📋 GET sidebar elements for tenant:", tenantId);

    // 🔐 Vérifier que c'est le super admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Récupérer le tenant avec son template
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        template: {
          include: {
            sidebarConfigs: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant non trouvé" },
        { status: 404 }
      );
    }

    // Éléments du template de base
    const templateElements = tenant.template.sidebarConfigs.map((config) => ({
      id: config.elementId,
      label: config.label,
      icon: config.icon,
      href: config.href,
      category: config.category,
      orderIndex: config.orderIndex,
      isFromTemplate: config.isRequired || false, // Seuls les éléments required sont non-supprimables
    }));

    // Éléments disponibles (non encore ajoutés)
    const usedIds = new Set(templateElements.map((e) => e.id));
    const availableElements = AVAILABLE_SIDEBAR_ELEMENTS.filter(
      (e) => !usedIds.has(e.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          template: tenant.template.displayName,
        },
        currentElements: templateElements,
        availableElements,
      },
    });
  } catch (error: any) {
    console.error("❌ GET sidebar elements:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Ajouter un élément à la sidebar d'un tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    console.log("➕ ADD sidebar element for tenant:", tenantId);

    // 🔐 Vérifier que c'est le super admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const body = await request.json();
    const { elementId } = body;

    // Vérifier que l'élément existe
    const element = AVAILABLE_SIDEBAR_ELEMENTS.find((e) => e.id === elementId);
    if (!element) {
      return NextResponse.json(
        { success: false, error: "Élément non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le tenant avec son template
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        template: {
          include: {
            sidebarConfigs: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'élément n'existe pas déjà
    const exists = tenant.template.sidebarConfigs.some(
      (c) => c.elementId === elementId
    );
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Cet élément existe déjà dans la sidebar" },
        { status: 400 }
      );
    }

    // Calculer le prochain orderIndex
    const maxOrderIndex = Math.max(
      ...tenant.template.sidebarConfigs.map((c) => c.orderIndex),
      0
    );

    // Ajouter l'élément à la sidebar du template
    const newElement = await prisma.templateSidebarConfig.create({
      data: {
        templateId: tenant.templateId,
        elementId: element.id,
        label: element.label,
        icon: element.icon,
        href: element.href,
        orderIndex: maxOrderIndex + 1,
        category: element.category,
      },
    });

    console.log(
      `✅ Élément "${element.label}" ajouté pour tenant ${tenant.name}`
    );

    return NextResponse.json({
      success: true,
      data: newElement,
      message: `Élément "${element.label}" ajouté avec succès`,
    });
  } catch (error: any) {
    console.error("❌ ADD sidebar element:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Retirer un élément de la sidebar d'un tenant
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    console.log("➖ REMOVE sidebar element for tenant:", tenantId);

    // 🔐 Vérifier que c'est le super admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const { searchParams } = new URL(request.url);
    const elementId = searchParams.get("elementId");

    if (!elementId) {
      return NextResponse.json(
        { success: false, error: "elementId requis" },
        { status: 400 }
      );
    }

    // Récupérer le tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'élément
    await prisma.templateSidebarConfig.deleteMany({
      where: {
        templateId: tenant.templateId,
        elementId,
      },
    });

    console.log(`✅ Élément "${elementId}" retiré pour tenant ${tenant.name}`);

    return NextResponse.json({
      success: true,
      message: `Élément retiré avec succès`,
    });
  } catch (error: any) {
    console.error("❌ REMOVE sidebar element:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
