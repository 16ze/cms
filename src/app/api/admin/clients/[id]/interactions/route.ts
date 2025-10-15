import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { InteractionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Fonction d'authentification
async function verifyAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    // Parser les données de session JSON
    const sessionData = JSON.parse(sessionCookie.value);

    // Vérifier que les données de session sont valides
    if (!sessionData.email || !sessionData.name || !sessionData.id) {
      return null;
    }

    return {
      authenticated: true,
      userId: sessionData.id,
      userName: sessionData.name,
      user: {
        id: sessionData.id,
        name: sessionData.name,
        email: sessionData.email,
        role: sessionData.role || "admin",
      },
    };
  } catch (parseError) {
    return null;
  }
}

// GET /api/admin/clients/[id]/interactions - Récupérer les interactions d'un client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement GET /api/admin/clients/${id}/interactions`);

    // Vérifier l'authentification
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Paramètres de requête
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as InteractionType | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // Construire les filtres WHERE
    const where: any = { clientId: id };

    // Filtrer par type si spécifié
    if (type && type !== "ALL") {
      where.type = type;
    }

    // Récupérer les interactions avec Prisma
    const [interactions, totalInteractions] = await Promise.all([
      prisma.clientInteraction.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.clientInteraction.count({ where }),
    ]);

    // Statistiques par type
    const [emailCount, phoneCount, meetingCount, quoteCount, noteCount] =
      await Promise.all([
        prisma.clientInteraction.count({
          where: { clientId: id, type: "EMAIL" },
        }),
        prisma.clientInteraction.count({
          where: { clientId: id, type: "PHONE" },
        }),
        prisma.clientInteraction.count({
          where: { clientId: id, type: "MEETING" },
        }),
        prisma.clientInteraction.count({
          where: { clientId: id, type: "QUOTE" },
        }),
        prisma.clientInteraction.count({
          where: { clientId: id, type: "NOTE" },
        }),
      ]);

    console.log(
      `✅ ${interactions.length} interaction(s) trouvée(s) pour le client ${id}`
    );

    return NextResponse.json({
      success: true,
      data: interactions,
      pagination: {
        page,
        limit,
        total: totalInteractions,
        totalPages: Math.ceil(totalInteractions / limit),
      },
      stats: {
        total: totalInteractions,
        byType: {
          EMAIL: emailCount,
          PHONE: phoneCount,
          MEETING: meetingCount,
          QUOTE: quoteCount,
          NOTE: noteCount,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des interactions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/admin/clients/[id]/interactions - Créer une nouvelle interaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(
      `📝 API: Traitement POST /api/admin/clients/${id}/interactions`
    );

    // Vérifier l'authentification
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const {
      type,
      date,
      description,
      outcome,
      followUpDate,
      projectId,
      duration,
    } = body;

    // Validation des données
    if (!type || !date || !description) {
      return NextResponse.json(
        { error: "Type, date et description sont requis" },
        { status: 400 }
      );
    }

    // Validation du type
    const validTypes: InteractionType[] = [
      "EMAIL",
      "PHONE",
      "MEETING",
      "QUOTE",
      "NOTE",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type d'interaction invalide" },
        { status: 400 }
      );
    }

    // Validation de la date
    const interactionDate = new Date(date);
    if (isNaN(interactionDate.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }

    // Validation de la date de suivi si fournie
    if (followUpDate) {
      const followUp = new Date(followUpDate);
      if (isNaN(followUp.getTime())) {
        return NextResponse.json(
          { error: "Format de date de suivi invalide" },
          { status: 400 }
        );
      }
    }

    // Vérifier que le projet existe si spécifié
    if (projectId) {
      const project = await prisma.clientProject.findFirst({
        where: {
          id: projectId,
          clientId: id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Projet non trouvé pour ce client" },
          { status: 404 }
        );
      }
    }

    // Créer la nouvelle interaction avec Prisma
    const newInteraction = await prisma.clientInteraction.create({
      data: {
        clientId: id,
        projectId: projectId || null,
        type,
        date: interactionDate,
        description: description.trim(),
        outcome: outcome?.trim(),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        duration: duration ? parseInt(duration) : null,
        createdBy: auth.userName || "Admin",
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Mettre à jour la date de dernier contact du client
    await prisma.client.update({
      where: { id },
      data: { lastContact: new Date() },
    });

    console.log(`✅ Interaction créée avec l'ID: ${newInteraction.id}`);

    return NextResponse.json(
      {
        success: true,
        data: newInteraction,
        message: "Interaction créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'interaction:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/clients/[id]/interactions - Mise à jour en masse des interactions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement PUT /api/admin/clients/${id}/interactions`);

    // Vérifier l'authentification
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { operation, interactionIds, data } = body;

    if (operation === "bulk_delete" && interactionIds) {
      // Suppression en masse
      const result = await prisma.clientInteraction.deleteMany({
        where: {
          id: { in: interactionIds },
          clientId: id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} interaction(s) supprimée(s)`,
        deletedCount: result.count,
      });
    }

    if (operation === "mark_follow_up_done" && interactionIds) {
      // Marquer les suivis comme effectués
      const result = await prisma.clientInteraction.updateMany({
        where: {
          id: { in: interactionIds },
          clientId: id,
        },
        data: {
          isFollowUpDone: true,
          followUpDate: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} interaction(s) marquée(s) comme suivie(s)`,
        updatedCount: result.count,
      });
    }

    return NextResponse.json(
      { error: "Opération non supportée" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des interactions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
