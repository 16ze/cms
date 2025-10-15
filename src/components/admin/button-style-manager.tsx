"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Square, 
  Circle, 
  RoundedSquare,
  Palette,
  Save,
  RotateCcw,
  Eye,
  Copy,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "./color-picker";

interface ButtonStyle {
  id: string;
  name: string;
  type: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  borderRadius: number;
  padding: {
    x: number;
    y: number;
  };
  fontSize: number;
  fontWeight: number;
  colors: {
    background: string;
    backgroundHover: string;
    text: string;
    textHover: string;
    border: string;
    borderHover: string;
  };
  shadows: {
    enabled: boolean;
    color: string;
    blur: number;
    spread: number;
    offsetX: number;
    offsetY: number;
  };
  animations: {
    enabled: boolean;
    duration: number;
    type: "none" | "scale" | "slide" | "bounce" | "glow";
  };
}

interface ButtonStyleManagerProps {
  styles: ButtonStyle[];
  onChange: (styles: ButtonStyle[]) => void;
}

const BUTTON_TYPES = [
  { value: "primary", label: "Primaire", description: "Bouton principal d'action" },
  { value: "secondary", label: "Secondaire", description: "Bouton d'action secondaire" },
  { value: "outline", label: "Contour", description: "Bouton avec bordure" },
  { value: "ghost", label: "Fantôme", description: "Bouton transparent" },
  { value: "destructive", label: "Destructif", description: "Bouton d'action dangereuse" },
  { value: "success", label: "Succès", description: "Bouton d'action positive" }
];

const ANIMATION_TYPES = [
  { value: "none", label: "Aucune" },
  { value: "scale", label: "Échelle", description: "Agrandissement au survol" },
  { value: "slide", label: "Glissement", description: "Translation vers le haut" },
  { value: "bounce", label: "Rebond", description: "Effet de rebond" },
  { value: "glow", label: "Lueur", description: "Effet de lueur" }
];

export function ButtonStyleManager({ styles, onChange }: ButtonStyleManagerProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showAddStyle, setShowAddStyle] = useState(false);
  const [newStyle, setNewStyle] = useState<Partial<ButtonStyle>>({
    name: "",
    type: "primary",
    borderRadius: 8,
    padding: { x: 16, y: 12 },
    fontSize: 16,
    fontWeight: 500,
    colors: {
      background: "#2563eb",
      backgroundHover: "#1d4ed8",
      text: "#ffffff",
      textHover: "#ffffff",
      border: "#2563eb",
      borderHover: "#1d4ed8"
    },
    shadows: {
      enabled: true,
      color: "rgba(0, 0, 0, 0.1)",
      blur: 4,
      spread: 0,
      offsetX: 0,
      offsetY: 2
    },
    animations: {
      enabled: true,
      duration: 200,
      type: "scale"
    }
  });

  const getSelectedStyleData = () => {
    return styles.find(s => s.id === selectedStyle);
  };

  const updateStyle = (updates: Partial<ButtonStyle>) => {
    if (!selectedStyle) return;
    
    const updatedStyles = styles.map(style => 
      style.id === selectedStyle ? { ...style, ...updates } : style
    );
    onChange(updatedStyles);
  };

  const addStyle = () => {
    if (!newStyle.name?.trim()) {
      toast.error("Le nom du style est requis");
      return;
    }

    const style: ButtonStyle = {
      id: `button_style_${Date.now()}`,
      name: newStyle.name,
      type: newStyle.type || "primary",
      borderRadius: newStyle.borderRadius || 8,
      padding: newStyle.padding || { x: 16, y: 12 },
      fontSize: newStyle.fontSize || 16,
      fontWeight: newStyle.fontWeight || 500,
      colors: {
        background: newStyle.colors?.background || "#2563eb",
        backgroundHover: newStyle.colors?.backgroundHover || "#1d4ed8",
        text: newStyle.colors?.text || "#ffffff",
        textHover: newStyle.colors?.textHover || "#ffffff",
        border: newStyle.colors?.border || "#2563eb",
        borderHover: newStyle.colors?.borderHover || "#1d4ed8"
      },
      shadows: {
        enabled: newStyle.shadows?.enabled ?? true,
        color: newStyle.shadows?.color || "rgba(0, 0, 0, 0.1)",
        blur: newStyle.shadows?.blur || 4,
        spread: newStyle.shadows?.spread || 0,
        offsetX: newStyle.shadows?.offsetX || 0,
        offsetY: newStyle.shadows?.offsetY || 2
      },
      animations: {
        enabled: newStyle.animations?.enabled ?? true,
        duration: newStyle.animations?.duration || 200,
        type: newStyle.animations?.type || "scale"
      }
    };

    const updatedStyles = [...styles, style];
    onChange(updatedStyles);
    
    setNewStyle({
      name: "",
      type: "primary",
      borderRadius: 8,
      padding: { x: 16, y: 12 },
      fontSize: 16,
      fontWeight: 500,
      colors: {
        background: "#2563eb",
        backgroundHover: "#1d4ed8",
        text: "#ffffff",
        textHover: "#ffffff",
        border: "#2563eb",
        borderHover: "#1d4ed8"
      },
      shadows: {
        enabled: true,
        color: "rgba(0, 0, 0, 0.1)",
        blur: 4,
        spread: 0,
        offsetX: 0,
        offsetY: 2
      },
      animations: {
        enabled: true,
        duration: 200,
        type: "scale"
      }
    });
    setShowAddStyle(false);
    setSelectedStyle(style.id);
    toast.success("Style de bouton ajouté avec succès !");
  };

  const removeStyle = (styleId: string) => {
    const updatedStyles = styles.filter(s => s.id !== styleId);
    onChange(updatedStyles);
    if (selectedStyle === styleId) {
      setSelectedStyle(null);
    }
    toast.success("Style de bouton supprimé !");
  };

  const duplicateStyle = (style: ButtonStyle) => {
    const duplicatedStyle: ButtonStyle = {
      ...style,
      id: `button_style_${Date.now()}`,
      name: `${style.name} (Copie)`
    };
    
    const updatedStyles = [...styles, duplicatedStyle];
    onChange(updatedStyles);
    setSelectedStyle(duplicatedStyle.id);
    toast.success("Style de bouton dupliqué !");
  };

  const getButtonPreviewStyle = (style: ButtonStyle) => {
    const shadowStyle = style.shadows.enabled ? {
      boxShadow: `${style.shadows.offsetX}px ${style.shadows.offsetY}px ${style.shadows.blur}px ${style.shadows.spread}px ${style.shadows.color}`
    } : {};

    const animationStyle = style.animations.enabled ? {
      transition: `all ${style.animations.duration}ms ease`
    } : {};

    return {
      backgroundColor: style.colors.background,
      color: style.colors.text,
      border: `1px solid ${style.colors.border}`,
      borderRadius: `${style.borderRadius}px`,
      padding: `${style.padding.y}px ${style.padding.x}px`,
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      ...shadowStyle,
      ...animationStyle
    };
  };

  const getButtonHoverStyle = (style: ButtonStyle) => {
    const shadowStyle = style.shadows.enabled ? {
      boxShadow: `${style.shadows.offsetX}px ${style.shadows.offsetY + 2}px ${style.shadows.blur + 2}px ${style.shadows.spread}px ${style.shadows.color}`
    } : {};

    let transform = "";
    switch (style.animations.type) {
      case "scale":
        transform = "scale(1.05)";
        break;
      case "slide":
        transform = "translateY(-2px)";
        break;
      case "bounce":
        transform = "translateY(-4px)";
        break;
      case "glow":
        transform = "scale(1.02)";
        break;
    }

    return {
      backgroundColor: style.colors.backgroundHover,
      color: style.colors.textHover,
      border: `1px solid ${style.colors.borderHover}`,
      transform,
      ...shadowStyle
    };
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Square className="w-5 h-5 mr-2" />
            Gestion des Styles de Boutons
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Personnalisez l'apparence et le comportement de tous vos boutons
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddStyle(!showAddStyle)}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Style
        </Button>
      </div>

      {/* Formulaire d'ajout de style */}
      {showAddStyle && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouveau Style de Bouton</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="style-name">Nom du style</Label>
              <Input
                id="style-name"
                value={newStyle.name}
                onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                placeholder="ex: Bouton Principal"
              />
            </div>
            
            <div>
              <Label htmlFor="style-type">Type de bouton</Label>
              <Select
                value={newStyle.type}
                onValueChange={(value) => setNewStyle({ ...newStyle, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={addStyle} size="sm">
                Ajouter
              </Button>
              <Button 
                onClick={() => setShowAddStyle(false)} 
                variant="outline" 
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des styles */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Styles Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedStyle === style.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{style.name}</div>
                        <div className="text-xs text-neutral-500 capitalize">{style.type}</div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateStyle(style);
                          }}
                          className="p-1 h-6 w-6"
                          title="Dupliquer"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStyle(style.id);
                          }}
                          className="p-1 h-6 w-6"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {styles.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    <p>Aucun style configuré</p>
                    <p className="text-sm">Ajoutez votre premier style pour commencer</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Éditeur de style */}
        <div className="lg:col-span-2">
          {selectedStyle && getSelectedStyleData() ? (
            <div className="space-y-6">
              {/* Aperçu du bouton */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aperçu du Bouton</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <button
                      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      style={getButtonPreviewStyle(getSelectedStyleData()!)}
                      onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, getButtonHoverStyle(getSelectedStyleData()!));
                      }}
                      onMouseLeave={(e) => {
                        Object.assign(e.currentTarget.style, getButtonPreviewStyle(getSelectedStyleData()!));
                      }}
                    >
                      Exemple de Bouton
                    </button>
                    
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      <p>Survolez pour voir l'effet hover</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paramètres de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Paramètres de Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="style-name-edit">Nom du style</Label>
                    <Input
                      id="style-name-edit"
                      value={getSelectedStyleData()!.name}
                      onChange={(e) => updateStyle({ name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rayon de bordure</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[getSelectedStyleData()!.borderRadius]}
                          onValueChange={([value]) => updateStyle({ borderRadius: value })}
                          min={0}
                          max={50}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={getSelectedStyleData()!.borderRadius}
                          onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                          className="w-16 text-center"
                          min={0}
                          max={50}
                        />
                        <span className="text-xs text-neutral-500">px</span>
                      </div>
                    </div>

                    <div>
                      <Label>Taille de police</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[getSelectedStyleData()!.fontSize]}
                          onValueChange={([value]) => updateStyle({ fontSize: value })}
                          min={12}
                          max={32}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={getSelectedStyleData()!.fontSize}
                          onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || 16 })}
                          className="w-16 text-center"
                          min={12}
                          max={32}
                        />
                        <span className="text-xs text-neutral-500">px</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Padding horizontal</Label>
                      <Input
                        type="number"
                        value={getSelectedStyleData()!.padding.x}
                        onChange={(e) => updateStyle({ 
                          padding: { ...getSelectedStyleData()!.padding, x: parseInt(e.target.value) || 0 }
                        })}
                        min={0}
                        max={100}
                      />
                    </div>
                    
                    <div>
                      <Label>Padding vertical</Label>
                      <Input
                        type="number"
                        value={getSelectedStyleData()!.padding.y}
                        onChange={(e) => updateStyle({ 
                          padding: { ...getSelectedStyleData()!.padding, y: parseInt(e.target.value) || 0 }
                        })}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Couleurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Couleur de fond</Label>
                      <ColorPicker
                        value={getSelectedStyleData()!.colors.background}
                        onChange={(value) => updateStyle({ 
                          colors: { ...getSelectedStyleData()!.colors, background: value }
                        })}
                        label="Fond"
                      />
                    </div>
                    
                    <div>
                      <Label>Fond au survol</Label>
                      <ColorPicker
                        value={getSelectedStyleData()!.colors.backgroundHover}
                        onChange={(value) => updateStyle({ 
                          colors: { ...getSelectedStyleData()!.colors, backgroundHover: value }
                        })}
                        label="Fond Hover"
                      />
                    </div>
                    
                    <div>
                      <Label>Couleur du texte</Label>
                      <ColorPicker
                        value={getSelectedStyleData()!.colors.text}
                        onChange={(value) => updateStyle({ 
                          colors: { ...getSelectedStyleData()!.colors, text: value }
                        })}
                        label="Texte"
                      />
                    </div>
                    
                    <div>
                      <Label>Texte au survol</Label>
                      <ColorPicker
                        value={getSelectedStyleData()!.colors.textHover}
                        onChange={(value) => updateStyle({ 
                          colors: { ...getSelectedStyleData()!.colors, textHover: value }
                        })}
                        label="Texte Hover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ombres */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ombres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="shadows-enabled"
                        checked={getSelectedStyleData()!.shadows.enabled}
                        onChange={(e) => updateStyle({ 
                          shadows: { ...getSelectedStyleData()!.shadows, enabled: e.target.checked }
                        })}
                      />
                      <Label htmlFor="shadows-enabled">Activer les ombres</Label>
                    </div>

                    {getSelectedStyleData()!.shadows.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Couleur de l'ombre</Label>
                          <ColorPicker
                            value={getSelectedStyleData()!.shadows.color}
                            onChange={(value) => updateStyle({ 
                              shadows: { ...getSelectedStyleData()!.shadows, color: value }
                            })}
                            label="Ombre"
                          />
                        </div>
                        
                        <div>
                          <Label>Flou</Label>
                          <Slider
                            value={[getSelectedStyleData()!.shadows.blur]}
                            onValueChange={([value]) => updateStyle({ 
                              shadows: { ...getSelectedStyleData()!.shadows, blur: value }
                            })}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Animations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Animations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="animations-enabled"
                        checked={getSelectedStyleData()!.animations.enabled}
                        onChange={(e) => updateStyle({ 
                          animations: { ...getSelectedStyleData()!.animations, enabled: e.target.checked }
                        })}
                      />
                      <Label htmlFor="animations-enabled">Activer les animations</Label>
                    </div>

                    {getSelectedStyleData()!.animations.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type d'animation</Label>
                          <Select
                            value={getSelectedStyleData()!.animations.type}
                            onValueChange={(value) => updateStyle({ 
                              animations: { ...getSelectedStyleData()!.animations, type: value as any }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ANIMATION_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label} {type.description && `- ${type.description}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Durée (ms)</Label>
                          <Input
                            type="number"
                            value={getSelectedStyleData()!.animations.duration}
                            onChange={(e) => updateStyle({ 
                              animations: { ...getSelectedStyleData()!.animations, duration: parseInt(e.target.value) || 200 }
                            })}
                            min={100}
                            max={1000}
                            step={50}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Square className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sélectionnez un style pour commencer l'édition
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
