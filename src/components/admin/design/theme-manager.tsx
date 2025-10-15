"use client";

import { useState } from "react";
import { Settings, Download, Upload, Eye, Check, Plus } from "lucide-react";

interface ThemeManagerProps {
  onChanges: () => void;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
    };
    typography: {
      primaryFont: string;
      secondaryFont: string;
    };
    spacing: {
      base: string;
      section: string;
    };
  };
  isDefault: boolean;
  isActive: boolean;
}

export default function ThemeManager({ onChanges }: ThemeManagerProps) {
  const [themes, setThemes] = useState<Theme[]>([
    {
      id: '1',
      name: 'Apple-like',
      description: 'Design épuré inspiré d\'Apple avec des couleurs neutres et une typographie élégante',
      config: {
        colors: {
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          text: '#1D1D1F',
          background: '#FFFFFF'
        },
        typography: {
          primaryFont: 'SF Pro Display',
          secondaryFont: 'SF Pro Text'
        },
        spacing: {
          base: '8px',
          section: '110px'
        }
      },
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      name: 'Material Design',
      description: 'Thème Google Material Design avec des couleurs vives et des ombres',
      config: {
        colors: {
          primary: '#2196F3',
          secondary: '#4CAF50',
          accent: '#FF9800',
          text: '#212121',
          background: '#FAFAFA'
        },
        typography: {
          primaryFont: 'Roboto',
          secondaryFont: 'Roboto'
        },
        spacing: {
          base: '8px',
          section: '80px'
        }
      },
      isDefault: false,
      isActive: false
    },
    {
      id: '3',
      name: 'Dark Mode',
      description: 'Thème sombre avec des couleurs contrastées pour une meilleure lisibilité',
      config: {
        colors: {
          primary: '#00D4FF',
          secondary: '#00FF88',
          accent: '#FF6B6B',
          text: '#FFFFFF',
          background: '#0A0A0A'
        },
        typography: {
          primaryFont: 'Inter',
          secondaryFont: 'Inter'
        },
        spacing: {
          base: '8px',
          section: '100px'
        }
      },
      isDefault: false,
      isActive: false
    }
  ]);

  const [selectedTheme, setSelectedTheme] = useState<string>('1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    description: '',
    config: {
      colors: {
        primary: '#007AFF',
        secondary: '#34C759',
        accent: '#FF9500',
        text: '#1D1D1F',
        background: '#FFFFFF'
      },
      typography: {
        primaryFont: 'SF Pro Display',
        secondaryFont: 'SF Pro Text'
      },
      spacing: {
        base: '8px',
        section: '110px'
      }
    }
  });

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    onChanges();
  };

  const handleThemeActivate = (themeId: string) => {
    setThemes(prev => prev.map(theme => ({
      ...theme,
      isActive: theme.id === themeId
    })));
    onChanges();
  };

  const handleThemeSetDefault = (themeId: string) => {
    setThemes(prev => prev.map(theme => ({
      ...theme,
      isDefault: theme.id === themeId
    })));
    onChanges();
  };

  const handleThemeDelete = (themeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) {
      setThemes(prev => prev.filter(theme => theme.id !== themeId));
      if (selectedTheme === themeId) {
        setSelectedTheme(themes[0]?.id || '');
      }
      onChanges();
    }
  };

  const handleCreateTheme = () => {
    if (newTheme.name.trim()) {
      const theme: Theme = {
        id: Date.now().toString(),
        name: newTheme.name,
        description: newTheme.description,
        config: newTheme.config,
        isDefault: false,
        isActive: false
      };
      
      setThemes(prev => [...prev, theme]);
      setNewTheme({
        name: '',
        description: '',
        config: {
          colors: {
            primary: '#007AFF',
            secondary: '#34C759',
            accent: '#FF9500',
            text: '#1D1D1F',
            background: '#FFFFFF'
          },
          typography: {
            primaryFont: 'SF Pro Display',
            secondaryFont: 'SF Pro Text'
          },
          spacing: {
            base: '8px',
            section: '110px'
          }
        }
      });
      setShowCreateModal(false);
      onChanges();
    }
  };

  const exportTheme = (theme: Theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string);
          if (theme.name && theme.config) {
            const importedTheme: Theme = {
              ...theme,
              id: Date.now().toString(),
              isDefault: false,
              isActive: false
            };
            setThemes(prev => [...prev, importedTheme]);
            onChanges();
          }
        } catch (error) {
          alert('Erreur lors de l\'import du thème');
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedThemeData = themes.find(theme => theme.id === selectedTheme);

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestionnaire de Thèmes
          </h3>
          <p className="text-gray-600 mt-1">
            Gérez et personnalisez les thèmes de votre site
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau thème
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des thèmes */}
        <div className="lg:col-span-1">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Thèmes disponibles
          </h4>
          
          <div className="space-y-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{theme.name}</h5>
                  <div className="flex items-center gap-1">
                    {theme.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Défaut
                      </span>
                    )}
                    {theme.isActive && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Actif
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {theme.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeActivate(theme.id);
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      theme.isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {theme.isActive ? 'Actif' : 'Activer'}
                  </button>
                  
                  {!theme.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeSetDefault(theme.id);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      Définir par défaut
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportTheme(theme);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Exporter"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  
                  {!theme.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeDelete(theme.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du thème sélectionné */}
        <div className="lg:col-span-2">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Détails du thème
          </h4>
          
          {selectedThemeData ? (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">
                  {selectedThemeData.name}
                </h5>
                <p className="text-gray-600 text-sm">
                  {selectedThemeData.description}
                </p>
              </div>

              {/* Couleurs */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Couleurs</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedThemeData.config.colors).map(([key, value]) => (
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
                  ))}
                </div>
              </div>

              {/* Typographie */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Typographie</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Police principale
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedThemeData.config.typography.primaryFont}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Police secondaire
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedThemeData.config.typography.secondaryFont}
                    </p>
                  </div>
                </div>
              </div>

              {/* Espacements */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Espacements</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedThemeData.config.spacing.base}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <p className="text-sm text-gray-600">
                      {selectedThemeData.config.spacing.section}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prévisualisation */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Prévisualisation</h5>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div
                    className="w-full h-32 rounded-lg relative overflow-hidden mb-4"
                    style={{ backgroundColor: selectedThemeData.config.colors.background }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h3 
                          className="text-xl font-bold mb-2"
                          style={{ 
                            color: selectedThemeData.config.colors.text,
                            fontFamily: selectedThemeData.config.typography.primaryFont
                          }}
                        >
                          Titre de section
                        </h3>
                        <p 
                          className="text-lg"
                          style={{ 
                            color: selectedThemeData.config.colors.text,
                            fontFamily: selectedThemeData.config.typography.secondaryFont
                          }}
                        >
                          Contenu de la section
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: selectedThemeData.config.colors.primary }}
                    >
                      Bouton primaire
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: selectedThemeData.config.colors.secondary }}
                    >
                      Bouton secondaire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Sélectionnez un thème pour voir ses détails
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de thème */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Créer un nouveau thème
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du thème
                </label>
                <input
                  type="text"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mon thème personnalisé"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTheme.description}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du thème..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTheme}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
