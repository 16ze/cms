"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Save,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Globe,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "./color-picker";
import { MediaSelector } from "./media-selector";

interface RealTimeContentEditorProps {
  onSave: (content: any) => void;
  onPreview: (content: any) => void;
}

interface EditableField {
  id: string;
  path: string;
  type: "text" | "textarea" | "color" | "image" | "number" | "select";
  label: string;
  value: any;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export function RealTimeContentEditor({ onSave, onPreview }: RealTimeContentEditorProps) {
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  // Charger le contenu initial depuis le SITE CLIENT ACTUEL
  useEffect(() => {
    syncWithClientSite();
  }, []);

  // Synchroniser avec le VRAI contenu côté client (après refonte)
  const syncWithClientSite = async () => {
    try {
      setSyncing(true);
      setSyncStatus("syncing");
      
      // IMPORTANT : Charger depuis l'API PUBLIQUE pour avoir le contenu RÉEL du site
      const clientResponse = await fetch("/api/public/content");
      if (clientResponse.ok) {
        const clientContent = await clientResponse.json();
        
        // Analyser et structurer le contenu réel
        const structuredContent = analyzeAndStructureContent(clientContent);
        
        setCurrentContent(structuredContent);
        setHasChanges(false);
        setSyncStatus("synced");
        
        toast.success("✅ Synchronisation avec le site client ACTUEL réussie !");
        console.log("🔄 Contenu synchronisé avec le site client:", structuredContent);
      } else {
        throw new Error("Impossible de récupérer le contenu du site client");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation avec le site client:", error);
      setSyncStatus("error");
      toast.error("❌ Erreur lors de la synchronisation avec le site client");
    } finally {
      setSyncing(false);
    }
  };

  // Analyser et structurer le contenu réel du site client
  const analyzeAndStructureContent = (rawContent: any) => {
    console.log("🔍 Analyse du contenu brut du site client:", rawContent);
    
    // Créer une structure propre basée sur le contenu réel
    const structured: any = {};
    
    // Analyser chaque page
    Object.entries(rawContent).forEach(([pageName, pageData]) => {
      if (pageName !== 'global' && pageName !== 'header' && pageName !== 'footer') {
        console.log(`📖 Analyse de la page: ${pageName}`, pageData);
        
        // Extraire le contenu réel de la page
        const pageContent = extractRealPageContent(pageName, pageData);
        structured[pageName] = pageContent;
      }
    });
    
    console.log("🏗️ Contenu structuré:", structured);
    return structured;
  };

  // Extraire le contenu RÉEL d'une page
  const extractRealPageContent = (pageName: string, pageData: any) => {
    const extracted: any = {};
    
    // Analyser le contenu de la page pour extraire les éléments réels
    if (pageData) {
      // Titres
      if (pageData.title) {
        extracted.title = pageData.title;
        console.log(`  📝 Titre trouvé: "${pageData.title}"`);
      }
      
      // Descriptions
      if (pageData.description) {
        extracted.description = pageData.description;
        console.log(`  📝 Description trouvée: "${pageData.description.substring(0, 50)}..."`);
      }
      
      // Sections
      if (pageData.sections && Array.isArray(pageData.sections)) {
        extracted.sections = pageData.sections.map((section: any, index: number) => {
          console.log(`  📝 Section ${index + 1}:`, section);
          return section;
        });
      }
      
      // CTA
      if (pageData.cta) {
        extracted.cta = pageData.cta;
        console.log(`  📝 CTA trouvé:`, pageData.cta);
      }
      
      // Contenu spécifique selon la page
      if (pageName === 'home' && pageData.hero) {
        extracted.hero = pageData.hero;
        console.log(`  📝 Hero trouvé:`, pageData.hero);
      }
      
      if (pageName === 'services' && pageData.services) {
        extracted.services = pageData.services;
        console.log(`  📝 Services trouvés:`, pageData.services);
      }
    }
    
    return extracted;
  };

  // Générer les champs éditables basés sur le contenu RÉEL
  const generateEditableFields = useCallback((content: any, path: string = ""): EditableField[] => {
    const fields: EditableField[] = [];
    
    if (!content || typeof content !== "object") return fields;

    Object.entries(content).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === "string") {
        fields.push({
          id: currentPath,
          path: currentPath,
          type: value.length > 100 ? "textarea" : "text",
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
          value: value,
          placeholder: `Entrez ${key.toLowerCase()}...`
        });
      } else if (typeof value === "number") {
        fields.push({
          id: currentPath,
          path: currentPath,
          type: "number",
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
          value: value,
          placeholder: `Entrez ${key.toLowerCase()}...`
        });
      } else if (typeof value === "object" && value !== null) {
        // Section ou objet complexe
        if (Array.isArray(value)) {
          // Gérer les tableaux
          value.forEach((item, index) => {
            if (typeof item === "string") {
              fields.push({
                id: `${currentPath}.${index}`,
                path: `${currentPath}.${index}`,
                type: "text",
                label: `${key} ${index + 1}`,
                value: item,
                placeholder: `Entrez ${key.toLowerCase()} ${index + 1}...`
              });
            } else if (typeof item === "object" && item.title) {
              // Gérer les objets avec titre
              fields.push({
                id: `${currentPath}.${index}.title`,
                path: `${currentPath}.${index}.title`,
                type: "text",
                label: `${key} ${index + 1} - Titre`,
                value: item.title,
                placeholder: `Entrez le titre...`
              });
              
              if (item.description) {
                fields.push({
                  id: `${currentPath}.${index}.description`,
                  path: `${currentPath}.${index}.description`,
                  type: "textarea",
                  label: `${key} ${index + 1} - Description`,
                  value: item.description,
                  placeholder: `Entrez la description...`
                });
              }
            }
          });
        } else {
          // Objet imbriqué - récursion
          fields.push(...generateEditableFields(value, currentPath));
        }
      }
    });

    return fields;
  }, []);

  const handleFieldChange = (path: string, value: any) => {
    if (!currentContent) return;

    const updatedContent = { ...currentContent };
    const keys = path.split(".");
    let current = updatedContent;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setCurrentContent(updatedContent);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentContent) return;

    setSaving(true);
    try {
      await onSave(currentContent);
      setHasChanges(false);
      toast.success("✅ Contenu sauvegardé avec succès !");
      
      // Recharger le contenu après sauvegarde pour synchroniser
      await syncWithClientSite();
    } catch (error) {
      toast.error("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (currentContent) {
      onPreview(currentContent);
      setShowPreview(true);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderField = (field: EditableField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={field.value || ""}
            onChange={(e) => handleFieldChange(field.path, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );
      
      case "textarea":
        return (
          <Textarea
            value={field.value || ""}
            onChange={(e) => handleFieldChange(field.path, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full"
          />
        );
      
      case "color":
        return (
          <ColorPicker
            value={field.value || "#000000"}
            onChange={(color) => handleFieldChange(field.path, color)}
          />
        );
      
      case "image":
        return (
          <MediaSelector
            value={field.value || ""}
            onChange={(value) => handleFieldChange(field.path, value)}
            label={field.label}
          />
        );
      
      case "number":
        return (
          <Input
            type="number"
            value={field.value || 0}
            onChange={(e) => handleFieldChange(field.path, Number(e.target.value))}
            placeholder={field.placeholder}
            className="w-full"
          />
        );
      
      default:
        return (
          <Input
            value={field.value || ""}
            onChange={(e) => handleFieldChange(field.path, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );
    }
  };

  const pageOptions = currentContent ? Object.keys(currentContent).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  })) : [];

  const editableFields = selectedPage && currentContent?.[selectedPage] 
    ? generateEditableFields(currentContent[selectedPage], selectedPage)
    : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Bouton retour au dashboard */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/admin"}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Éditeur de Contenu en Temps Réel
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Synchronisé avec le site client ACTUEL (après refonte)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Bouton synchronisation avec le site client */}
            <Button
              variant="outline"
              onClick={syncWithClientSite}
              disabled={syncing}
              className="flex items-center space-x-2"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Synchroniser avec le site</span>
            </Button>

            {/* Sélecteur de prévisualisation */}
            <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-2">
              <Button
                variant={previewDevice === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!hasChanges}
            >
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Édition */}
        <div className="w-1/2 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
          <div className="p-6">
            {/* Sélecteur de page */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Page à modifier
              </Label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                {pageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Champs éditables */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Contenu de la page : {selectedPage}
                </h3>
                
                {/* Indicateur de synchronisation */}
                <div className="flex items-center space-x-2">
                  {syncStatus === "syncing" && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronisation...</span>
                    </div>
                  )}
                  {syncStatus === "synced" && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>✅</span>
                      <span>Synchronisé avec le site client</span>
                    </div>
                  )}
                  {syncStatus === "error" && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Erreur de synchronisation</span>
                    </div>
                  )}
                  {hasChanges && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600">
                      <span>●</span>
                      <span>Modifications non sauvegardées</span>
                    </div>
                  )}
                </div>
              </div>
              
              {editableFields.length > 0 ? (
                editableFields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {field.label}
                    </Label>
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {field.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p>Aucun champ éditable trouvé sur cette page</p>
                  <p className="text-sm mt-2">Cliquez sur "Synchroniser avec le site" pour récupérer le contenu actuel</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prévisualisation */}
        <div className="w-1/2 bg-neutral-100 dark:bg-neutral-900 p-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-neutral-200 dark:bg-neutral-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Prévisualisation - {previewDevice}
              </span>
            </div>
            
            <div className="p-4">
              {showPreview ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-16 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Prévisualisation en cours de développement...
                  </p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                    Les modifications sont synchronisées avec le site client ACTUEL
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-16 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Cliquez sur "Prévisualiser" pour voir vos modifications
                  </p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                    Le contenu est synchronisé avec le site client ACTUEL (après refonte)
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>💡 Info :</strong> L'admin est maintenant synchronisé avec le VRAI contenu de votre site refait !
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
