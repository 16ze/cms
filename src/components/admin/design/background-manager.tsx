"use client";

import { useState, useEffect } from "react";
import { Image, Palette, BarChart3, Video, Eye, Settings, Layers } from "lucide-react";

interface BackgroundManagerProps {
  onChanges: () => void;
}

interface BackgroundConfig {
  type: 'image' | 'color' | 'gradient' | 'video';
  value: string;
  position?: string;
  size?: string;
  overlay: {
    color: string;
    opacity: number;
  };
}

const backgroundTypes = [
  { id: 'image', label: 'Image', icon: Image },
  { id: 'color', label: 'Couleur', icon: Palette },
  { id: 'gradient', label: 'Dégradé', icon: Layers },
  { id: 'video', label: 'Vidéo', icon: Video }
];

const positionOptions = [
  { value: 'center', label: 'Centre' },
  { value: 'top', label: 'Haut' },
  { value: 'bottom', label: 'Bas' },
  { value: 'left', label: 'Gauche' },
  { value: 'right', label: 'Droite' },
  { value: 'top-left', label: 'Haut-Gauche' },
  { value: 'top-right', label: 'Haut-Droite' },
  { value: 'bottom-left', label: 'Bas-Gauche' },
  { value: 'bottom-right', label: 'Bas-Droite' }
];

const sizeOptions = [
  { value: 'cover', label: 'Couverture' },
  { value: 'contain', label: 'Contenu' },
  { value: 'auto', label: 'Auto' },
  { value: '100%', label: '100%' }
];

export default function BackgroundManager({ onChanges }: BackgroundManagerProps) {
  const [background, setBackground] = useState<BackgroundConfig>({
    type: 'image',
    value: '',
    position: 'center',
    size: 'cover',
    overlay: {
      color: '#000000',
      opacity: 0.4
    }
  });

  const handleTypeChange = (type: BackgroundConfig['type']) => {
    setBackground(prev => ({ ...prev, type }));
    onChanges();
  };

  const handleValueChange = (value: string) => {
    setBackground(prev => ({ ...prev, value }));
    onChanges();
  };

  const handlePositionChange = (position: string) => {
    setBackground(prev => ({ ...prev, position }));
    onChanges();
  };

  const handleSizeChange = (size: string) => {
    setBackground(prev => ({ ...prev, size }));
    onChanges();
  };

  const handleOverlayChange = (property: 'color' | 'opacity', value: string | number) => {
    setBackground(prev => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        [property]: value
      }
    }));
    onChanges();
  };

  const renderBackgroundInput = () => {
    switch (background.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="text"
                value={background.value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={background.position}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <select
                  value={background.size}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'color':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de l'arrière-plan
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background.value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={background.value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        );

      case 'gradient':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dégradé CSS
            </label>
            <input
              type="text"
              value={background.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Utilisez la syntaxe CSS standard pour les dégradés
            </p>
          </div>
        );

      case 'video':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la vidéo
            </label>
            <input
              type="text"
              value={background.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formats supportés : MP4, WebM
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Gestionnaire d'Arrière-plans
        </h3>
        <p className="text-gray-600 mt-1">
          Configurez les arrière-plans de vos sections
        </p>
      </div>

      {/* Sélection du type */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Type d'arrière-plan
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {backgroundTypes.map((type) => {
            const Icon = type.icon;
            const isActive = background.type === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id as BackgroundConfig['type'])}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration spécifique au type */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Configuration
        </h4>
        {renderBackgroundInput()}
      </div>

      {/* Overlay */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Overlay
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de l'overlay
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background.overlay.color}
                onChange={(e) => handleOverlayChange('color', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={background.overlay.color}
                onChange={(e) => handleOverlayChange('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacité
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={background.overlay.opacity * 100}
                onChange={(e) => handleOverlayChange('opacity', parseInt(e.target.value) / 100)}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {Math.round(background.overlay.opacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Prévisualisation
        </h4>
        <div 
          className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden"
          style={{
            background: background.type === 'image' && background.value 
              ? `url(${background.value}) ${background.position} / ${background.size}`
              : background.type === 'color' && background.value
              ? background.value
              : background.type === 'gradient' && background.value
              ? background.value
              : '#f3f4f6'
          }}
        >
          {background.overlay.opacity > 0 && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: background.overlay.color,
                opacity: background.overlay.opacity
              }}
            />
          )}
          
          {background.type === 'video' && background.value && (
            <video
              src={background.value}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          )}
          
          {!background.value && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Eye className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
