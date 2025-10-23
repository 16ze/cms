"use client";

import React, { useState, useEffect, Suspense } from "react";
import "@/styles/admin-reservations-mobile.css";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  X,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Monitor,
  Edit,
  Trash2,
} from "lucide-react";
import { useReservationsContent, useCommonContent } from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  reservationType: "DISCOVERY" | "CONSULTATION" | "PRESENTATION" | "FOLLOWUP";
  status: ReservationStatus;
  projectDescription: string;
  communicationMethod: "VISIO" | "PHONE";
  createdAt: string;
}

// Fonctions utilitaires pour l'affichage
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReservationTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    DISCOVERY: "Découverte",
    CONSULTATION: "Consultation",
    PRESENTATION: "Présentation",
    FOLLOWUP: "Suivi",
  };
  return types[type] || type;
};

const getStatusBadgeClasses = (status: ReservationStatus) => {
  const baseClasses = "admin-reservations-status";
  const statusClasses: Record<ReservationStatus, string> = {
    PENDING: `${baseClasses} status-pending`,
    CONFIRMED: `${baseClasses} status-confirmed`,
    CANCELLED: `${baseClasses} status-cancelled`,
  };
  return statusClasses[status];
};

const getStatusLabel = (status: ReservationStatus) => {
  const labels: Record<ReservationStatus, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    CANCELLED: "Annulée",
  };
  return labels[status];
};

const getCommunicationMethodLabel = (method: "VISIO" | "PHONE") => {
  const labels: Record<string, string> = {
    VISIO: "Visioconférence",
    PHONE: "Téléphone",
  };
  return labels[method] || method;
};

const getCommunicationMethodIcon = (method: "VISIO" | "PHONE") => {
  return method === "VISIO" ? (
    <Video className="w-4 h-4" />
  ) : (
    <Phone className="w-4 h-4" />
  );
};

const getReservationTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactElement> = {
    DISCOVERY: <MessageSquare className="w-4 h-4" />,
    CONSULTATION: <Monitor className="w-4 h-4" />,
    PRESENTATION: <User className="w-4 h-4" />,
    FOLLOWUP: <Calendar className="w-4 h-4" />,
  };
  return icons[type] || <MessageSquare className="w-4 h-4" />;
};

// Composant pour le contenu des réservations
function ReservationsContent() {
  const resContent = useReservationsContent();
  const common = useCommonContent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [cancelForm, setCancelForm] = useState({
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SOLUTION TEMPORAIRE : Bypass de l'authentification pour le développement
  // TODO: Réactiver l'authentification complète plus tard
  useEffect(() => {
    console.log("🔓 Mode développement : authentification bypassée");
    // Simuler un utilisateur admin temporaire
    setUser({
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
    });
    setLoading(false);
  }, []);

  // Charger les réservations depuis l'API
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch("/api/booking/reservation");
        const data = await response.json();

        if (response.ok && data.success) {
          // Mapper les données de l'API vers le format attendu par l'interface
          const formattedReservations: Reservation[] = data.reservations.map(
            (res: any) => ({
              id: res.id,
              clientName: res.clientName,
              clientEmail: res.clientEmail,
              clientPhone: res.clientPhone,
              startTime: res.startTime,
              endTime: res.endTime,
              reservationType: res.reservationType,
              status: res.status,
              projectDescription: res.projectDescription,
              communicationMethod: res.communicationMethod,
              createdAt: res.createdAt,
            })
          );

          setReservations(formattedReservations);
          setFilteredReservations(formattedReservations);
        } else {
          console.error("Erreur lors du chargement des réservations:", data);
          // En cas d'erreur, afficher un tableau vide
          setReservations([]);
          setFilteredReservations([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réservations:", error);
        setReservations([]);
        setFilteredReservations([]);
      }
    };

    // Ne charger les réservations que si l'utilisateur est authentifié
    if (user) {
      loadReservations();
    }
  }, [user]);

  // Fonction pour rafraîchir les réservations
  const refreshReservations = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/booking/reservation");
      const data = await response.json();

      if (response.ok && data.success) {
        const formattedReservations: Reservation[] = data.reservations.map(
          (res: any) => ({
            id: res.id,
            clientName: res.clientName,
            clientEmail: res.clientEmail,
            clientPhone: res.clientPhone,
            startTime: res.startTime,
            endTime: res.endTime,
            reservationType: res.reservationType,
            status: res.status,
            projectDescription: res.projectDescription,
            communicationMethod: res.communicationMethod,
            createdAt: res.createdAt,
          })
        );

        setReservations(formattedReservations);
        setFilteredReservations(formattedReservations);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour confirmer une réservation
  const handleConfirmReservation = async (reservationId: string) => {
    try {
      const response = await fetch(
        `/api/booking/reservation/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CONFIRMED",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(resContent.messages.confirmSuccess);
        // Rafraîchir la liste des réservations
        await refreshReservations();
      } else {
        console.error(resContent.messages.confirmError, result.error);
      }
    } catch (error) {
      console.error(resContent.messages.confirmError, error);
    }
  };

  // Fonction pour ouvrir les détails d'une réservation
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  // Fonction pour ouvrir la modale de déplacement
  const handleOpenReschedule = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    const startDate = new Date(reservation.startTime);
    const endDate = new Date(reservation.endTime);

    setRescheduleForm({
      date: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      reason: "",
    });

    setIsDetailModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  // Fonction pour ouvrir la modale d'annulation
  const handleOpenCancel = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelForm({ reason: "" });
    setIsDetailModalOpen(false);
    setIsCancelModalOpen(true);
  };

  // Fonction pour déplacer une réservation
  const handleRescheduleReservation = async () => {
    if (!selectedReservation || isSubmitting) return;

    if (
      !rescheduleForm.date ||
      !rescheduleForm.startTime ||
      !rescheduleForm.endTime
    ) {
      alert(resContent.messages.requiredDateFields);
      return;
    }

    if (!rescheduleForm.reason.trim()) {
      alert(resContent.messages.requiredRescheduleReason);
      return;
    }

    setIsSubmitting(true);

    try {
      const newStartTime = new Date(
        `${rescheduleForm.date}T${rescheduleForm.startTime}`
      );
      const newEndTime = new Date(
        `${rescheduleForm.date}T${rescheduleForm.endTime}`
      );

      const response = await fetch(
        `/api/booking/reservation/${selectedReservation.id}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newStartTime: newStartTime.toISOString(),
            newEndTime: newEndTime.toISOString(),
            reason: rescheduleForm.reason,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(resContent.messages.rescheduleSuccess);
        await refreshReservations();
        setIsRescheduleModalOpen(false);
        setRescheduleForm({ date: "", startTime: "", endTime: "", reason: "" });
      } else {
        console.error(resContent.messages.rescheduleError, result.error);
        alert(`${resContent.messages.rescheduleErrorAlert}: ${result.error}`);
      }
    } catch (error) {
      console.error(resContent.messages.rescheduleErrorAlert, error);
      alert(resContent.messages.rescheduleErrorAlert);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour annuler une réservation
  const handleCancelConfirmedReservation = async () => {
    if (!selectedReservation || isSubmitting) return;

    if (!cancelForm.reason.trim()) {
      alert(resContent.messages.requiredCancelReason);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/booking/reservation/${selectedReservation.id}/cancel-confirmed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: cancelForm.reason,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(resContent.messages.cancelSuccess);
        await refreshReservations();
        setIsCancelModalOpen(false);
        setCancelForm({ reason: "" });
      } else {
        console.error(resContent.messages.cancelError, result.error);
        alert(`${resContent.messages.cancelErrorAlert}: ${result.error}`);
      }
    } catch (error) {
      console.error(resContent.messages.cancelErrorAlert, error);
      alert(resContent.messages.cancelErrorAlert);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour annuler une réservation
  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(
        `/api/booking/reservation/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Réservation annulée avec succès");
        // Rafraîchir la liste des réservations
        await refreshReservations();
      } else {
        console.error("❌ Erreur lors de l'annulation:", result.error);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'annulation de la réservation:", error);
    }
  };

  // Filtrer les réservations en fonction des filtres
  useEffect(() => {
    let filtered = [...reservations];

    // Filtre par statut
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.clientName.toLowerCase().includes(term) ||
          r.clientEmail.toLowerCase().includes(term) ||
          r.projectDescription.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, searchTerm]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <header className="admin-reservations-header mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
            <div>
              <h1 className="admin-reservations-title text-lg sm:text-xl lg:text-2xl font-bold mb-1 lg:mb-2 text-slate-900">
                {resContent.header.title}
              </h1>
              <p className="admin-reservations-subtitle text-sm sm:text-base text-slate-600">
                {resContent.header.subtitle}
              </p>
            </div>
            <Button
              onClick={refreshReservations}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="admin-button-outline admin-button-sm self-start sm:self-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline ml-2">
                {refreshing ? resContent.header.refreshing : resContent.header.refresh}
              </span>
            </Button>
          </div>
        </header>

        {/* Filtres et recherche */}
        <div className="admin-reservations-filters mb-4 lg:mb-6">
          <div className="admin-reservations-search flex-1 relative mb-3 lg:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <Input
              type="text"
              placeholder={resContent.filters.searchPlaceholder}
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-reservations-filter-buttons flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === "ALL" ? "default" : "outline"}
              onClick={() => setStatusFilter("ALL")}
              className={`whitespace-nowrap text-xs h-9 admin-button-sm ${
                statusFilter === "ALL"
                  ? "admin-button-primary"
                  : "admin-button-outline"
              }`}
            >
              {resContent.filters.all}
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
              className="whitespace-nowrap text-amber-600 dark:text-amber-400 text-xs h-9"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
              {resContent.filters.pending}
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CONFIRMED")}
              className="whitespace-nowrap text-green-600 dark:text-green-400 text-xs h-9"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
              {resContent.filters.confirmed}
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "CANCELLED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CANCELLED")}
              className="whitespace-nowrap text-red-600 dark:text-red-400 text-xs h-9"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
              {resContent.filters.cancelled}
            </Button>
          </div>
        </div>

        {/* Liste des réservations */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="admin-reservations-table-container overflow-x-auto">
            <table className="admin-reservations-table w-full text-sm">
              <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-600 font-semibold">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-left font-medium">
                    Client
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left font-medium">
                    Type
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left font-medium mobile-hide">
                    Date
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left font-medium mobile-hide">
                    Horaire
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left font-medium">
                    Statut
                  </th>
                  <th className="px-3 md:px-4 py-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {reservation.clientName}
                        </div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-xs truncate">
                          {reservation.clientEmail}
                        </div>
                        <div className="md:hidden text-xs text-neutral-500 mt-1">
                          {formatDate(reservation.startTime)} ·{" "}
                          {formatTime(reservation.startTime)}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {getReservationTypeLabel(reservation.reservationType)}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4 mobile-hide">
                        {formatDate(reservation.startTime)}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4 mobile-hide">
                        {formatTime(reservation.startTime)} -{" "}
                        {formatTime(reservation.endTime)}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <span
                          className={getStatusBadgeClasses(reservation.status)}
                        >
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
                        <div className="admin-reservations-actions flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="admin-button-icon admin-button-sm h-8 w-8 sm:h-8 sm:w-8 p-0"
                            title="Voir détails"
                            onClick={() => handleViewDetails(reservation)}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>

                          {reservation.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="admin-button-icon admin-button-sm h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                                title="Confirmer"
                                onClick={() =>
                                  handleConfirmReservation(reservation.id)
                                }
                              >
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="admin-button-icon admin-button-sm h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                title="Annuler"
                                onClick={() =>
                                  handleCancelReservation(reservation.id)
                                }
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-neutral-500 dark:text-neutral-400"
                    >
                      Aucune réservation ne correspond à vos critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modale de détails de réservation */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="admin-reservations-modal max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="admin-reservations-modal modal-header">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Eye className="w-5 h-5" />
              Détails de la réservation
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="admin-reservations-modal modal-body space-y-4 sm:space-y-6 py-2 sm:py-4">
              {/* Informations du client */}
              <div className="admin-reservations-info-section bg-slate-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-slate-900">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Informations du client
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Nom complet
                      </p>
                      <p className="font-medium text-sm sm:text-base text-slate-900">
                        {selectedReservation.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">Email</p>
                      <p className="font-medium text-sm sm:text-base text-slate-900">
                        {selectedReservation.clientEmail}
                      </p>
                    </div>
                  </div>
                  {selectedReservation.clientPhone && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Téléphone
                        </p>
                        <p className="font-medium text-sm sm:text-base text-slate-900">
                          {selectedReservation.clientPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de la consultation */}
              <div className="admin-reservations-info-section bg-blue-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-blue-900">
                  <Calendar className="w-5 h-5" />
                  Détails de la consultation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    {getReservationTypeIcon(
                      selectedReservation.reservationType
                    )}
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Type de consultation
                      </p>
                      <p className="font-medium">
                        {getReservationTypeLabel(
                          selectedReservation.reservationType
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getCommunicationMethodIcon(
                      selectedReservation.communicationMethod
                    )}
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Mode de communication
                      </p>
                      <p className="font-medium">
                        {getCommunicationMethodLabel(
                          selectedReservation.communicationMethod
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Date
                      </p>
                      <p className="font-medium">
                        {formatDate(selectedReservation.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Horaire
                      </p>
                      <p className="font-medium">
                        {formatTime(selectedReservation.startTime)} -{" "}
                        {formatTime(selectedReservation.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut de la réservation */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Statut actuel
                  </p>
                  <span
                    className={getStatusBadgeClasses(
                      selectedReservation.status
                    )}
                  >
                    {getStatusLabel(selectedReservation.status)}
                  </span>
                </div>
                <div className="ml-auto">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Créé le
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedReservation.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description du projet */}
              <div className="admin-reservations-info-section">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-slate-900">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Description du projet
                </h3>
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {selectedReservation.projectDescription}
                  </p>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="admin-reservations-modal modal-footer border-t pt-3 sm:pt-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-slate-900">
                  Actions rapides
                </h3>

                {selectedReservation.status === "PENDING" && (
                  <div className="admin-actions-mobile flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={() => {
                        handleConfirmReservation(selectedReservation.id);
                        setIsDetailModalOpen(false);
                      }}
                      className="admin-button-success w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirmer la réservation
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleCancelReservation(selectedReservation.id);
                        setIsDetailModalOpen(false);
                      }}
                      className="admin-button-destructive w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Refuser la réservation
                    </Button>
                  </div>
                )}

                {/* Actions pour toutes les réservations (sauf annulées) */}
                {selectedReservation.status !== "CANCELLED" && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenReschedule(selectedReservation)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                      Déplacer le créneau
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenCancel(selectedReservation)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Annuler définitivement
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale de déplacement de réservation */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Déplacer la réservation
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Client :</strong> {selectedReservation.clientName}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Type :</strong>{" "}
                  {getReservationTypeLabel(selectedReservation.reservationType)}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reschedule-date">Nouvelle date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        date: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reschedule-start-time">
                      Heure de début
                    </Label>
                    <Input
                      id="reschedule-start-time"
                      type="time"
                      value={rescheduleForm.startTime}
                      onChange={(e) =>
                        setRescheduleForm({
                          ...rescheduleForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reschedule-end-time">Heure de fin</Label>
                    <Input
                      id="reschedule-end-time"
                      type="time"
                      value={rescheduleForm.endTime}
                      onChange={(e) =>
                        setRescheduleForm({
                          ...rescheduleForm,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reschedule-reason">
                    Raison du déplacement *
                  </Label>
                  <Textarea
                    id="reschedule-reason"
                    placeholder="Expliquez pourquoi le créneau doit être déplacé..."
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        reason: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRescheduleReservation}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Déplacement..." : "Déplacer la réservation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale d'annulation de réservation confirmée */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Annuler la réservation
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Client :</strong> {selectedReservation.clientName}
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Date :</strong>{" "}
                  {formatDate(selectedReservation.startTime)}
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Statut actuel :</strong>{" "}
                  {getStatusLabel(selectedReservation.status)}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Attention :</strong> Cette action annulera
                  définitivement la réservation et enverra un email d'annulation
                  au client.
                </p>
              </div>

              <div>
                <Label htmlFor="cancel-reason">Raison de l'annulation *</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Expliquez la raison de l'annulation (visible par le client)..."
                  value={cancelForm.reason}
                  onChange={(e) =>
                    setCancelForm({ ...cancelForm, reason: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="destructive"
                  onClick={handleCancelConfirmedReservation}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Annulation..." : "Confirmer l'annulation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Retour
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant principal qui utilise Suspense
export default function AdminReservationsPage() {
  return (
    <ProtectedAdminPage page="reservations">
      <AdminErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Chargement...
              </p>
            </div>
          </div>
        }
      >
        <ReservationsContent />
      </Suspense>
    </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
