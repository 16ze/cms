"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Sparkles, Clock } from "lucide-react";

interface Treatment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  duration: number;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: Date;
}

export default function SoinsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [formData, setFormData] = useState<Partial<Treatment>>({
    name: "",
    description: "",
    category: "",
    duration: 60,
    price: 0,
    imageUrl: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/soins");
      const data = await res.json();
      if (data.success) setTreatments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTreatment ? `/api/admin/soins/${editingTreatment.id}` : "/api/admin/soins";
      const method = editingTreatment ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTreatments();
        setIsModalOpen(false);
        setEditingTreatment(null);
        setFormData({
          name: "",
          description: "",
          category: "",
          duration: 60,
          price: 0,
          imageUrl: "",
          isAvailable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormData(treatment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce soin ?")) return;
    try {
      const res = await fetch(`/api/admin/soins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchTreatments();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Soins & Traitements</h1>
          <p className="text-gray-600 mt-2">Gérez votre carte de soins beauté</p>
        </div>
        <button
          onClick={() => {
            setEditingTreatment(null);
            setFormData({
              name: "",
              description: "",
              category: "",
              duration: 60,
              price: 0,
              imageUrl: "",
              isAvailable: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter un soin
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un soin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-pink-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTreatments.map((treatment) => (
            <div key={treatment.id} className="bg-white border rounded-lg p-5 hover:shadow-lg transition">
              {treatment.imageUrl && (
                <img src={treatment.imageUrl} alt={treatment.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    {treatment.name}
                  </h3>
                  <p className="text-sm text-gray-500">{treatment.category}</p>
                </div>
                <span className="text-lg font-bold text-pink-600">{treatment.price}€</span>
              </div>
              {treatment.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{treatment.description}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                {treatment.duration} minutes
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className={`px-2 py-1 text-xs rounded-full ${treatment.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {treatment.isAvailable ? "Disponible" : "Indisponible"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(treatment)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(treatment.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{editingTreatment ? "Modifier le soin" : "Nouveau soin"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Visage, Corps, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prix (€) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Durée (minutes) *</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image (URL)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isAvailable" className="text-sm">Soin disponible</label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTreatment(null);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                  {editingTreatment ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

