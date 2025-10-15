"use client";

import { useEffect } from "react";
import contentData from "@/config/content.json";

/**
 * Composant qui injecte les styles dynamiques depuis content.json
 * Permet de modifier les couleurs, polices et effets via JSON avec hot reload
 */
export default function DynamicStyleInjector() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const design = contentData.design;
    if (!design) return;

    // Créer ou obtenir la balise style
    let styleTag = document.getElementById("dynamic-design-vars");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-design-vars";
      document.head.appendChild(styleTag);
    }

    // Générer les CSS variables depuis le JSON
    const cssVars = `
      :root {
        /* Couleurs principales */
        --color-primary: ${design.colors.primary};
        --color-primary-hover: ${design.colors.primaryHover};
        --color-secondary: ${design.colors.secondary};
        --color-secondary-hover: ${design.colors.secondaryHover};
        --color-accent: ${design.colors.accent};
        --color-accent-hover: ${design.colors.accentHover};
        
        /* Couleurs de texte */
        --color-text-primary: ${design.colors.text.primary};
        --color-text-secondary: ${design.colors.text.secondary};
        --color-text-tertiary: ${design.colors.text.tertiary};
        --color-text-light: ${design.colors.text.light};
        
        /* Couleurs de fond */
        --color-bg-primary: ${design.colors.background.primary};
        --color-bg-secondary: ${design.colors.background.secondary};
        --color-bg-dark: ${design.colors.background.dark};
        --color-bg-gradient: ${design.colors.background.gradient};
        
        /* Couleurs de bordure */
        --color-border-light: ${design.colors.border.light};
        --color-border-medium: ${design.colors.border.medium};
        --color-border-dark: ${design.colors.border.dark};
        
        /* Couleurs de statut */
        --color-success: ${design.colors.status.success};
        --color-warning: ${design.colors.status.warning};
        --color-error: ${design.colors.status.error};
        --color-info: ${design.colors.status.info};
        
        /* Typographie */
        --font-heading: ${design.typography.fontFamily.heading};
        --font-body: ${design.typography.fontFamily.body};
        --font-mono: ${design.typography.fontFamily.mono};
        
        /* Tailles de police */
        --text-xs: ${design.typography.fontSize.xs};
        --text-sm: ${design.typography.fontSize.sm};
        --text-base: ${design.typography.fontSize.base};
        --text-lg: ${design.typography.fontSize.lg};
        --text-xl: ${design.typography.fontSize.xl};
        --text-2xl: ${design.typography.fontSize["2xl"]};
        --text-3xl: ${design.typography.fontSize["3xl"]};
        --text-4xl: ${design.typography.fontSize["4xl"]};
        --text-5xl: ${design.typography.fontSize["5xl"]};
        
        /* Poids de police */
        --font-light: ${design.typography.fontWeight.light};
        --font-normal: ${design.typography.fontWeight.normal};
        --font-medium: ${design.typography.fontWeight.medium};
        --font-semibold: ${design.typography.fontWeight.semibold};
        --font-bold: ${design.typography.fontWeight.bold};
        --font-black: ${design.typography.fontWeight.black};
        
        /* Hauteur de ligne */
        --leading-tight: ${design.typography.lineHeight.tight};
        --leading-normal: ${design.typography.lineHeight.normal};
        --leading-relaxed: ${design.typography.lineHeight.relaxed};
        
        /* Espacement */
        --spacing-section: ${design.spacing.section};
        --spacing-section-mobile: ${design.spacing.sectionMobile};
        --spacing-container: ${design.spacing.container};
        --spacing-container-mobile: ${design.spacing.containerMobile};
        --spacing-card: ${design.spacing.card};
        --spacing-card-mobile: ${design.spacing.cardMobile};
        
        /* Effets - Border Radius */
        --radius-sm: ${design.effects.borderRadius.sm};
        --radius-md: ${design.effects.borderRadius.md};
        --radius-lg: ${design.effects.borderRadius.lg};
        --radius-xl: ${design.effects.borderRadius.xl};
        --radius-2xl: ${design.effects.borderRadius["2xl"]};
        --radius-full: ${design.effects.borderRadius.full};
        
        /* Effets - Shadows */
        --shadow-sm: ${design.effects.shadow.sm};
        --shadow-base: ${design.effects.shadow.base};
        --shadow-md: ${design.effects.shadow.md};
        --shadow-lg: ${design.effects.shadow.lg};
        --shadow-xl: ${design.effects.shadow.xl};
        
        /* Effets - Blur */
        --blur-sm: ${design.effects.blur.sm};
        --blur-base: ${design.effects.blur.base};
        --blur-md: ${design.effects.blur.md};
        --blur-lg: ${design.effects.blur.lg};
        --blur-xl: ${design.effects.blur.xl};
        
        /* Effets - Transitions */
        --transition-fast: ${design.effects.transition.fast};
        --transition-base: ${design.effects.transition.base};
        --transition-slow: ${design.effects.transition.slow};
        --transition-slower: ${design.effects.transition.slower};
      }
      
      /* Classes utilitaires pour utiliser les variables */
      .bg-primary { background-color: var(--color-primary); }
      .bg-secondary { background-color: var(--color-secondary); }
      .bg-accent { background-color: var(--color-accent); }
      
      .text-primary { color: var(--color-text-primary); }
      .text-secondary { color: var(--color-text-secondary); }
      
      .border-color-light { border-color: var(--color-border-light); }
      
      .hover\\:bg-primary-hover:hover { background-color: var(--color-primary-hover); }
      .hover\\:bg-secondary-hover:hover { background-color: var(--color-secondary-hover); }
      
      .font-heading { font-family: var(--font-heading); }
      .font-body { font-family: var(--font-body); }
      
      .shadow-custom-sm { box-shadow: var(--shadow-sm); }
      .shadow-custom-md { box-shadow: var(--shadow-md); }
      .shadow-custom-lg { box-shadow: var(--shadow-lg); }
      
      .rounded-custom-lg { border-radius: var(--radius-lg); }
      .rounded-custom-xl { border-radius: var(--radius-xl); }
      
      .transition-custom { transition: all var(--transition-base) ease-in-out; }
      .transition-fast { transition: all var(--transition-fast) ease-in-out; }
    `;

    styleTag.textContent = cssVars;

    // Log pour debug (en développement uniquement)
    if (process.env.NODE_ENV === "development") {
      console.log("🎨 Styles dynamiques injectés depuis content.json");
    }

    // Cleanup
    return () => {
      // Ne pas retirer le style tag pour éviter les flickers
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
