"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Image, File, X, Search, Download, Trash2, Edit } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  altText?: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  isActive: boolean;
  createdAt: string;
}

interface MediaManagerProps {
  onSelect: (media: MediaFile) => void;
  onClose: () => void;
  multiple?: boolean;
  acceptedTypes?: string[];
}

export default function MediaManager({ onSelect, onClose, multiple = false, acceptedTypes = ['image/*'] }: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les médias depuis l'API
  useEffect(() => {
    fetchMedia();
  }, [searchTerm, filterType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/content/media?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.data.media);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (fileList: FileList) => {
    setUploading(true);
    
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('altText', file.name);

        const response = await fetch('/api/admin/content/media/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          // Recharger la liste des médias
          await fetchMedia();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.find(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      onSelect(file);
      onClose();
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) {
      try {
        const response = await fetch(`/api/admin/content/media?id=${fileId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchMedia();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <File className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.altText && file.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || 
                       (filterType === "images" && file.mimeType.startsWith('image/')) ||
                       (filterType === "videos" && file.mimeType.startsWith('video/')) ||
                       (filterType === "documents" && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'));
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestionnaire de Médias
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez vos images, vidéos et documents
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {multiple && selectedFiles.length > 0 && (
              <button
                onClick={() => {
                  selectedFiles.forEach(file => onSelect(file));
                  onClose();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sélectionner ({selectedFiles.length})
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Upload */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Upload...' : 'Upload'}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des médias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="images">Images</option>
              <option value="videos">Vidéos</option>
              <option value="documents">Documents</option>
            </select>
          </div>
        </div>

        {/* Zone de drop */}
        <div
          className={`p-6 border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Glissez-déposez vos fichiers ici ou{' '}
              <button
                onClick={handleUpload}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                cliquez pour parcourir
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, MP4, PDF jusqu'à 10MB
            </p>
          </div>
        </div>

        {/* Liste des fichiers */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.find(f => f.id === file.id);
                const isImage = file.mimeType.startsWith('image/');
                
                return (
                  <div
                    key={file.id}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {/* Prévisualisation */}
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      {isImage ? (
                        <img
                          src={file.filePath}
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.fileSize)}
                      </p>
                      {file.width && file.height && (
                        <p className="text-xs text-gray-500">
                          {file.width} × {file.height}
                        </p>
                      )}
                    </div>

                    {/* Actions au survol */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Éditer les métadonnées
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Télécharger
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Indicateur de sélection */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun média trouvé
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Aucun média ne correspond à votre recherche.' : 'Commencez par uploader vos premiers médias.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
