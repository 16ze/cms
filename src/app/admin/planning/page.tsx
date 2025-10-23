"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Filter } from "lucide-react";

export default function PlanningPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("DAY");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      // Essayer de récupérer depuis différentes sources
      const sources = [
        "/api/admin/consultations",
        "/api/admin/reservations",
        "/api/admin/cours",
      ];

      let allAppointments: any[] = [];

      for (const source of sources) {
        try {
          const response = await fetch(source);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            allAppointments = [...allAppointments, ...data.data];
          }
        } catch (err) {
          console.warn(`Source ${source} not available`);
        }
      }

      setAppointments(allAppointments);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Grouper par heure
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8h - 20h

  const getAppointmentsForTimeSlot = (hour: number) => {
    return appointments.filter((appt) => {
      const apptHour = parseInt(appt.time?.split(":")[0] || "0");
      return apptHour === hour;
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planning</h1>
          <p className="text-gray-600">
            Gérez votre planning et vos réservations
          </p>
        </div>
        <div className="flex gap-2">
          {["DAY", "WEEK", "MONTH"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === v
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {v === "DAY" ? "Jour" : v === "WEEK" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* Date selector */}
      <div className="mb-6 flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Aujourd'hui
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Rendez-vous aujourd'hui</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {appointments.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Confirmés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {
              appointments.filter((a) =>
                ["CONFIRMED", "COMPLETED"].includes(a.status)
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {
              appointments.filter((a) =>
                ["PENDING", "SCHEDULED"].includes(a.status)
              ).length
            }
          </p>
        </div>
      </div>

      {/* Planning horaire */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {timeSlots.map((hour) => {
            const slotAppointments = getAppointmentsForTimeSlot(hour);
            return (
              <div
                key={hour}
                className="flex hover:bg-gray-50 transition-colors"
              >
                <div className="w-24 p-4 border-r border-gray-200 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {hour}:00
                  </div>
                  <div className="text-xs text-gray-500">{hour + 1}:00</div>
                </div>
                <div className="flex-1 p-4">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {slotAppointments.map((appt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {appt.time}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ["CONFIRMED", "COMPLETED"].includes(appt.status)
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {appt.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4" />
                            <span>
                              {appt.customerName ||
                                appt.patient?.firstName +
                                  " " +
                                  appt.patient?.lastName ||
                                "Client"}
                            </span>
                          </div>
                          {appt.duration && (
                            <div className="text-xs text-gray-500 mt-1">
                              Durée: {appt.duration} min
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-2">
                      Disponible
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {appointments.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mt-6">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun rendez-vous pour cette date</p>
        </div>
      )}
    </div>
  );
}
