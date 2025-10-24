/**
 * API: STATISTIQUES BEAUTÉ (BEAUTY STATS)
 * =======================================
 * Multi-tenant ready ✅
 * Multi-métiers ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week, month, year
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculer les dates selon la période
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date = now;

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else {
      switch (period) {
        case "week":
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          dateFrom = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Statistiques générales
    const [
      totalAppointments,
      totalClients,
      totalProfessionals,
      totalProducts,
      appointmentsThisPeriod,
      revenueThisPeriod,
      topTreatments,
      appointmentsByStatus,
      appointmentsByProfessional,
      stockAlerts,
    ] = await Promise.all([
      // Total des rendez-vous
      prisma.beautyAppointment.count({
        where: { ...tenantFilter },
      }),

      // Total des clients
      prisma.beautyClient.count({
        where: { ...tenantFilter },
      }),

      // Total des professionnels
      prisma.beautyProfessional.count({
        where: { ...tenantFilter },
      }),

      // Total des produits
      prisma.beautyProduct.count({
        where: { ...tenantFilter },
      }),

      // Rendez-vous de la période
      prisma.beautyAppointment.findMany({
        where: {
          ...tenantFilter,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          treatment: true,
          professional: true, // Au lieu de esthetician
          client: true,
        },
      }),

      // Calcul du chiffre d'affaires (basé sur les prix des soins)
      prisma.beautyAppointment.findMany({
        where: {
          ...tenantFilter,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: {
            in: ["CONFIRMED", "COMPLETED"],
          },
        },
        include: {
          treatment: true,
        },
      }),

      // Top 5 des soins les plus demandés
      prisma.beautyAppointment.groupBy({
        by: ["treatmentId"],
        where: {
          ...tenantFilter,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        _count: {
          treatmentId: true,
        },
        orderBy: {
          _count: {
            treatmentId: "desc",
          },
        },
        take: 5,
      }),

      // Répartition par statut
      prisma.beautyAppointment.groupBy({
        by: ["status"],
        where: {
          ...tenantFilter,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        _count: {
          status: true,
        },
      }),

      // Répartition par professionnel
      prisma.beautyAppointment.groupBy({
        by: ["professionalId"],
        where: {
          ...tenantFilter,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        _count: {
          professionalId: true,
        },
      }),

      // Alertes de stock
      prisma.beautyProduct.findMany({
        where: {
          ...tenantFilter,
          isTracked: true,
          quantity: {
            lte: prisma.beautyProduct.fields.minQuantity,
          },
        },
        orderBy: {
          quantity: "asc",
        },
      }),
    ]);

    // Enrichir les données des top treatments
    const enrichedTopTreatments = await Promise.all(
      topTreatments.map(async (item) => {
        const treatment = await prisma.beautyTreatment.findFirst({
          where: {
            id: item.treatmentId,
            ...tenantFilter,
          },
        });
        return {
          treatmentId: item.treatmentId,
          treatmentName: treatment?.name || "Soin inconnu",
          count: item._count.treatmentId,
        };
      })
    );

    // Enrichir les données des professionnels
    const enrichedProfessionals = await Promise.all(
      appointmentsByProfessional.map(async (item) => {
        const professional = await prisma.beautyProfessional.findFirst({
          where: {
            id: item.professionalId,
            ...tenantFilter,
          },
        });
        return {
          professionalId: item.professionalId,
          professionalName: professional
            ? `${professional.firstName} ${professional.lastName}`
            : "Inconnu",
          count: item._count.professionalId,
        };
      })
    );

    // Calculer le chiffre d'affaires
    const totalRevenue = revenueThisPeriod.reduce((sum, appointment) => {
      return sum + (appointment.treatment?.price || 0);
    }, 0);

    // Statistiques de performance
    const completedAppointments = appointmentsThisPeriod.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const cancelledAppointments = appointmentsThisPeriod.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;
    const noShowAppointments = appointmentsThisPeriod.filter(
      (apt) => apt.status === "NO_SHOW"
    ).length;

    const completionRate =
      appointmentsThisPeriod.length > 0
        ? (completedAppointments / appointmentsThisPeriod.length) * 100
        : 0;

    const cancellationRate =
      appointmentsThisPeriod.length > 0
        ? ((cancelledAppointments + noShowAppointments) /
            appointmentsThisPeriod.length) *
          100
        : 0;

    // Moyenne des rendez-vous par jour
    const daysDiff = Math.ceil(
      (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgAppointmentsPerDay =
      daysDiff > 0 ? appointmentsThisPeriod.length / daysDiff : 0;

    const stats = {
      // Totaux généraux
      totals: {
        appointments: totalAppointments,
        clients: totalClients,
        professionals: totalProfessionals,
        products: totalProducts,
      },

      // Période sélectionnée
      period: {
        appointments: appointmentsThisPeriod.length,
        revenue: totalRevenue,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        completionRate: Math.round(completionRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        avgAppointmentsPerDay: Math.round(avgAppointmentsPerDay * 100) / 100,
      },

      // Analyses
      topTreatments: enrichedTopTreatments,
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
        percentage:
          appointmentsThisPeriod.length > 0
            ? Math.round(
                (item._count.status / appointmentsThisPeriod.length) * 100 * 100
              ) / 100
            : 0,
      })),
      appointmentsByProfessional: enrichedProfessionals,

      // Alertes
      stockAlerts: stockAlerts.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        minQuantity: product.minQuantity,
        status: product.quantity === 0 ? "OUT" : "LOW",
      })),

      // Métadonnées
      meta: {
        period,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ GET /api/admin/stats-beaute:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
