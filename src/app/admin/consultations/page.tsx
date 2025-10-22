"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Calendar, Clock, User, Heart } from "lucide-react";

interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes: string | null;
  createdAt: Date;
  patient?: { firstName: string; lastName: string };
  therapist?: { firstName: string; lastName: string };
}

const statusLabels = {
  SCHEDULED: "Programmée",
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  NO_SHOW: "Absent",
};

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
};

export default function ConsultationsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/consultations");
      const data = await res.json();
      if (data.success) setAppointments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/consultations/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) await fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette consultation ?")) return;
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.therapist?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.therapist?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === "SCHEDULED").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Consultations Thérapie</h1>
          <p className="text-gray-600 mt-2">Gérez les rendez-vous de consultation</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <Calendar className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <Clock className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-sm text-gray-600">Programmées</p>
          <p className="text-2xl font-bold">{stats.scheduled}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <Heart className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Confirmées</p>
          <p className="text-2xl font-bold">{stats.confirmed}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <User className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-sm text-gray-600">Terminées</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par patient, thérapeute, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
        >
          <option value="ALL">Tous les statuts</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-teal-600"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucune consultation trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border rounded-lg p-5 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Heart className="w-10 h-10 text-teal-600" />
                  <div>
                    <h3 className="font-bold text-lg">{appointment.type}</h3>
                    <p className="text-sm text-gray-600">
                      Patient: {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Thérapeute: {appointment.therapist?.firstName} {appointment.therapist?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(appointment.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })} • {appointment.time} • {appointment.duration} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                    className={`px-3 py-1 text-sm rounded-full border-0 ${statusColors[appointment.status]}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {appointment.notes && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t">
                <button
                  onClick={() => handleDelete(appointment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

