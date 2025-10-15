"use client";

import { useState, useEffect } from "react";
import { Eye, RefreshCw, Check } from "lucide-react";

interface ColorManagerProps {
  onChanges: () => void;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  gray: {
    light: string;
    medium: string;
    dark: string;
  };
  success: string;
  warning: string;
  error: string;
}

export default function ColorManager({ onChanges }: ColorManagerProps) {
  const [colors, setColors] = useState<ColorScheme>({
    primary: '#007AFF',
    secondary: '#34C759',
    accent: '#FF9500',
    text: '#1D1D1F',
    background: '#FFFFFF',
    gray: {
      light: '#F5F5F7',
      medium: '#86868B',
      dark: '#1D1D1F'
    },
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30'
  });

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorGroups = [
    {
      title: 'Couleurs principales',
      colors: [
        { key: 'primary', label: 'Primaire', description: 'Boutons, liens, éléments d\'action' },
        { key: 'secondary', label: 'Secondaire', description: 'Éléments secondaires, accents' },
        { key: 'accent', label: 'Accent', description: 'Points d\'attention, highlights' }
      ]
    },
    {
      title: 'Couleurs de texte',
      colors: [
        { key: 'text', label: 'Texte principal', description: 'Contenu principal, titres' },
        { key: 'gray.medium', label: 'Texte secondaire', description: 'Descriptions, métadonnées' }
      ]
    },
    {
      title: 'Couleurs de fond',
      colors: [
        { key: 'background', label: 'Arrière-plan', description: 'Fond principal du site' },
        { key: 'gray.light', label: 'Fond secondaire', description: 'Sections, cartes' }
      ]
    },
    {
      title: 'Couleurs d\'état',
      colors: [
        { key: 'success', label: 'Succès', description: 'Messages de confirmation' },
        { key: 'warning', label: 'Avertissement', description: 'Messages d\'attention' },
        { key: 'error', label: 'Erreur', description: 'Messages d\'erreur' }
      ]
    }
  ];

  const handleColorChange = (key: string, value: string) => {
    const newColors = { ...colors };
    
    if (key.includes('.')) {
      const [group, subKey] = key.split('.');
      newColors[group as keyof ColorScheme][subKey as keyof typeof newColors[typeof group]] = value;
    } else {
      newColors[key as keyof ColorScheme] = value;
    }
    
    setColors(newColors);
    onChanges();
  };

  const openColorPicker = (colorKey: string) => {
    setSelectedColor(colorKey);
    setShowColorPicker(true);
  };

  const handleColorPickerChange = (color: string) => {
    if (selectedColor) {
      handleColorChange(selectedColor, color);
    }
    setShowColorPicker(false);
    setSelectedColor(null);
  };

  const resetToDefault = () => {
    const defaultColors: ColorScheme = {
      primary: '#007AFF',
      secondary: '#34C759',
      accent: '#FF9500',
      text: '#1D1D1F',
      background: '#FFFFFF',
      gray: {
        light: '#F5F5F7',
        medium: '#86868B',
        dark: '#1D1D1F'
      },
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30'
    };
    
    setColors(defaultColors);
    onChanges();
  };

  const getColorValue = (key: string): string => {
    if (key.includes('.')) {
      const [group, subKey] = key.split('.');
      return colors[group as keyof ColorScheme][subKey as keyof typeof colors[typeof group]];
    }
    return colors[key as keyof ColorScheme];
  };

  const ColorInput = ({ colorKey, label, description }: { colorKey: string; label: string; description: string }) => {
    const colorValue = getColorValue(colorKey);
    
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
              style={{ backgroundColor: colorValue }}
              onClick={() => openColorPicker(colorKey)}
            />
            <div>
              <h4 className="font-medium text-gray-900">{label}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={colorValue}
            onChange={(e) => handleColorChange(colorKey, e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="#000000"
          />
          
          <button
            onClick={() => openColorPicker(colorKey)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ouvrir le color picker"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestionnaire de Couleurs
          </h3>
          <p className="text-gray-600 mt-1">
            Personnalisez la palette de couleurs de votre site
          </p>
        </div>
        
        <button
          onClick={resetToDefault}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      {/* Grille de couleurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {colorGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
              {group.title}
            </h4>
            
            <div className="space-y-3">
              {group.colors.map((color) => (
                <ColorInput
                  key={color.key}
                  colorKey={color.key}
                  label={color.label}
                  description={color.description}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prévisualisation des couleurs */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Prévisualisation de la palette
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(colors).map(([key, value]) => {
            if (typeof value === 'object') return null;
            
            return (
              <div key={key} className="text-center">
                <div
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-xs text-gray-500 font-mono">{value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choisir une couleur
            </h3>
            
            <div className="space-y-4">
              <input
                type="color"
                value={selectedColor ? getColorValue(selectedColor) : '#000000'}
                onChange={(e) => handleColorPickerChange(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
