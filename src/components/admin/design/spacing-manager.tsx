"use client";

import { useState } from "react";
import { Ruler, RefreshCw } from "lucide-react";

interface SpacingManagerProps {
  onChanges: () => void;
}

interface SpacingConfig {
  base: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  containers: {
    maxWidth: string;
    padding: string;
    paddingMobile: string;
  };
  sections: {
    paddingVertical: string;
    paddingVerticalMobile: string;
    gapBetween: string;
  };
}

export default function SpacingManager({ onChanges }: SpacingManagerProps) {
  const [spacing, setSpacing] = useState<SpacingConfig>({
    base: '8px',
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    xxl: '64px',
    containers: {
      maxWidth: '1440px',
      padding: '22px',
      paddingMobile: '16px'
    },
    sections: {
      paddingVertical: '110px',
      paddingVerticalMobile: '60px',
      gapBetween: '0px'
    }
  });

  const handleSpacingChange = (key: string, value: string) => {
    const newSpacing = { ...spacing };
    
    if (key.includes('.')) {
      const [group, subKey] = key.split('.');
      newSpacing[group as keyof SpacingConfig][subKey as keyof typeof newSpacing[typeof group]] = value;
    } else {
      newSpacing[key as keyof SpacingConfig] = value;
    }
    
    setSpacing(newSpacing);
    onChanges();
  };

  const resetToDefault = () => {
    const defaultSpacing: SpacingConfig = {
      base: '8px',
      xs: '8px',
      sm: '16px',
      md: '24px',
      lg: '32px',
      xl: '48px',
      xxl: '64px',
      containers: {
        maxWidth: '1440px',
        padding: '22px',
        paddingMobile: '16px'
      },
      sections: {
        paddingVertical: '110px',
        paddingVerticalMobile: '60px',
        gapBetween: '0px'
      }
    };
    
    setSpacing(defaultSpacing);
    onChanges();
  };

  const SpacingInput = ({ 
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
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="8px"
      />
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestionnaire d'Espacements
          </h3>
          <p className="text-gray-600 mt-1">
            Configurez les marges, paddings et espacements de votre site
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Espacements de base */}
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Espacements de base
          </h4>
          
          <div className="space-y-4">
            <SpacingInput
              label="Base (multiplicateur)"
              value={spacing.base}
              onChange={(value) => handleSpacingChange('base', value)}
              description="Espacement de base utilisé comme multiplicateur"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <SpacingInput
                label="XS"
                value={spacing.xs}
                onChange={(value) => handleSpacingChange('xs', value)}
                description="Très petit espacement"
              />
              
              <SpacingInput
                label="SM"
                value={spacing.sm}
                onChange={(value) => handleSpacingChange('sm', value)}
                description="Petit espacement"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <SpacingInput
                label="MD"
                value={spacing.md}
                onChange={(value) => handleSpacingChange('md', value)}
                description="Espacement moyen"
              />
              
              <SpacingInput
                label="LG"
                value={spacing.lg}
                onChange={(value) => handleSpacingChange('lg', value)}
                description="Grand espacement"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <SpacingInput
                label="XL"
                value={spacing.xl}
                onChange={(value) => handleSpacingChange('xl', value)}
                description="Très grand espacement"
              />
              
              <SpacingInput
                label="XXL"
                value={spacing.xxl}
                onChange={(value) => handleSpacingChange('xxl', value)}
                description="Espacement maximum"
              />
            </div>
          </div>
        </div>

        {/* Configuration des conteneurs */}
        <div className="space-y-6">
          <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
            Conteneurs
          </h4>
          
          <div className="space-y-4">
            <SpacingInput
              label="Largeur maximale"
              value={spacing.containers.maxWidth}
              onChange={(value) => handleSpacingChange('containers.maxWidth', value)}
              description="Largeur maximale des conteneurs principaux"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <SpacingInput
                label="Padding (Desktop)"
                value={spacing.containers.padding}
                onChange={(value) => handleSpacingChange('containers.padding', value)}
                description="Padding horizontal des conteneurs"
              />
              
              <SpacingInput
                label="Padding (Mobile)"
                value={spacing.containers.paddingMobile}
                onChange={(value) => handleSpacingChange('containers.paddingMobile', value)}
                description="Padding horizontal sur mobile"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration des sections */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Sections
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpacingInput
            label="Padding vertical (Desktop)"
            value={spacing.sections.paddingVertical}
            onChange={(value) => handleSpacingChange('sections.paddingVertical', value)}
            description="Espacement vertical des sections"
          />
          
          <SpacingInput
            label="Padding vertical (Mobile)"
            value={spacing.sections.paddingVerticalMobile}
            onChange={(value) => handleSpacingChange('sections.paddingVerticalMobile', value)}
            description="Espacement vertical sur mobile"
          />
          
          <SpacingInput
            label="Gap entre sections"
            value={spacing.sections.gapBetween}
            onChange={(value) => handleSpacingChange('sections.gapBetween', value)}
            description="Espacement entre les sections"
          />
        </div>
      </div>

      {/* Prévisualisation des espacements */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Prévisualisation des espacements
        </h4>
        
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 w-16">XS:</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-500">{spacing.xs}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 w-16">SM:</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-500">{spacing.sm}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 w-16">MD:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-500">{spacing.md}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 w-16">LG:</div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-500">{spacing.lg}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 w-16">XL:</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-500">{spacing.xl}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
