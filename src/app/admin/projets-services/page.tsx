"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Briefcase, TrendingUp, Clock, DollarSign } from "lucide-react";

interface ServiceProject {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  status: "PENDING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
  createdAt: Date;
  client?: { firstName: string; lastName: string; company?: string };
}

const statusLabels = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  ON_HOLD: "En pause",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ProjetsServicesPage() {
  const [projects, setProjects] = useState<ServiceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projets-services");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/projets-services/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) await fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      const res = await fetch(`/api/admin/projets-services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === "PENDING").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    totalBudget: projects
      .filter((p) => p.budget)
      .reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projets Services Pro</h1>
          <p className="text-gray-600 mt-2">Gérez vos projets clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <Clock className="w-8 h-8 text-yellow-600 mb-2" />
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">En cours</p>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <Briefcase className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <DollarSign className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Budget total</p>
          <p className="text-2xl font-bold">{stats.totalBudget.toFixed(0)}€</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par projet, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Tous les statuts</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun projet trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white border rounded-lg p-5 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <Briefcase className="w-10 h-10 text-indigo-600" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      Client: {project.client?.firstName} {project.client?.lastName}
                      {project.client?.company && ` - ${project.client.company}`}
                    </p>
                    {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {project.startDate && (
                        <span>
                          Début: {new Date(project.startDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {project.endDate && (
                        <span>
                          Fin: {new Date(project.endDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {project.budget && <span>Budget: {project.budget}€</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    className={`px-3 py-1 text-sm rounded-full border-0 ${statusColors[project.status]}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t">
                <button
                  onClick={() => handleDelete(project.id)}
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

