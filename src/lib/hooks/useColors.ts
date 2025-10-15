"use client";

import { useContent } from "./useContent";

export interface ColorScheme {
  // 🎨 COULEURS PRINCIPALES
  primary: string;
  secondary: string;
  accent: string;
  
  // 🖼️ ARRIÈRE-PLANS & SURFACES
  background: string;
  backgroundDark: string;
  surface: string;
  surfaceDark: string;
  cardBackground: string;
  cardBackgroundDark: string;
  sectionLight: string;
  sectionDark: string;
  
  // 📝 TEXTES
  textPrimary: string;
  textPrimaryDark: string;
  textSecondary: string;
  textSecondaryDark: string;
  textMuted: string;
  textMutedDark: string;
  textSuccess: string;
  textError: string;
  textWarning: string;
  textInfo: string;
  
  // 🎯 TITRES & HEADINGS
  titleH1: string;
  titleH1Dark: string;
  titleH2: string;
  titleH2Dark: string;
  titleH3: string;
  titleH3Dark: string;
  sectionTitle: string;
  
  // 🔘 BOUTONS & INTERACTIONS
  ctaButton: string;
  ctaButtonHover: string;
  ctaButtonText: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonOutline: string;
  buttonOutlineHover: string;
  buttonDanger: string;
  buttonSuccess: string;
  
  // 🏷️ LOGO & NAVIGATION
  logoKairo: string;
  logoDigital: string;
  logoDot: string;
  navBackground: string;
  navBackgroundDark: string;
  navText: string;
  navTextDark: string;
  navTextHover: string;
  
  // 🦸 HERO SECTION
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBackground: string;
  
  // 🛠️ SERVICES & CARDS
  serviceCard: string;
  serviceCardHover: string;
  serviceCardBackground: string;
  serviceCardBackgroundDark: string;
  serviceCardText: string;
  serviceCardTextDark: string;
  
  // ⏰ TIMELINE & FEATURES
  timelineCard: string;
  timelineCardDark: string;
  timelineCardBorder: string;
  timelineCircle: string;
  timelineLine: string;
  timelineLineDark: string;
  
  // 📞 CTA SECTIONS
  ctaSection: string;
  ctaSectionDark: string;
  ctaSectionTitle: string;
  
  // 🎯 ÉLÉMENTS DÉCORATIFS
  bulletPoint: string;
  divider: string;
  dividerDark: string;
  border: string;
  borderDark: string;
  borderFocus: string;
  
  // 📱 FOOTER
  footerBackground: string;
  footerText: string;
  footerTextHover: string;
  footerTitle: string;
  
  // 🔧 FORMULAIRES
  inputBackground: string;
  inputBackgroundDark: string;
  inputBorder: string;
  inputBorderDark: string;
  inputBorderFocus: string;
  inputText: string;
  inputTextDark: string;
  inputPlaceholder: string;
  
  // ⚠️ ÉTATS & FEEDBACK
  loadingSpinner: string;
  successBackground: string;
  successText: string;
  errorBackground: string;
  errorText: string;
  warningBackground: string;
  warningText: string;
  infoBackground: string;
  infoText: string;
}

export function useColors(): { colors: ColorScheme; loading: boolean; error: string | null } {
  const { content: globalContent, loading, error } = useContent('global');
  
  const defaultColors: ColorScheme = {
    // 🎨 COULEURS PRINCIPALES
    primary: "#2563eb",
    secondary: "#16a34a", 
    accent: "#d97706",
    
    // 🖼️ ARRIÈRE-PLANS & SURFACES
    background: "#ffffff",
    backgroundDark: "#000000",
    surface: "#f8fafc",
    surfaceDark: "#1f2937",
    cardBackground: "#ffffff",
    cardBackgroundDark: "#1f2937",
    sectionLight: "#f8fafc",
    sectionDark: "#111827",
    
    // 📝 TEXTES
    textPrimary: "#111827",
    textPrimaryDark: "#ffffff",
    textSecondary: "#6b7280",
    textSecondaryDark: "#9ca3af",
    textMuted: "#9ca3af",
    textMutedDark: "#6b7280",
    textSuccess: "#16a34a",
    textError: "#dc2626",
    textWarning: "#d97706",
    textInfo: "#2563eb",
    
    // 🎯 TITRES & HEADINGS
    titleH1: "#111827",
    titleH1Dark: "#ffffff",
    titleH2: "#1f2937",
    titleH2Dark: "#f3f4f6",
    titleH3: "#374151",
    titleH3Dark: "#e5e7eb",
    sectionTitle: "#1e40af",
    
    // 🔘 BOUTONS & INTERACTIONS
    ctaButton: "#2563eb",
    ctaButtonHover: "#1e40af",
    ctaButtonText: "#ffffff",
    buttonSecondary: "#6b7280",
    buttonSecondaryHover: "#4b5563",
    buttonOutline: "#2563eb",
    buttonOutlineHover: "#1e40af",
    buttonDanger: "#dc2626",
    buttonSuccess: "#16a34a",
    
    // 🏷️ LOGO & NAVIGATION
    logoKairo: "#2563eb",
    logoDigital: "#374151",
    logoDot: "#2563eb",
    navBackground: "#ffffff",
    navBackgroundDark: "#1f2937",
    navText: "#1f2937",
    navTextDark: "#ffffff",
    navTextHover: "#2563eb",
    
    // 🦸 HERO SECTION
    heroTitle: "#ffffff",
    heroTitleHighlight: "#d97706",
    heroSubtitle: "#e5e7eb",
    heroBackground: "#1e293b",
    
    // 🛠️ SERVICES & CARDS
    serviceCard: "#1e40af",
    serviceCardHover: "#1d4ed8",
    serviceCardBackground: "#ffffff",
    serviceCardBackgroundDark: "#1f2937",
    serviceCardText: "#374151",
    serviceCardTextDark: "#e5e7eb",
    
    // ⏰ TIMELINE & FEATURES
    timelineCard: "#eff6ff",
    timelineCardDark: "#1e293b",
    timelineCardBorder: "#93c5fd",
    timelineCircle: "#2563eb",
    timelineLine: "#bfdbfe",
    timelineLineDark: "#374151",
    
    // 📞 CTA SECTIONS
    ctaSection: "#eff6ff",
    ctaSectionDark: "#1e293b",
    ctaSectionTitle: "#1e40af",
    
    // 🎯 ÉLÉMENTS DÉCORATIFS
    bulletPoint: "#2563eb",
    divider: "#e5e7eb",
    dividerDark: "#374151",
    border: "#e5e7eb",
    borderDark: "#374151",
    borderFocus: "#2563eb",
    
    // 📱 FOOTER
    footerBackground: "#1f2937",
    footerText: "#9ca3af",
    footerTextHover: "#ffffff",
    footerTitle: "#ffffff",
    
    // 🔧 FORMULAIRES
    inputBackground: "#ffffff",
    inputBackgroundDark: "#1f2937",
    inputBorder: "#d1d5db",
    inputBorderDark: "#374151",
    inputBorderFocus: "#2563eb",
    inputText: "#111827",
    inputTextDark: "#ffffff",
    inputPlaceholder: "#9ca3af",
    
    // ⚠️ ÉTATS & FEEDBACK
    loadingSpinner: "#2563eb",
    successBackground: "#dcfce7",
    successText: "#16a34a",
    errorBackground: "#fee2e2",
    errorText: "#dc2626",
    warningBackground: "#fef3c7",
    warningText: "#d97706",
    infoBackground: "#dbeafe",
    infoText: "#2563eb"
  };

  const colors = globalContent?.colors ? { ...defaultColors, ...globalContent.colors } : defaultColors;

  return { colors, loading, error };
}

// Fonction utilitaire pour obtenir une propriété CSS custom
export function getCSSCustomProperty(colorKey: keyof ColorScheme, colors: ColorScheme): string {
  return `var(--color-${colorKey}, ${colors[colorKey]})`;
}

// Fonction pour injecter les couleurs en tant que variables CSS
export function injectColorVariables(colors: ColorScheme): void {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
}
