"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User, X } from "lucide-react";

export default function RendezVousPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/admin/consultations");
      const data = await response.json();
      if (data.success) setAppointments(data.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    SCHEDULED: { label: "Planifié", color: "blue" },
    CONFIRMED: { label: "Confirmé", color: "green" },
    IN_PROGRESS: { label: "En cours", color: "yellow" },
    COMPLETED: { label: "Terminé", color: "gray" },
    CANCELLED: { label: "Annulé", color: "red" },
    NO_SHOW: { label: "Absent", color: "orange" },
    RESCHEDULED: { label: "Reporté", color: "purple" },
  };

  const filteredAppointments =
    filter === "ALL"
      ? appointments
      : appointments.filter((appt) => appt.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rendez-vous</h1>
          <p className="text-gray-600">
            Gérez les consultations de vos patients
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {["ALL", "SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status === "ALL"
                ? "Tous"
                : statusConfig[status as keyof typeof statusConfig].label}
            </button>
          )
        )}
      </div>

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
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full bg-${status.color}-100 text-${status.color}-700`}
                    >
                      {status.label}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {appointment.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Patient</span>
                      </div>
                      <p className="text-sm text-gray-900 ml-6">
                        {appointment.patient?.firstName}{" "}
                        {appointment.patient?.lastName}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Thérapeute</span>
                      </div>
                      <p className="text-sm text-gray-900 ml-6">
                        {appointment.therapist?.firstName}{" "}
                        {appointment.therapist?.lastName}
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
                        {appointment.time} • {appointment.duration} min
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>

                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Créer un rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}
