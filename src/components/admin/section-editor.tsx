"use client";

import { useState, useEffect } from "react";
import { Eye, Monitor, Tablet, Smartphone, Save, Undo, Redo, Image as ImageIcon, Palette } from "lucide-react";
import RichTextEditor from "./rich-text-editor";
import MediaManager from "./media-manager";
import DesignManager from "./design-manager";

interface SectionEditorProps {
  section: {
    id: string;
    sectionName: string;
    sectionType: string;
    contentJson: any;
  };
  onSave: (sectionId: string, content: any) => void;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export default function SectionEditor({ section, onSave }: SectionEditorProps) {
  const [content, setContent] = useState(section.contentJson);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [showDesignManager, setShowDesignManager] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([section.contentJson]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sauvegarde automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (JSON.stringify(content) !== JSON.stringify(history[historyIndex])) {
        saveToHistory();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [content, history, historyIndex]);

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(content)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    onSave(section.id, content);
    saveToHistory();
  };

  const handleImageSelect = (fieldPath: string) => {
    setCurrentImageField(fieldPath);
    setShowMediaManager(true);
  };

  const handleMediaSelect = (media: any) => {
    if (currentImageField) {
      const newContent = { ...content };
      const pathParts = currentImageField.split('.');
      let current = newContent;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = media.filePath;
      setContent(newContent);
    }
    setShowMediaManager(false);
    setCurrentImageField(null);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'desktop': return 'w-full';
      case 'tablet': return 'w-3/4 mx-auto';
      case 'mobile': return 'w-80 mx-auto';
      default: return 'w-full';
    }
  };

  const renderFieldEditor = (key: string, value: any, path: string[] = []) => {
    const currentPath = [...path, key];
    const currentValue = value;
    const fieldPath = currentPath.join('.');

    if (typeof currentValue === 'string') {
      // Détecter si c'est un champ de texte riche (contient du HTML)
      const isRichText = currentValue.includes('<') && currentValue.includes('>');
      // Détecter si c'est un champ d'image
      const isImageField = key.toLowerCase().includes('image') || 
                          key.toLowerCase().includes('img') || 
                          key.toLowerCase().includes('background');

      if (isImageField) {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentValue}
                onChange={(e) => {
                  const newContent = { ...content };
                  let current = newContent;
                  for (let i = 0; i < path.length; i++) {
                    current = current[path[i]];
                  }
                  current[key] = e.target.value;
                  setContent(newContent);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`URL de l'${key.toLowerCase()}`}
              />
              <button
                onClick={() => handleImageSelect(fieldPath)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Choisir
              </button>
            </div>
            {currentValue && (
              <div className="mt-2">
                <img
                  src={currentValue}
                  alt={`Aperçu ${key}`}
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        );
      }

      if (isRichText || key.toLowerCase().includes('description') || 
          key.toLowerCase().includes('content') || key.toLowerCase().includes('text')) {
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <RichTextEditor
              value={currentValue}
              onChange={(newValue) => {
                const newContent = { ...content };
                let current = newContent;
                for (let i = 0; i < path.length; i++) {
                  current = current[path[i]];
                }
                current[key] = newValue;
                setContent(newContent);
              }}
              placeholder={`Entrez le ${key.toLowerCase()}`}
              className="min-h-[200px]"
            />
          </div>
        );
      }

      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => {
              const newContent = { ...content };
              let current = newContent;
              for (let i = 0; i < path.length; i++) {
                current = current[path[i]];
              }
              current[key] = e.target.value;
              setContent(newContent);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Entrez le ${key.toLowerCase()}`}
          />
        </div>
      );
    }

    if (Array.isArray(currentValue)) {
      return (
        <div key={key} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()} ({currentValue.length} élément{currentValue.length > 1 ? 's' : ''})
          </h4>
          {currentValue.map((item, index) => (
            <div key={index} className="mb-4 p-3 border border-gray-100 rounded">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Élément {index + 1}
              </h5>
              {typeof item === 'object' ? (
                Object.keys(item).map((subKey) =>
                  renderFieldEditor(subKey, item[subKey], [...currentPath, index.toString()])
                )
              ) : (
                renderFieldEditor('value', item, [...currentPath, index.toString()])
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof currentValue === 'object' && currentValue !== null) {
      return (
        <div key={key} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-3 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          {Object.keys(currentValue).map((subKey) =>
            renderFieldEditor(subKey, currentValue[subKey], currentPath)
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header de l'éditeur */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Édition : {section.sectionName}
            </h3>
            <p className="text-sm text-gray-600">
              Type: {section.sectionType}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Contrôles d'historique */}
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Annuler"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Rétablir"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            {/* Bouton de personnalisation d'apparence */}
            <button
              onClick={() => setShowDesignManager(true)}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors border border-purple-300 rounded-lg hover:bg-purple-50"
            >
              <Palette className="w-4 h-4" />
              Apparence
            </button>
            
            {/* Bouton de prévisualisation */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Prévisualiser'}
            </button>
            
            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Panneau d'édition */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {Object.keys(content).map((key) =>
              renderFieldEditor(key, content[key])
            )}
          </div>
        </div>

        {/* Panneau de prévisualisation */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-200 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Prévisualisation
              </h4>
              
              {/* Sélecteur de mode de prévisualisation */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Desktop (1440px)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className={`bg-gray-50 rounded-lg p-4 ${getPreviewWidth()}`}>
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Aperçu de la section
                </h3>
                
                {/* Rendu de la prévisualisation basé sur le type de section */}
                {section.sectionType === 'HERO' && (
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {content.title || 'Titre du hero'}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                      {content.subtitle || 'Sous-titre du hero'}
                    </p>
                    {content.ctaButton && (
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        {content.ctaButton}
                      </button>
                    )}
                    {content.backgroundImage && (
                      <div className="mt-4">
                        <img
                          src={content.backgroundImage}
                          alt="Background"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {section.sectionType === 'TEXT' && (
                  <div>
                    {content.bubble1 && (
                      <div className="mb-3" dangerouslySetInnerHTML={{ __html: content.bubble1 }} />
                    )}
                    {content.bubble2 && (
                      <div className="mb-3" dangerouslySetInnerHTML={{ __html: content.bubble2 }} />
                    )}
                    {content.bubble3 && (
                      <div className="mb-3" dangerouslySetInnerHTML={{ __html: content.bubble3 }} />
                    )}
                  </div>
                )}

                {section.sectionType === 'SERVICES' && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {content.title || 'Titre des services'}
                    </h2>
                    <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: content.subtitle || 'Description des services' }} />
                    <p className="text-lg font-medium text-gray-800 mb-4">
                      {content.slogan || 'Slogan des services'}
                    </p>
                  </div>
                )}

                {section.sectionType === 'GRID' && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(content).map(([key, value]) => (
                      <div key={key} className="bg-gray-100 p-3 rounded text-center">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: value as string }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gestionnaire de médias */}
      {showMediaManager && (
        <MediaManager
          onSelect={handleMediaSelect}
          onClose={() => {
            setShowMediaManager(false);
            setCurrentImageField(null);
          }}
          multiple={false}
          acceptedTypes={['image/*']}
        />
      )}

      {/* Gestionnaire de design */}
      {showDesignManager && (
        <DesignManager
          sectionId={section.id}
          onClose={() => setShowDesignManager(false)}
        />
      )}
    </div>
  );
}
