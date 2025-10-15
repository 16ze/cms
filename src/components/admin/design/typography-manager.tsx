"use client";

import { useState } from "react";
import { Type, Upload, Eye, RefreshCw } from "lucide-react";

interface TypographyManagerProps {
  onChanges: () => void;
}

interface TypographyConfig {
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  sizes: {
    h1: { desktop: string; tablet: string; mobile: string };
    h2: { desktop: string; tablet: string; mobile: string };
    h3: { desktop: string; tablet: string; mobile: string };
    h4: { desktop: string; tablet: string; mobile: string };
    body: { desktop: string; tablet: string; mobile: string };
    small: { desktop: string; tablet: string; mobile: string };
  };
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  spacing: {
    letterSpacing: string;
    lineHeight: string;
  };
}

export default function TypographyManager({ onChanges }: TypographyManagerProps) {
  const [typography, setTypography] = useState<TypographyConfig>({
    fonts: {
      primary: 'SF Pro Display',
      secondary: 'SF Pro Text',
      monospace: 'SF Mono'
    },
    sizes: {
      h1: { desktop: '96px', tablet: '72px', mobile: '48px' },
      h2: { desktop: '56px', tablet: '42px', mobile: '32px' },
      h3: { desktop: '40px', tablet: '32px', mobile: '28px' },
      h4: { desktop: '32px', tablet: '28px', mobile: '24px' },
      body: { desktop: '17px', tablet: '16px', mobile: '16px' },
      small: { desktop: '14px', tablet: '14px', mobile: '14px' }
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    spacing: {
      letterSpacing: '0px',
      lineHeight: '1.4'
    }
  });

  const [showPreview, setShowPreview] = useState(false);

  const systemFonts = [
    'SF Pro Display',
    'SF Pro Text',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Montserrat'
  ];

  const handleFontChange = (fontType: keyof typeof typography.fonts, value: string) => {
    setTypography(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [fontType]: value }
    }));
    onChanges();
  };

  const handleSizeChange = (element: keyof typeof typography.sizes, device: 'desktop' | 'tablet' | 'mobile', value: string) => {
    setTypography(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [element]: {
          ...prev.sizes[element],
          [device]: value
        }
      }
    }));
    onChanges();
  };

  const handleWeightChange = (weight: keyof typeof typography.weights, value: number) => {
    setTypography(prev => ({
      ...prev,
      weights: { ...prev.weights, [weight]: value }
    }));
    onChanges();
  };

  const handleSpacingChange = (type: keyof typeof typography.spacing, value: string) => {
    setTypography(prev => ({
      ...prev,
      spacing: { ...prev.spacing, [type]: value }
    }));
    onChanges();
  };

  const resetToDefault = () => {
    const defaultTypography: TypographyConfig = {
      fonts: {
        primary: 'SF Pro Display',
        secondary: 'SF Pro Text',
        monospace: 'SF Mono'
      },
      sizes: {
        h1: { desktop: '96px', tablet: '72px', mobile: '48px' },
        h2: { desktop: '56px', tablet: '42px', mobile: '32px' },
        h3: { desktop: '40px', tablet: '32px', mobile: '28px' },
        h4: { desktop: '32px', tablet: '28px', mobile: '24px' },
        body: { desktop: '17px', tablet: '16px', mobile: '16px' },
        small: { desktop: '14px', tablet: '14px', mobile: '14px' }
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      spacing: {
        letterSpacing: '0px',
        lineHeight: '1.4'
      }
    };
    
    setTypography(defaultTypography);
    onChanges();
  };

  const FontSelector = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    description: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {systemFonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          <Upload className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const SizeInput = ({ 
    element, 
    label 
  }: { 
    element: keyof typeof typography.sizes; 
    label: string;
  }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">{label}</h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desktop</label>
          <input
            type="text"
            value={typography.sizes[element].desktop}
            onChange={(e) => handleSizeChange(element, 'desktop', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="96px"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tablet</label>
          <input
            type="text"
            value={typography.sizes[element].tablet}
            onChange={(e) => handleSizeChange(element, 'tablet', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="72px"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mobile</label>
          <input
            type="text"
            value={typography.sizes[element].mobile}
            onChange={(e) => handleSizeChange(element, 'mobile', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="48px"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestionnaire de Typographie
          </h3>
          <p className="text-gray-600 mt-1">
            Configurez les polices, tailles et espacements de votre site
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Masquer' : 'Prévisualiser'}
          </button>
          
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration des polices */}
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Polices
          </h4>
          
          <div className="space-y-4">
            <FontSelector
              label="Police principale"
              value={typography.fonts.primary}
              onChange={(value) => handleFontChange('primary', value)}
              description="Utilisée pour les titres et éléments principaux"
            />
            
            <FontSelector
              label="Police secondaire"
              value={typography.fonts.secondary}
              onChange={(value) => handleFontChange('secondary', value)}
              description="Utilisée pour le corps de texte et contenu"
            />
            
            <FontSelector
              label="Police monospace"
              value={typography.fonts.monospace}
              onChange={(value) => handleFontChange('monospace', value)}
              description="Utilisée pour le code et données techniques"
            />
          </div>
        </div>

        {/* Configuration des tailles */}
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Tailles de texte
          </h4>
          
          <div className="space-y-4">
            <SizeInput element="h1" label="Titre H1" />
            <SizeInput element="h2" label="Titre H2" />
            <SizeInput element="h3" label="Titre H3" />
            <SizeInput element="h4" label="Titre H4" />
            <SizeInput element="body" label="Corps de texte" />
            <SizeInput element="small" label="Texte petit" />
          </div>
        </div>
      </div>

      {/* Configuration des poids et espacements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Poids des polices
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(typography.weights).map(([weight, value]) => (
              <div key={weight}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {weight}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleWeightChange(weight as keyof typeof typography.weights, parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  max="900"
                  step="100"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Espacements
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espacement des lettres
              </label>
              <input
                type="text"
                value={typography.spacing.letterSpacing}
                onChange={(e) => handleSpacingChange('letterSpacing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0px"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hauteur de ligne
              </label>
              <input
                type="text"
                value={typography.spacing.lineHeight}
                onChange={(e) => handleSpacingChange('lineHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prévisualisation */}
      {showPreview && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Prévisualisation de la typographie
          </h4>
          
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div style={{ 
              fontFamily: typography.fonts.primary,
              fontSize: typography.sizes.h1.desktop,
              fontWeight: typography.weights.bold,
              letterSpacing: typography.spacing.letterSpacing,
              lineHeight: typography.spacing.lineHeight
            }}>
              Titre H1 - {typography.fonts.primary}
            </div>
            
            <div style={{ 
              fontFamily: typography.fonts.primary,
              fontSize: typography.sizes.h2.desktop,
              fontWeight: typography.weights.semibold,
              letterSpacing: typography.spacing.letterSpacing,
              lineHeight: typography.spacing.lineHeight
            }}>
              Titre H2 - {typography.fonts.primary}
            </div>
            
            <div style={{ 
              fontFamily: typography.fonts.secondary,
              fontSize: typography.sizes.body.desktop,
              fontWeight: typography.weights.normal,
              letterSpacing: typography.spacing.letterSpacing,
              lineHeight: typography.spacing.lineHeight
            }}>
              Corps de texte - {typography.fonts.secondary} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            
            <div style={{ 
              fontFamily: typography.fonts.monospace,
              fontSize: typography.sizes.small.desktop,
              fontWeight: typography.weights.normal,
              letterSpacing: typography.spacing.letterSpacing,
              lineHeight: typography.spacing.lineHeight
            }}>
              Code - {typography.fonts.monospace} - const example = "Hello World";
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
