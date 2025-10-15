import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ClientStatus, ClientSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/require-admin";

// GET /api/admin/clients - Récupérer tous les clients
export async function GET(request: NextRequest) {
  try {
    console.log("📝 API: Traitement GET /api/admin/clients");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Paramètres de requête pour filtrage/pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ClientStatus | null;
    const source = searchParams.get("source") as ClientSource | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Construire les filtres WHERE pour Prisma
    const where: any = {};

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
      `📝 ${clients.length} clients trouvés sur ${totalClients} total`
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

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Récupérer les données de la requête
    const body = await request.json();
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
    } = body;

    // Validation des données
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Prénom, nom et email sont requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

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

    // Validation du statut et de la source
    const validStatuses: ClientStatus[] = ["PROSPECT", "CLIENT", "INACTIVE"];
    const validSources: ClientSource[] = [
      "WEBSITE",
      "REFERRAL",
      "SOCIAL",
      "DIRECT",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    if (!validSources.includes(source)) {
      return NextResponse.json({ error: "Source invalide" }, { status: 400 });
    }

    // Créer le nouveau client avec Prisma
    const newClient = await prisma.client.create({
      data: {
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

    console.log(`✅ Client créé avec l'ID: ${newClient.id}`);

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

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    const body = await request.json();
    const { operation, clientIds, data } = body;

    if (operation === "bulk_update_status" && clientIds && data.status) {
      const validStatuses: ClientStatus[] = ["PROSPECT", "CLIENT", "INACTIVE"];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }

      // Mise à jour en masse avec Prisma
      const result = await prisma.client.updateMany({
        where: {
          id: { in: clientIds },
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

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    const { searchParams } = new URL(request.url);
    const clientIds = searchParams.get("ids")?.split(",") || [];

    if (clientIds.length === 0) {
      return NextResponse.json(
        { error: "Aucun ID de client fourni" },
        { status: 400 }
      );
    }

    // Suppression en masse avec Prisma (cascade sur projets et interactions)
    const result = await prisma.client.deleteMany({
      where: {
        id: { in: clientIds },
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
