"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";

interface Esthetician {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties: string[];
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
}

const SPECIALTY_OPTIONS = [
  "Visage",
  "Mains",
  "Pieds",
  "Massage",
  "Épilation",
  "Maquillage",
  "Ongles",
  "Soins corps",
];

export default function EstheticiennesPage() {
  const [estheticians, setEstheticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEsthetician, setEditingEsthetician] =
    useState<Esthetician | null>(null);
  const [formData, setFormData] = useState<Esthetician>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialties: [],
    bio: "",
    avatarUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEstheticians();
  }, []);

  const fetchEstheticians = async () => {
    try {
      const response = await fetch("/api/admin/estheticiennes");
      const data = await response.json();
      if (data.success) {
        // Parser les spécialités JSON
        const parsedData = data.data.map((esthetician: any) => ({
          ...esthetician,
          specialties: esthetician.specialties
            ? JSON.parse(esthetician.specialties)
            : [],
        }));
        setEstheticians(parsedData);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingEsthetician
        ? `/api/admin/estheticiennes/${editingEsthetician.id}`
        : "/api/admin/estheticiennes";

      const method = editingEsthetician ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setEditingEsthetician(null);
        resetForm();
        fetchEstheticians();
      } else {
        alert(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (esthetician: any) => {
    setEditingEsthetician(esthetician);
    setFormData({
      firstName: esthetician.firstName,
      lastName: esthetician.lastName,
      email: esthetician.email,
      phone: esthetician.phone || "",
      specialties: esthetician.specialties
        ? JSON.parse(esthetician.specialties)
        : [],
      bio: esthetician.bio || "",
      avatarUrl: esthetician.avatarUrl || "",
      isActive: esthetician.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette esthéticienne ?")) return;

    try {
      const response = await fetch(`/api/admin/estheticiennes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchEstheticians();
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialties: [],
      bio: "",
      avatarUrl: "",
      isActive: true,
    });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-500" />
            Gestion des Esthéticiennes
          </h1>
          <p className="text-gray-600">Gérez votre équipe d'esthéticiennes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEsthetician(null);
            setShowModal(true);
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Esthéticienne
        </button>
      </div>

      {/* Liste des esthéticiennes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estheticians.map((esthetician) => (
          <div
            key={esthetician.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {esthetician.firstName} {esthetician.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{esthetician.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(esthetician)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(esthetician.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {esthetician.phone && (
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {esthetician.phone}
                </span>
              </div>
            )}

            {esthetician.specialties && esthetician.specialties.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Spécialités:
                </p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(esthetician.specialties).map(
                    (specialty: string) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {esthetician.bio && (
              <p className="text-sm text-gray-600 mb-3">{esthetician.bio}</p>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  esthetician.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {esthetician.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-sm text-gray-500">
                {esthetician.appointments?.length || 0} RDV
              </span>
            </div>
          </div>
        ))}
      </div>

      {estheticians.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune esthéticienne
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter votre première esthéticienne
          </p>
          <button
            onClick={() => {
              resetForm();
              setEditingEsthetician(null);
              setShowModal(true);
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter une Esthéticienne
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingEsthetician
                  ? "Modifier l'esthéticienne"
                  : "Nouvelle Esthéticienne"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="mr-2"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Esthéticienne active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
