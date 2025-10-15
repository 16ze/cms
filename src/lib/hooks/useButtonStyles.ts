"use client";

import { useState, useEffect } from 'react';

export interface ButtonStyle {
  name: string;
  displayName: string;
  isDefault: boolean;
  config: {
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

export function useButtonStyles() {
  const [buttonStyles, setButtonStyles] = useState<ButtonStyle[]>([]);
  const [defaultStyle, setDefaultStyle] = useState<ButtonStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchButtonStyles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/public/content');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.buttonStyles && Array.isArray(data.buttonStyles)) {
          setButtonStyles(data.buttonStyles);
          
          // Trouver le style par défaut
          const defaultStyle = data.buttonStyles.find((style: ButtonStyle) => style.isDefault);
          setDefaultStyle(defaultStyle || data.buttonStyles[0]);
        } else {
          // Styles par défaut si aucun style n'est trouvé
          const fallbackStyles: ButtonStyle[] = [
            {
              name: 'primary',
              displayName: 'Principal',
              isDefault: true,
              config: {
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                borderColor: '#3B82F6',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderWidth: '2px',
                borderStyle: 'solid',
                hover: {
                  backgroundColor: '#2563EB',
                  borderColor: '#2563EB',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                },
                active: {
                  backgroundColor: '#1D4ED8',
                  borderColor: '#1D4ED8',
                  transform: 'translateY(0)'
                }
              }
            }
          ];
          setButtonStyles(fallbackStyles);
          setDefaultStyle(fallbackStyles[0]);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des styles de boutons:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchButtonStyles();
  }, []);

  // Fonction pour obtenir un style par nom
  const getStyleByName = (name: string): ButtonStyle | null => {
    return buttonStyles.find(style => style.name === name) || defaultStyle;
  };

  // Fonction pour générer le CSS d'un style
  const generateStyleCSS = (style: ButtonStyle, className: string = 'custom-button'): string => {
    const config = style.config;
    return `
      .${className} {
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
        outline: none;
      }
      .${className}:hover {
        background-color: ${config.hover.backgroundColor};
        border-color: ${config.hover.borderColor};
        transform: ${config.hover.transform};
        box-shadow: ${config.hover.boxShadow};
      }
      .${className}:active {
        background-color: ${config.active.backgroundColor};
        border-color: ${config.active.borderColor};
        transform: ${config.active.transform};
      }
      .${className}:focus {
        outline: 2px solid ${config.borderColor};
        outline-offset: 2px;
      }
    `;
  };

  // Fonction pour appliquer un style à un élément
  const applyStyleToElement = (element: HTMLElement, style: ButtonStyle) => {
    const config = style.config;
    
    element.style.backgroundColor = config.backgroundColor;
    element.style.color = config.color;
    element.style.border = `${config.borderWidth} ${config.borderStyle} ${config.borderColor}`;
    element.style.borderRadius = config.borderRadius;
    element.style.padding = config.padding;
    element.style.fontSize = config.fontSize;
    element.style.fontWeight = config.fontWeight;
    element.style.transition = 'all 0.2s ease';
    element.style.cursor = 'pointer';
  };

  return {
    buttonStyles,
    defaultStyle,
    loading,
    error,
    getStyleByName,
    generateStyleCSS,
    applyStyleToElement
  };
}
