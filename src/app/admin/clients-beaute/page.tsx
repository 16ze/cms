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
  MapPin,
  Calendar,
  Search,
} from "lucide-react";

interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  allergies: string[];
  preferences: string[];
  notes?: string;
  isActive: boolean;
}

const ALLERGY_OPTIONS = [
  "Parfum",
  "Latex",
  "Huiles essentielles",
  "Produits chimiques",
  "Nickel",
  "Laine",
  "Aucune allergie",
];

const PREFERENCE_OPTIONS = [
  "Soins visage",
  "Massage",
  "Manucure",
  "Pédicure",
  "Épilation",
  "Maquillage",
  "Soins corps",
];

export default function ClientsBeautePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [formData, setFormData] = useState<Client>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    postalCode: "",
    allergies: [],
    preferences: [],
    notes: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterActive !== "all") params.append("isActive", filterActive);

      const response = await fetch(`/api/admin/clients-beaute?${params}`);
      const data = await response.json();
      if (data.success) {
        // Parser les allergies et préférences JSON
        const parsedData = data.data.map((client: any) => ({
          ...client,
          allergies: client.allergies ? JSON.parse(client.allergies) : [],
          preferences: client.preferences ? JSON.parse(client.preferences) : [],
        }));
        setClients(parsedData);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingClient
        ? `/api/admin/clients-beaute/${editingClient.id}`
        : "/api/admin/clients-beaute";

      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setEditingClient(null);
        resetForm();
        fetchClients();
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

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || "",
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split("T")[0] : "",
      address: client.address || "",
      city: client.city || "",
      postalCode: client.postalCode || "",
      allergies: client.allergies ? JSON.parse(client.allergies) : [],
      preferences: client.preferences ? JSON.parse(client.preferences) : [],
      notes: client.notes || "",
      isActive: client.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ?")) return;

    try {
      const response = await fetch(`/api/admin/clients-beaute/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchClients();
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
      dateOfBirth: "",
      address: "",
      city: "",
      postalCode: "",
      allergies: [],
      preferences: [],
      notes: "",
      isActive: true,
    });
  };

  const handleAllergyToggle = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((p) => p !== preference)
        : [...prev.preferences, preference],
    }));
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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
            <User className="h-6 w-6 text-pink-500" />
            Gestion des Clients
          </h1>
          <p className="text-gray-600">Gérez votre base de données clients</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingClient(null);
            setShowModal(true);
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Client
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Tous les clients</option>
              <option value="true">Clients actifs</option>
              <option value="false">Clients inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {client.firstName} {client.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  {client.dateOfBirth && (
                    <p className="text-xs text-gray-500">
                      {calculateAge(client.dateOfBirth)} ans
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {client.phone && (
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{client.phone}</span>
              </div>
            )}

            {(client.address || client.city) && (
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {client.address && client.city
                    ? `${client.address}, ${client.city}`
                    : client.address || client.city}
                </span>
              </div>
            )}

            {client.allergies && client.allergies.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Allergies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(client.allergies).map((allergy: string) => (
                    <span
                      key={allergy}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {client.preferences && client.preferences.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Préférences:
                </p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(client.preferences).map((preference: string) => (
                    <span
                      key={preference}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {preference}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  client.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {client.isActive ? "Actif" : "Inactif"}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {client.appointments?.length || 0} RDV
              </span>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun client
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter votre premier client
          </p>
          <button
            onClick={() => {
              resetForm();
              setEditingClient(null);
              setShowModal(true);
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un Client
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingClient ? "Modifier le client" : "Nouveau Client"}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <label key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => handleAllergyToggle(allergy)}
                        className="mr-2"
                      />
                      <span className="text-sm">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préférences
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PREFERENCE_OPTIONS.map((preference) => (
                    <label key={preference} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.includes(preference)}
                        onChange={() => handlePreferenceToggle(preference)}
                        className="mr-2"
                      />
                      <span className="text-sm">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
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
                  Client actif
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
