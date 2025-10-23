"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Award } from "lucide-react";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await fetch("/api/admin/coaches");
      const data = await response.json();
      if (data.success) setCoaches(data.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce coach ?")) return;
    try {
      await fetch(`/api/admin/coaches/${id}`, { method: "DELETE" });
      fetchCoaches();
    } catch (error) {
      console.error("Erreur:", error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coaches</h1>
          <p className="text-gray-600">
            Gérez votre équipe de coaches bien-être
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Nouveau coach
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              {coach.photoUrl ? (
                <img
                  src={coach.photoUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
                  {coach.firstName[0]}
                  {coach.lastName[0]}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {coach.firstName} {coach.lastName}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {coach.specialty}
                </p>
              </div>
            </div>

            {coach.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {coach.bio}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  coach.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {coach.isActive ? "Actif" : "Inactif"}
              </span>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(coach.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coaches.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun coach</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Ajouter le premier coach
          </button>
        </div>
      )}
    </div>
  );
}
