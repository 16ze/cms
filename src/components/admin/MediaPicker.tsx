"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Upload, Search } from "lucide-react";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  currentValue?: string;
}

export default function MediaPicker({
  onSelect,
  onClose,
  currentValue,
}: MediaPickerProps) {
  const [search, setSearch] = useState("");
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/contenu/medias");
      const result = await response.json();

      if (result.success) {
        setMedia(result.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement médias:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Sélectionner une Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Aucun média trouvé. Ajoutez-en depuis la gestion de contenu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url || item.path);
                    onClose();
                  }}
                  className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    currentValue === item.url
                      ? "border-pink-600 ring-2 ring-pink-200"
                      : "border-gray-200 hover:border-pink-400"
                  }`}
                >
                  <img
                    src={item.url || item.path}
                    alt={item.title || "Image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
