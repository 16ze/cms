/**
 * API: PLANNING BEAUTÉ (BEAUTY PLANNING)
 * ======================================
 * Multi-tenant ready ✅
 * Multi-métiers ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // Format: YYYY-MM-DD
    const professionalId = searchParams.get("professionalId"); // Renommé pour multi-métiers

    // Si une date spécifique est demandée
    if (date) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay(); // 0=Dimanche, 1=Lundi, etc.

      // Récupérer les horaires des professionnels pour ce jour
      const schedules = await prisma.beautyProfessionalSchedule.findMany({
        where: {
          ...tenantFilter,
          dayOfWeek,
          isActive: true,
          ...(professionalId && { professionalId }),
        },
        include: {
          professional: true,
        },
      });

      // Récupérer les rendez-vous pour cette date
      const appointments = await prisma.beautyAppointment.findMany({
        where: {
          ...tenantFilter,
          date: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
          ...(professionalId && { professionalId }),
        },
        include: {
          treatment: true,
          professional: true, // Au lieu de esthetician
          client: true,
        },
        orderBy: { time: "asc" },
      });

      // Générer les créneaux disponibles
      const availableSlots = generateAvailableSlots(
        schedules,
        appointments,
        targetDate
      );

      return NextResponse.json({
        success: true,
        data: {
          date: date,
          schedules,
          appointments,
          availableSlots,
        },
      });
    }

    // Sinon, retourner la vue générale du planning
    const professionals = await prisma.beautyProfessional.findMany({
      where: {
        ...tenantFilter,
        isActive: true,
      },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        appointments: {
          where: {
            date: {
              gte: new Date(), // Rendez-vous futurs seulement
            },
          },
          include: {
            treatment: true,
            client: true,
          },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ success: true, data: professionals });
  } catch (error) {
    console.error("❌ GET /api/admin/planning-beaute:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * Génère les créneaux disponibles pour une date donnée
 */
function generateAvailableSlots(
  schedules: any[],
  appointments: any[],
  date: Date
) {
  const slots: any[] = [];
  const slotDuration = 30; // 30 minutes par créneau

  schedules.forEach((schedule) => {
    const professional = schedule.professional;
    const startTime = parseTime(schedule.startTime);
    const endTime = parseTime(schedule.endTime);

    // Générer les créneaux de 30 minutes
    let currentTime = startTime;
    while (currentTime < endTime) {
      const slotTime = formatTime(currentTime);
      const slotEndTime = formatTime(currentTime + slotDuration);

      // Vérifier si ce créneau est libre
      const isOccupied = appointments.some((apt) => {
        return (
          apt.professionalId === schedule.professionalId &&
          apt.time === slotTime &&
          apt.status !== "CANCELLED"
        );
      });

      slots.push({
        professionalId: schedule.professionalId,
        professionalName: `${professional.firstName} ${professional.lastName}`,
        time: slotTime,
        endTime: slotEndTime,
        isAvailable: !isOccupied,
        appointment: isOccupied
          ? appointments.find(
              (apt) =>
                apt.professionalId === schedule.professionalId &&
                apt.time === slotTime
            )
          : null,
      });

      currentTime += slotDuration;
    }
  });

  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Parse une heure au format "HH:MM" en minutes depuis minuit
 */
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Formate des minutes depuis minuit en "HH:MM"
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}
