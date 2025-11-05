import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ClientStatus, ClientSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";
import { validateRequest, commonSchemas } from "@/lib/validation";
import { z } from "zod";

// Schéma de validation pour créer un client
const createClientSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["PROSPECT", "CLIENT", "INACTIVE"]),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "DIRECT"]),
  notes: z.string().optional(),
});

// GET /api/admin/clients - Récupérer tous les clients
export async function GET(request: NextRequest) {
  try {
    console.log("📝 API: Traitement GET /api/admin/clients");

    // 🔐 Authentification multi-tenant
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const user = authResult;
    console.log(`✅ User authentifié: ${user.email} (type: ${user.type})`);

    // 🔒 Isolation multi-tenant
    const { tenantFilter, tenantId } = await getTenantFilter(request);
    console.log(`🔒 Tenant filter:`, tenantFilter);

    // Paramètres de requête pour filtrage/pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ClientStatus | null;
    const source = searchParams.get("source") as ClientSource | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Construire les filtres WHERE pour Prisma avec isolation tenant
    const where: any = { ...tenantFilter }; // 🔒 ISOLATION

    // Filtrage par statut
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filtrage par source
    if (source && source !== "ALL") {
      where.source = source;
    }

    // Recherche textuelle
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      where.OR = [
        { firstName: { contains: searchLower, mode: "insensitive" } },
        { lastName: { contains: searchLower, mode: "insensitive" } },
        { email: { contains: searchLower, mode: "insensitive" } },
        { company: { contains: searchLower, mode: "insensitive" } },
      ];
    }

    // Récupérer les clients avec Prisma
    const [clients, totalClients] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              budget: true,
            },
          },
          interactions: {
            select: {
              id: true,
              type: true,
              date: true,
              description: true,
              outcome: true,
            },
            orderBy: { date: "desc" },
            take: 3, // Dernières 3 interactions pour aperçu
          },
        },
        orderBy: { lastContact: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    // Statistiques globales
    const [totalCount, clientCount, prospectCount, inactiveCount] =
      await Promise.all([
        prisma.client.count(),
        prisma.client.count({ where: { status: "CLIENT" } }),
        prisma.client.count({ where: { status: "PROSPECT" } }),
        prisma.client.count({ where: { status: "INACTIVE" } }),
      ]);

    const stats = {
      total: totalCount,
      filtered: totalClients,
      clients: clientCount,
      prospects: prospectCount,
      inactive: inactiveCount,
    };

    console.log(
      `📝 ${clients.length} clients trouvés sur ${totalClients} total (tenant: ${tenantId || 'super-admin'})`
    );

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total: totalClients,
        totalPages: Math.ceil(totalClients / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des clients:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/admin/clients - Créer un nouveau client
export async function POST(request: NextRequest) {
  try {
    console.log("📝 API: Traitement POST /api/admin/clients");

    // 🔐 Authentification multi-tenant
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const user = authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // Validation avec Zod
    const validation = await validateRequest(request, createClientSchema);
    if (!validation.success) {
      return validation.response;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      status,
      source,
      notes,
    } = validation.data;

    // Vérifier si l'email existe déjà
    const existingClient = await prisma.client.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Un client avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Créer le nouveau client avec Prisma + tenantId

    if (existingClient) {
      return NextResponse.json(
        { error: "Un client avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Créer le nouveau client avec Prisma + tenantId
    const newClient = await prisma.client.create({
      data: {
        tenantId, // 🔒 ISOLATION
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        company: company?.trim(),
        address: address?.trim(),
        status,
        source,
        notes: notes?.trim(),
        lastContact: new Date(),
      },
      include: {
        projects: true,
        interactions: true,
      },
    });

    console.log(`✅ Client créé avec l'ID: ${newClient.id} pour tenant ${tenantId}`);

    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: "Client créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création du client:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/clients - Mise à jour en masse (optionnel)
export async function PUT(request: NextRequest) {
  try {
    console.log("📝 API: Traitement PUT /api/admin/clients");

    // 🔐 Authentification multi-tenant
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const user = authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const body = await request.json();
    const { operation, clientIds, data } = body;

    if (operation === "bulk_update_status" && clientIds && data.status) {
      const validStatuses: ClientStatus[] = ["PROSPECT", "CLIENT", "INACTIVE"];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }

      // Mise à jour en masse avec Prisma + isolation tenant
      const result = await prisma.client.updateMany({
        where: {
          id: { in: clientIds },
          tenantId, // 🔒 ISOLATION
        },
        data: {
          status: data.status,
          lastContact: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} client(s) mis à jour`,
        updatedCount: result.count,
      });
    }

    return NextResponse.json(
      { error: "Opération non supportée" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour en masse:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clients - Suppression en masse (optionnel)
export async function DELETE(request: NextRequest) {
  try {
    console.log("📝 API: Traitement DELETE /api/admin/clients");

    // 🔐 Authentification multi-tenant
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const user = authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const { searchParams } = new URL(request.url);
    const clientIds = searchParams.get("ids")?.split(",") || [];

    if (clientIds.length === 0) {
      return NextResponse.json(
        { error: "Aucun ID de client fourni" },
        { status: 400 }
      );
    }

    // Suppression en masse avec Prisma (cascade sur projets et interactions) + isolation tenant
    const result = await prisma.client.deleteMany({
      where: {
        id: { in: clientIds },
        tenantId, // 🔒 ISOLATION
      },
    });

    console.log(`✅ ${result.count} client(s) supprimé(s)`);

    return NextResponse.json({
      success: true,
      message: `${result.count} client(s) supprimé(s)`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des clients:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
