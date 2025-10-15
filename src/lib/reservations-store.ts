// Stockage temporaire partagé des réservations
// En production, ceci serait dans une base de données

export interface ReservationData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectDescription: string;
  communicationMethod: "VISIO" | "PHONE";
  reservationType: "DISCOVERY" | "CONSULTATION" | "PRESENTATION" | "FOLLOWUP";
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  userId: string;
  adminNotes?: string;
}

import fs from "fs";
import path from "path";

// Fichier de stockage temporaire pour les réservations
const STORAGE_FILE = path.join(process.cwd(), "temp-reservations.json");

// Fonction pour charger les réservations depuis le fichier
function loadReservations(): ReservationData[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf-8");
      const reservations = JSON.parse(data);
      console.log(
        "🏪 ReservationsStore: Chargement de",
        reservations.length,
        "réservations depuis le fichier"
      );
      return reservations;
    }
  } catch (error) {
    console.error("❌ Erreur lors du chargement des réservations:", error);
  }
  console.log(
    "🏪 ReservationsStore: Aucune réservation trouvée, initialisation avec un tableau vide"
  );
  return [];
}

// Fonction pour sauvegarder les réservations dans le fichier
function saveReservations(reservations: ReservationData[]): void {
  try {
    fs.writeFileSync(
      STORAGE_FILE,
      JSON.stringify(reservations, null, 2),
      "utf-8"
    );
    console.log(
      "💾 ReservationsStore: Sauvegarde de",
      reservations.length,
      "réservations dans le fichier"
    );
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde des réservations:", error);
  }
}

// Stockage global des réservations (simulé - en production utiliser une BDD)
// Utilisation d'un store global pour s'assurer que toutes les APIs partagent les mêmes données
let reservationsStore: ReservationData[] = loadReservations();

export class ReservationsStore {
  static getAll(): ReservationData[] {
    console.log(
      "📊 ReservationsStore.getAll(): Retour de",
      reservationsStore.length,
      "réservations"
    );
    return [...reservationsStore];
  }

  static getById(id: string): ReservationData | undefined {
    return reservationsStore.find((r) => r.id === id);
  }

  static add(reservation: ReservationData): void {
    reservationsStore.push(reservation);
    saveReservations(reservationsStore);
    console.log(
      "📝 ReservationsStore.add(): Ajout de la réservation",
      reservation.id,
      "- Total:",
      reservationsStore.length
    );
  }

  static update(
    id: string,
    updates: Partial<ReservationData>
  ): ReservationData | null {
    const index = reservationsStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    reservationsStore[index] = { ...reservationsStore[index], ...updates };
    saveReservations(reservationsStore);
    return reservationsStore[index];
  }

  static delete(id: string): boolean {
    const index = reservationsStore.findIndex((r) => r.id === id);
    if (index === -1) return false;

    reservationsStore.splice(index, 1);
    saveReservations(reservationsStore);
    return true;
  }

  static getCount(): number {
    return reservationsStore.length;
  }
}

// Instance singleton pour faciliter l'import
export const reservationsStoreInstance = ReservationsStore;
