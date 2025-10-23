"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User, X, Check, Sparkles } from "lucide-react";

export default function RendezVousBeautePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, treatmentsRes] = await Promise.all([
        fetch("/api/admin/rendez-vous-beaute"),
        fetch("/api/admin/soins"),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const treatmentsData = await treatmentsRes.json();

      if (appointmentsData.success) setAppointments(appointmentsData.data);
      if (treatmentsData.success) setTreatments(treatmentsData.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/rendez-vous-beaute/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await fetch(`/api/admin/rendez-vous-beaute/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const statusConfig = {
    PENDING: {
      label: "En attente",
      color: "yellow",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    CONFIRMED: {
      label: "Confirmé",
      color: "green",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    IN_PROGRESS: {
      label: "En cours",
      color: "blue",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    COMPLETED: {
      label: "Terminé",
      color: "gray",
      bg: "bg-gray-100",
      text: "text-gray-700",
    },
    CANCELLED: {
      label: "Annulé",
      color: "red",
      bg: "bg-red-100",
      text: "text-red-700",
    },
    NO_SHOW: {
      label: "Absent",
      color: "orange",
      bg: "bg-orange-100",
      text: "text-orange-700",
    },
  };

  const filteredAppointments =
    filter === "ALL"
      ? appointments
      : appointments.filter((appt) => appt.status === filter);

  // Statistiques
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-pink-600" />
            Rendez-vous Beauté
          </h1>
          <p className="text-gray-600">Gérez les rendez-vous de vos clients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">En attente</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Confirmés</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.confirmed}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Terminés</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          "ALL",
          "PENDING",
          "CONFIRMED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {status === "ALL"
              ? "Tous"
              : statusConfig[status as keyof typeof statusConfig].label}
          </button>
        ))}
      </div>

      {/* Liste des rendez-vous */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map((appointment) => {
          const status =
            statusConfig[appointment.status as keyof typeof statusConfig];
          return (
            <div
              key={appointment.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                      <Sparkles className="w-4 h-4" />
                      {appointment.treatment?.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Client</span>
                      </div>
                      <p className="text-sm text-gray-900 ml-6">
                        {appointment.customerName}
                      </p>
                      <p className="text-xs text-gray-500 ml-6">
                        {appointment.customerEmail}
                      </p>
                      <p className="text-xs text-gray-500 ml-6">
                        {appointment.customerPhone}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Date</span>
                      </div>
                      <p className="text-sm text-gray-900 ml-6">
                        {new Date(appointment.date).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Heure & Durée</span>
                      </div>
                      <p className="text-sm text-gray-900 ml-6">
                        {appointment.time}
                      </p>
                      {appointment.treatment?.duration && (
                        <p className="text-xs text-gray-500 ml-6">
                          {appointment.treatment.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-100">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div className="mt-4 flex gap-2">
                    {appointment.status === "PENDING" && (
                      <button
                        onClick={() =>
                          updateStatus(appointment.id, "CONFIRMED")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Confirmer
                      </button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <button
                        onClick={() =>
                          updateStatus(appointment.id, "IN_PROGRESS")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        En cours
                      </button>
                    )}
                    {appointment.status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          updateStatus(appointment.id, "COMPLETED")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Terminer
                      </button>
                    )}
                    {!["CANCELLED", "COMPLETED"].includes(
                      appointment.status
                    ) && (
                      <button
                        onClick={() =>
                          updateStatus(appointment.id, "CANCELLED")
                        }
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(appointment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAppointments.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun rendez-vous</p>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
            Créer un rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}
