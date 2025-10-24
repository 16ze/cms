"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  UserX,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";

interface StatsData {
  totals: {
    appointments: number;
    clients: number;
    estheticians: number;
    products: number;
  };
  period: {
    appointments: number;
    revenue: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    completionRate: number;
    cancellationRate: number;
    avgAppointmentsPerDay: number;
  };
  topTreatments: Array<{
    treatmentId: string;
    treatmentName: string;
    count: number;
  }>;
  appointmentsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  appointmentsByEsthetician: Array<{
    estheticianId: string;
    estheticianName: string;
    count: number;
  }>;
  stockAlerts: Array<{
    id: string;
    name: string;
    quantity: number;
    minQuantity: number;
    status: string;
  }>;
  meta: {
    period: string;
    dateFrom: string;
    dateTo: string;
    generatedAt: string;
  };
}

const PERIOD_OPTIONS = [
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "year", label: "Cette année" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
};

export default function StatsBeautePage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod, customDateRange, useCustomRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        params.append("startDate", customDateRange.startDate);
        params.append("endDate", customDateRange.endDate);
      } else {
        params.append("period", selectedPeriod);
      }

      const response = await fetch(`/api/admin/stats-beaute?${params}`);
      const data = await response.json();

      if (data.success) {
        setStatsData(data.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune donnée disponible
        </h3>
        <p className="text-gray-600">
          Les statistiques seront disponibles une fois que vous aurez des
          données.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-pink-500" />
            Rapports & Statistiques
          </h1>
          <p className="text-gray-600">
            Analysez les performances de votre salon
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres de période */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Période:</span>
          </div>

          <div className="flex gap-3">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedPeriod(option.value);
                  setUseCustomRange(false);
                }}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedPeriod === option.value && !useCustomRange
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}

            <button
              onClick={() => setUseCustomRange(!useCustomRange)}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                useCustomRange
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Période personnalisée
            </button>
          </div>

          {useCustomRange && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-gray-500">à</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Période analysée: {formatDate(statsData.meta.dateFrom)} -{" "}
          {formatDate(statsData.meta.dateTo)}
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Rendez-vous
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.totals.appointments}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.totals.clients}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Esthéticiennes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.totals.estheticians}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.totals.products}
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Statistiques de la période */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.period.appointments}
              </p>
              <p className="text-xs text-gray-500">
                Moy: {statsData.period.avgAppointmentsPerDay}/jour
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Chiffre d'affaires
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statsData.period.revenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Taux de réussite
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.period.completionRate}%
              </p>
              <p className="text-xs text-gray-500">
                {statsData.period.completedAppointments} terminés
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Taux d'annulation
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.period.cancellationRate}%
              </p>
              <p className="text-xs text-gray-500">
                {statsData.period.cancelledAppointments +
                  statsData.period.noShowAppointments}{" "}
                annulés
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top des soins */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-500" />
            Top des Soins
          </h3>
          <div className="space-y-3">
            {statsData.topTreatments.map((treatment, index) => (
              <div
                key={treatment.treatmentId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm font-semibold text-pink-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {treatment.treatmentName}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {treatment.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink-500" />
            Répartition par Statut
          </h3>
          <div className="space-y-3">
            {statsData.appointmentsByStatus.map((status) => (
              <div
                key={status.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      status.status
                    )}`}
                  >
                    {getStatusLabel(status.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {status.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {status.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance par esthéticienne */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-pink-500" />
          Performance par Esthéticienne
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.appointmentsByEsthetician.map((esthetician) => (
            <div
              key={esthetician.estheticianId}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {esthetician.estheticianName}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {esthetician.count}
              </div>
              <div className="text-xs text-gray-500">rendez-vous</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes de stock */}
      {statsData.stockAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertes de Stock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsData.stockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {alert.name}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      alert.status === "OUT"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.status === "OUT" ? "Rupture" : "Stock bas"}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Stock: {alert.quantity} (min: {alert.minQuantity})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
