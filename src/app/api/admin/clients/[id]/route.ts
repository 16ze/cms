import { NextRequest, NextResponse } from "next/server";
import { ClientStatus, ClientSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/require-admin";

// GET /api/admin/clients/[id] - Récupérer un client spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement GET /api/admin/clients/${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Rechercher le client avec Prisma
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        interactions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    console.log(`✅ Client trouvé: ${client.firstName} ${client.lastName}`);

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du client:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/clients/[id] - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement PUT /api/admin/clients/${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Vérifier que le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Récupérer les données de mise à jour
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

    // Validation des données obligatoires
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

    // Vérifier si l'email existe déjà pour un autre client
    if (email.toLowerCase().trim() !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Un autre client avec cet email existe déjà" },
          { status: 409 }
        );
      }
    }

    // Validation du statut et de la source
    const validStatuses: ClientStatus[] = ["PROSPECT", "CLIENT", "INACTIVE"];
    const validSources: ClientSource[] = [
      "WEBSITE",
      "REFERRAL",
      "SOCIAL",
      "DIRECT",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    if (source && !validSources.includes(source)) {
      return NextResponse.json({ error: "Source invalide" }, { status: 400 });
    }

    // Mettre à jour le client avec Prisma
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        company: company?.trim(),
        address: address?.trim(),
        status: status || existingClient.status,
        source: source || existingClient.source,
        notes: notes?.trim(),
        lastContact: new Date(),
      },
      include: {
        projects: true,
        interactions: true,
      },
    });

    console.log(
      `✅ Client mis à jour: ${updatedClient.firstName} ${updatedClient.lastName}`
    );

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: "Client mis à jour avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du client:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clients/[id] - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement DELETE /api/admin/clients/${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Vérifier que le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Supprimer le client (cascade automatique pour projets et interactions)
    await prisma.client.delete({
      where: { id },
    });

    console.log(
      `✅ Client supprimé: ${existingClient.firstName} ${existingClient.lastName}`
    );

    return NextResponse.json({
      success: true,
      message: "Client supprimé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du client:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/clients/[id] - Mise à jour partielle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 API: Traitement PATCH /api/admin/clients/${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;

    // Vérifier que le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Récupérer les données de mise à jour partielle
    const body = await request.json();
    const updateData: any = {};

    // Valider et appliquer les mises à jour
    if (body.firstName !== undefined) {
      if (!body.firstName.trim()) {
        return NextResponse.json(
          { error: "Le prénom ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.firstName = body.firstName.trim();
    }

    if (body.lastName !== undefined) {
      if (!body.lastName.trim()) {
        return NextResponse.json(
          { error: "Le nom ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.lastName = body.lastName.trim();
    }

    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Format d'email invalide" },
          { status: 400 }
        );
      }

      // Vérifier unicité email
      if (body.email.toLowerCase().trim() !== existingClient.email) {
        const emailExists = await prisma.client.findUnique({
          where: { email: body.email.toLowerCase().trim() },
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Un autre client avec cet email existe déjà" },
            { status: 409 }
          );
        }
      }

      updateData.email = body.email.toLowerCase().trim();
    }

    if (body.status !== undefined) {
      const validStatuses: ClientStatus[] = ["PROSPECT", "CLIENT", "INACTIVE"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.source !== undefined) {
      const validSources: ClientSource[] = [
        "WEBSITE",
        "REFERRAL",
        "SOCIAL",
        "DIRECT",
      ];
      if (!validSources.includes(body.source)) {
        return NextResponse.json({ error: "Source invalide" }, { status: 400 });
      }
      updateData.source = body.source;
    }

    // Champs optionnels
    if (body.phone !== undefined) updateData.phone = body.phone?.trim();
    if (body.company !== undefined) updateData.company = body.company?.trim();
    if (body.address !== undefined) updateData.address = body.address?.trim();
    if (body.notes !== undefined) updateData.notes = body.notes?.trim();

    // Mettre à jour la date de dernière modification
    updateData.lastContact = new Date();

    // Mettre à jour avec Prisma
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        projects: true,
        interactions: true,
      },
    });

    console.log(
      `✅ Client partiellement mis à jour: ${updatedClient.firstName} ${updatedClient.lastName}`
    );

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: "Client mis à jour avec succès",
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour partielle du client:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
