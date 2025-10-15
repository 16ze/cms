"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Save, 
  Trash2, 
  Plus, 
  Eye, 
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface ButtonStyle {
  id: string;
  name: string;
  displayName: string;
  isDefault: boolean;
  configJson: {
    backgroundColor: string;
    color: string;
    borderColor: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: string;
    borderWidth: string;
    borderStyle: string;
    hover: {
      backgroundColor: string;
      borderColor: string;
      transform: string;
      boxShadow: string;
    };
    active: {
      backgroundColor: string;
      borderColor: string;
      transform: string;
    };
  };
}

interface ButtonStylesManagerProps {
  className?: string;
}

export default function ButtonStylesManager({ className = "" }: ButtonStylesManagerProps) {
  const [buttonStyles, setButtonStyles] = useState<ButtonStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<ButtonStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les styles de boutons
  const loadButtonStyles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/button-styles");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des styles");
      }

      const data = await response.json();
      setButtonStyles(data);
      
      if (data.length > 0 && !selectedStyle) {
        setSelectedStyle(data[0]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des styles:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder un style
  const saveButtonStyle = async (style: ButtonStyle) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/button-styles/${style.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(style),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const updatedStyle = await response.json();
      setButtonStyles(prev => 
        prev.map(s => s.id === updatedStyle.id ? updatedStyle : s)
      );
      setSelectedStyle(updatedStyle);
      setSuccess("Style sauvegardé avec succès !");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un style
  const deleteButtonStyle = async (styleId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce style ?")) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/button-styles/${styleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setButtonStyles(prev => prev.filter(s => s.id !== styleId));
      setSelectedStyle(null);
      setSuccess("Style supprimé avec succès !");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour une propriété du style
  const updateStyleProperty = (property: string, value: string, subProperty?: string) => {
    if (!selectedStyle) return;

    const updatedStyle = { ...selectedStyle };
    
    if (subProperty) {
      (updatedStyle.configJson as any)[property][subProperty] = value;
    } else {
      (updatedStyle.configJson as any)[property] = value;
    }

    setSelectedStyle(updatedStyle);
  };

  // Générer le CSS pour la prévisualisation
  const generatePreviewCSS = (style: ButtonStyle) => {
    const config = style.configJson;
    return `
      .button-preview {
        background-color: ${config.backgroundColor};
        color: ${config.color};
        border: ${config.borderWidth} ${config.borderStyle} ${config.borderColor};
        border-radius: ${config.borderRadius};
        padding: ${config.padding};
        font-size: ${config.fontSize};
        font-weight: ${config.fontWeight};
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-block;
        text-decoration: none;
      }
      .button-preview:hover {
        background-color: ${config.hover.backgroundColor};
        border-color: ${config.hover.borderColor};
        transform: ${config.hover.transform};
        box-shadow: ${config.hover.boxShadow};
      }
      .button-preview:active {
        background-color: ${config.active.backgroundColor};
        border-color: ${config.active.borderColor};
        transform: ${config.active.transform};
      }
    `;
  };

  useEffect(() => {
    loadButtonStyles();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des styles de boutons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Styles de Boutons</h2>
          <p className="text-gray-600">
            Personnalisez l'apparence de vos boutons
          </p>
        </div>
        <Button onClick={loadButtonStyles} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Styles disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {buttonStyles.map((style) => (
                <div
                  key={style.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStyle?.id === style.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedStyle(style)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {style.displayName}
                      </h4>
                      <p className="text-sm text-gray-600">{style.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {style.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Défaut
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteButtonStyle(style.id);
                        }}
                        disabled={style.isDefault}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Éditeur de style */}
        {selectedStyle && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Éditer {selectedStyle.displayName}
                </span>
                <Button
                  onClick={() => saveButtonStyle(selectedStyle)}
                  disabled={saving}
                  className="ml-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="colors">Couleurs</TabsTrigger>
                  <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Nom d'affichage</Label>
                      <Input
                        id="displayName"
                        value={selectedStyle.displayName}
                        onChange={(e) =>
                          setSelectedStyle({
                            ...selectedStyle,
                            displayName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Nom technique</Label>
                      <Input
                        id="name"
                        value={selectedStyle.name}
                        onChange={(e) =>
                          setSelectedStyle({
                            ...selectedStyle,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="padding">Padding</Label>
                      <Input
                        id="padding"
                        value={selectedStyle.configJson.padding}
                        onChange={(e) =>
                          updateStyleProperty("padding", e.target.value)
                        }
                        placeholder="12px 24px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="borderRadius">Bordure arrondie</Label>
                      <Input
                        id="borderRadius"
                        value={selectedStyle.configJson.borderRadius}
                        onChange={(e) =>
                          updateStyleProperty("borderRadius", e.target.value)
                        }
                        placeholder="8px"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fontSize">Taille de police</Label>
                      <Input
                        id="fontSize"
                        value={selectedStyle.configJson.fontSize}
                        onChange={(e) =>
                          updateStyleProperty("fontSize", e.target.value)
                        }
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontWeight">Épaisseur de police</Label>
                      <Input
                        id="fontWeight"
                        value={selectedStyle.configJson.fontWeight}
                        onChange={(e) =>
                          updateStyleProperty("fontWeight", e.target.value)
                        }
                        placeholder="600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borderWidth">Épaisseur de bordure</Label>
                      <Input
                        id="borderWidth"
                        value={selectedStyle.configJson.borderWidth}
                        onChange={(e) =>
                          updateStyleProperty("borderWidth", e.target.value)
                        }
                        placeholder="2px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="borderStyle">Style de bordure</Label>
                      <Input
                        id="borderStyle"
                        value={selectedStyle.configJson.borderStyle}
                        onChange={(e) =>
                          updateStyleProperty("borderStyle", e.target.value)
                        }
                        placeholder="solid"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <h4 className="font-medium text-gray-900">Couleurs principales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backgroundColor">Couleur de fond</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          value={selectedStyle.configJson.backgroundColor}
                          onChange={(e) =>
                            updateStyleProperty("backgroundColor", e.target.value)
                          }
                          placeholder="#3B82F6"
                        />
                        <input
                          type="color"
                          value={selectedStyle.configJson.backgroundColor}
                          onChange={(e) =>
                            updateStyleProperty("backgroundColor", e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="color">Couleur du texte</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          value={selectedStyle.configJson.color}
                          onChange={(e) =>
                            updateStyleProperty("color", e.target.value)
                          }
                          placeholder="#FFFFFF"
                        />
                        <input
                          type="color"
                          value={selectedStyle.configJson.color}
                          onChange={(e) =>
                            updateStyleProperty("color", e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="borderColor">Couleur de bordure</Label>
                    <div className="flex gap-2">
                      <Input
                        id="borderColor"
                        value={selectedStyle.configJson.borderColor}
                        onChange={(e) =>
                          updateStyleProperty("borderColor", e.target.value)
                        }
                        placeholder="#3B82F6"
                      />
                      <input
                        type="color"
                        value={selectedStyle.configJson.borderColor}
                        onChange={(e) =>
                          updateStyleProperty("borderColor", e.target.value)
                        }
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mt-6">Effet hover</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hoverBackgroundColor">Couleur de fond (hover)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hoverBackgroundColor"
                          value={selectedStyle.configJson.hover.backgroundColor}
                          onChange={(e) =>
                            updateStyleProperty("hover", e.target.value, "backgroundColor")
                          }
                          placeholder="#2563EB"
                        />
                        <input
                          type="color"
                          value={selectedStyle.configJson.hover.backgroundColor}
                          onChange={(e) =>
                            updateStyleProperty("hover", e.target.value, "backgroundColor")
                          }
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hoverBorderColor">Couleur de bordure (hover)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="hoverBorderColor"
                          value={selectedStyle.configJson.hover.borderColor}
                          onChange={(e) =>
                            updateStyleProperty("hover", e.target.value, "borderColor")
                          }
                          placeholder="#2563EB"
                        />
                        <input
                          type="color"
                          value={selectedStyle.configJson.hover.borderColor}
                          onChange={(e) =>
                            updateStyleProperty("hover", e.target.value, "borderColor")
                          }
                          className="w-12 h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">
                      Prévisualisation du bouton
                    </h4>
                    <style>{generatePreviewCSS(selectedStyle)}</style>
                    <div className="flex items-center gap-4">
                      <button className="button-preview">
                        Bouton exemple
                      </button>
                      <button className="button-preview">
                        Action
                      </button>
                      <button className="button-preview">
                        Cliquez-moi
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">CSS généré</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{generatePreviewCSS(selectedStyle)}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
