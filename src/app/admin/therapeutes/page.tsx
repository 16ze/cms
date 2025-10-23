"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Stethoscope } from "lucide-react";

export default function TherapeutesPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await fetch("/api/admin/therapeutes");
      const data = await response.json();
      if (data.success) setTherapists(data.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce thérapeute ?")) return;
    try {
      await fetch(`/api/admin/therapeutes/${id}`, { method: "DELETE" });
      fetchTherapists();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thérapeutes</h1>
          <p className="text-gray-600">
            Gérez votre équipe de professionnels de santé
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Nouveau thérapeute
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              {therapist.photoUrl ? (
                <img
                  src={therapist.photoUrl}
                  alt={`${therapist.firstName} ${therapist.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {therapist.firstName} {therapist.lastName}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {therapist.specialty}
                </p>
              </div>
            </div>

            {therapist.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {therapist.bio}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  therapist.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {therapist.isActive ? "Actif" : "Inactif"}
              </span>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(therapist.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {therapists.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun thérapeute</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Ajouter le premier thérapeute
          </button>
        </div>
      )}
    </div>
  );
}
