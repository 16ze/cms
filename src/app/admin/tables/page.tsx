"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Utensils } from "lucide-react";

interface Table {
  id: string;
  number: string;
  capacity: number;
  location: "TERRACE" | "INDOOR" | "BAR" | "PRIVATE_ROOM";
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationLabels = {
  TERRACE: "Terrasse",
  INDOOR: "Intérieur",
  BAR: "Bar",
  PRIVATE_ROOM: "Salon privé",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<Partial<Table>>({
    number: "",
    capacity: 2,
    location: "INDOOR",
    isAvailable: true,
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tables");
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTable
        ? `/api/admin/tables/${editingTable.id}`
        : "/api/admin/tables";
      const method = editingTable ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTables();
        setIsModalOpen(false);
        setEditingTable(null);
        setFormData({
          number: "",
          capacity: 2,
          location: "INDOOR",
          isAvailable: true,
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData(table);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette table ?")) return;
    try {
      const res = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchTables();
      else alert(data.error);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredTables = tables.filter((t) =>
    t.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tables Restaurant</h1>
          <p className="text-gray-600 mt-2">
            Gérez les tables et leur disponibilité
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTable(null);
            setFormData({
              number: "",
              capacity: 2,
              location: "INDOOR",
              isAvailable: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter une table
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-white border rounded-lg p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Utensils className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-bold text-lg">Table {table.number}</h3>
                    <p className="text-sm text-gray-500">
                      {table.capacity} personnes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Emplacement:</span>
                  <span className="font-medium">
                    {locationLabels[table.location]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      table.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {table.isAvailable ? "Disponible" : "Occupée"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(table)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingTable ? "Modifier la table" : "Nouvelle table"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Numéro de table *
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacité *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Emplacement *
                </label>
                <select
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INDOOR">Intérieur</option>
                  <option value="TERRACE">Terrasse</option>
                  <option value="BAR">Bar</option>
                  <option value="PRIVATE_ROOM">Salon privé</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium">
                  Table disponible
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTable(null);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTable ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
