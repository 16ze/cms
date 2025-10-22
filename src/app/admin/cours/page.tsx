"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Dumbbell, Users, Clock } from "lucide-react";

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  imageUrl: string | null;
  coachId: string;
  schedule: string | null;
  isActive: boolean;
  createdAt: Date;
  coach?: { firstName: string; lastName: string };
}

export default function CoursPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({
    name: "",
    description: "",
    category: "",
    duration: 60,
    capacity: 10,
    price: 0,
    imageUrl: "",
    schedule: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cours");
      const data = await res.json();
      if (data.success) setCourses(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/admin/cours/${editingCourse.id}` : "/api/admin/cours";
      const method = editingCourse ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCourses();
        setIsModalOpen(false);
        setEditingCourse(null);
        setFormData({
          name: "",
          description: "",
          category: "",
          duration: 60,
          capacity: 10,
          price: 0,
          imageUrl: "",
          schedule: "",
          isActive: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try {
      const res = await fetch(`/api/admin/cours/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) await fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cours & Activités</h1>
          <p className="text-gray-600 mt-2">Gérez vos cours de bien-être</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            setFormData({
              name: "",
              description: "",
              category: "",
              duration: 60,
              capacity: 10,
              price: 0,
              imageUrl: "",
              schedule: "",
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter un cours
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg p-5 hover:shadow-lg transition">
              {course.imageUrl && (
                <img src={course.imageUrl} alt={course.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>
                <span className="text-lg font-bold text-purple-600">{course.price}€</span>
              </div>
              {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.capacity} pers.
                </div>
              </div>
              {course.coach && (
                <p className="text-sm text-gray-500 mb-3">
                  Coach: {course.coach.firstName} {course.coach.lastName}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className={`px-2 py-1 text-xs rounded-full ${course.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {course.isActive ? "Actif" : "Inactif"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
              <h2 className="text-2xl font-bold">{editingCourse ? "Modifier le cours" : "Nouveau cours"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Yoga, Pilates, etc."
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Durée (minutes) *</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capacité *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image (URL)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm">Cours actif</label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {editingCourse ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

