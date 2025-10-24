"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

interface Esthetician {
  id: string;
  firstName: string;
  lastName: string;
  schedules: Schedule[];
  appointments: Appointment[];
}

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  time: string;
  status: string;
  treatment: {
    name: string;
    duration: number;
  };
  client: {
    firstName: string;
    lastName: string;
  } | null;
}

interface PlanningData {
  date: string;
  schedules: any[];
  appointments: any[];
  availableSlots: any[];
}

const DAYS_OF_WEEK = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

export default function PlanningBeautePage() {
  const [estheticians, setEstheticians] = useState<Esthetician[]>([]);
  const [planningData, setPlanningData] = useState<PlanningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEsthetician, setSelectedEsthetician] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchPlanningData();
  }, [selectedDate, selectedEsthetician]);

  const fetchPlanningData = async () => {
    try {
      setLoading(true);

      // Récupérer les données générales
      const generalResponse = await fetch("/api/admin/planning-beaute");
      const generalData = await generalResponse.json();

      if (generalData.success) {
        setEstheticians(generalData.data);
      }

      // Récupérer les données pour la date sélectionnée
      const dateStr = selectedDate.toISOString().split("T")[0];
      const params = new URLSearchParams({ date: dateStr });
      if (selectedEsthetician !== "all") {
        params.append("estheticianId", selectedEsthetician);
      }

      const planningResponse = await fetch(
        `/api/admin/planning-beaute?${params}`
      );
      const planningResult = await planningResponse.json();

      if (planningResult.success) {
        setPlanningData(planningResult.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "CONFIRMED":
        return "Confirmé";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminé";
      case "CANCELLED":
        return "Annulé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-pink-500" />
            Planning Beauté
          </h1>
          <p className="text-gray-600">Gérez les rendez-vous et horaires</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() =>
              setViewMode(viewMode === "calendar" ? "list" : "calendar")
            }
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {viewMode === "calendar" ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Contrôles de navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Navigation de date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
            </div>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <select
              value={selectedEsthetician}
              onChange={(e) => setSelectedEsthetician(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Toutes les esthéticiennes</option>
              {estheticians.map((esthetician) => (
                <option key={esthetician.id} value={esthetician.id}>
                  {esthetician.firstName} {esthetician.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vue Calendrier */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Créneaux horaires - {formatDate(selectedDate)}
            </h3>
          </div>

          <div className="p-4">
            {planningData?.availableSlots &&
            planningData.availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planningData.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      slot.isAvailable
                        ? "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"
                        : "bg-red-50 border-red-200"
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {slot.time} - {slot.endTime}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          slot.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slot.isAvailable ? "Libre" : "Occupé"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {slot.estheticianName}
                      </span>
                    </div>

                    {!slot.isAvailable && slot.appointment && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.appointment.customerName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {slot.appointment.treatment?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.appointment.client?.firstName}{" "}
                          {slot.appointment.client?.lastName}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(
                            slot.appointment.status
                          )}`}
                        >
                          {getStatusText(slot.appointment.status)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun créneau disponible
                </h3>
                <p className="text-gray-600">
                  Aucune esthéticienne n'est disponible pour cette date
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {estheticians.map((esthetician) => (
            <div
              key={esthetician.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  {esthetician.firstName} {esthetician.lastName}
                </h3>
              </div>

              <div className="p-4">
                {/* Horaires de la semaine */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Horaires de travail
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day, index) => {
                      const schedule = esthetician.schedules.find(
                        (s) => s.dayOfWeek === index
                      );
                      return (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-gray-900">{day}</div>
                          <div className="text-gray-600">
                            {schedule
                              ? `${schedule.startTime} - ${schedule.endTime}`
                              : "Fermé"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rendez-vous */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Rendez-vous à venir
                  </h4>
                  {esthetician.appointments.length > 0 ? (
                    <div className="space-y-2">
                      {esthetician.appointments
                        .slice(0, 5)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {appointment.client?.firstName}{" "}
                                {appointment.client?.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.treatment.name} -{" "}
                                {appointment.time}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Aucun rendez-vous à venir
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Paramètres du planning</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée des créneaux
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heures d'ouverture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="time"
                    defaultValue="19:00"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
