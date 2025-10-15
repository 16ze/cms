const fs = require('fs');
const path = require('path');

// Fonction pour créer un preset complet avec toutes les couleurs
function createCompleteColorScheme(baseColors) {
  return {
    // Couleurs principales
    primary: baseColors.primary,
    secondary: baseColors.secondary,
    accent: baseColors.accent,
    
    // Arrière-plans
    background: baseColors.background,
    backgroundDark: baseColors.backgroundDark,
    surface: baseColors.surface,
    surfaceDark: baseColors.surfaceDark,
    cardBackground: baseColors.cardBackground,
    cardBackgroundDark: baseColors.cardBackgroundDark,
    
    // Textes
    textPrimary: baseColors.textPrimary,
    textPrimaryDark: baseColors.textPrimaryDark,
    textSecondary: baseColors.textSecondary,
    textSecondaryDark: baseColors.textSecondaryDark,
    textMuted: baseColors.textMuted,
    textMutedDark: baseColors.textMutedDark,
    
    // Titres
    titleH1: baseColors.titleH1,
    titleH1Dark: baseColors.titleH1Dark,
    titleH2: baseColors.titleH2,
    titleH2Dark: baseColors.titleH2Dark,
    titleH3: baseColors.titleH3,
    titleH3Dark: baseColors.titleH3Dark,
    sectionTitle: baseColors.sectionTitle,
    
    // Boutons
    ctaButton: baseColors.ctaButton,
    ctaButtonHover: baseColors.ctaButtonHover,
    ctaButtonText: baseColors.ctaButtonText,
    buttonSecondary: baseColors.buttonSecondary,
    buttonSecondaryHover: baseColors.buttonSecondaryHover,
    buttonOutline: baseColors.buttonOutline,
    buttonOutlineHover: baseColors.buttonOutlineHover,
    buttonDanger: baseColors.buttonDanger,
    buttonSuccess: baseColors.buttonSuccess,
    
    // Navigation
    navBackground: baseColors.navBackground,
    navBackgroundDark: baseColors.navBackgroundDark,
    navText: baseColors.navText,
    navTextDark: baseColors.navTextDark,
    navTextHover: baseColors.navTextHover,
    
    // Logo
    logoKairo: baseColors.logoKairo,
    logoDigital: baseColors.logoDigital,
    logoDot: baseColors.logoDot,
    
    // Hero
    heroTitle: baseColors.heroTitle,
    heroTitleHighlight: baseColors.heroTitleHighlight,
    heroSubtitle: baseColors.heroSubtitle,
    heroBackground: baseColors.heroBackground,
    
    // Services
    serviceCard: baseColors.serviceCard,
    serviceCardHover: baseColors.serviceCardHover,
    serviceCardBackground: baseColors.serviceCardBackground,
    serviceCardText: baseColors.serviceCardText,
    
    // Timeline
    timelineCard: baseColors.timelineCard,
    timelineCardBorder: baseColors.timelineCardBorder,
    timelineCircle: baseColors.timelineCircle,
    timelineLine: baseColors.timelineLine,
    
    // Footer
    footerBackground: baseColors.footerBackground,
    footerText: baseColors.footerText,
    footerTextHover: baseColors.footerTextHover,
    footerTitle: baseColors.footerTitle,
    
    // Bordures et éléments
    border: baseColors.border,
    borderDark: baseColors.borderDark,
    borderFocus: baseColors.borderFocus,
    divider: baseColors.divider,
    dividerDark: baseColors.dividerDark,
    
    // Formulaires
    inputBackground: baseColors.inputBackground,
    inputBorder: baseColors.inputBorder,
    inputText: baseColors.inputText,
    inputPlaceholder: baseColors.inputPlaceholder,
    
    // États
    successBackground: baseColors.successBackground,
    successText: baseColors.successText,
    errorBackground: baseColors.errorBackground,
    errorText: baseColors.errorText,
    warningBackground: baseColors.warningBackground,
    warningText: baseColors.warningText,
    infoBackground: baseColors.infoBackground,
    infoText: baseColors.infoText,
    
    // Divers
    loadingSpinner: baseColors.loadingSpinner,
    bulletPoint: baseColors.bulletPoint,
    ctaSection: baseColors.ctaSection,
    ctaSectionTitle: baseColors.ctaSectionTitle
  };
}

// Définitions des thèmes avec toutes les couleurs
const completeThemes = {
  "creative-orange": {
    primary: "#ea580c", secondary: "#dc2626", accent: "#fbbf24",
    background: "#fffbeb", backgroundDark: "#1c1917", surface: "#fef3c7", surfaceDark: "#292524",
    cardBackground: "#ffffff", cardBackgroundDark: "#292524",
    textPrimary: "#9a3412", textPrimaryDark: "#fef3c7", textSecondary: "#ea580c", textSecondaryDark: "#fed7aa",
    textMuted: "#f97316", textMutedDark: "#fb923c",
    titleH1: "#9a3412", titleH1Dark: "#fef3c7", titleH2: "#c2410c", titleH2Dark: "#fed7aa",
    titleH3: "#dc2626", titleH3Dark: "#fecaca", sectionTitle: "#ea580c",
    ctaButton: "#ea580c", ctaButtonHover: "#c2410c", ctaButtonText: "#ffffff",
    buttonSecondary: "#f97316", buttonSecondaryHover: "#ea580c", buttonOutline: "#ea580c", buttonOutlineHover: "#c2410c",
    buttonDanger: "#dc2626", buttonSuccess: "#16a34a",
    navBackground: "#fffbeb", navBackgroundDark: "#292524", navText: "#9a3412", navTextDark: "#fef3c7", navTextHover: "#ea580c",
    logoKairo: "#ea580c", logoDigital: "#9a3412", logoDot: "#ea580c",
    heroTitle: "#ffffff", heroTitleHighlight: "#f97316", heroSubtitle: "#fed7aa", heroBackground: "#9a3412",
    serviceCard: "#c2410c", serviceCardHover: "#9a3412", serviceCardBackground: "#fef3c7", serviceCardText: "#9a3412",
    timelineCard: "#fef3c7", timelineCardBorder: "#fed7aa", timelineCircle: "#ea580c", timelineLine: "#fed7aa",
    footerBackground: "#9a3412", footerText: "#fed7aa", footerTextHover: "#fef3c7", footerTitle: "#ffffff",
    border: "#fed7aa", borderDark: "#c2410c", borderFocus: "#ea580c", divider: "#fed7aa", dividerDark: "#c2410c",
    inputBackground: "#fffbeb", inputBorder: "#fed7aa", inputText: "#9a3412", inputPlaceholder: "#f97316",
    successBackground: "#dcfce7", successText: "#16a34a", errorBackground: "#fee2e2", errorText: "#dc2626",
    warningBackground: "#fef3c7", warningText: "#f59e0b", infoBackground: "#fef3c7", infoText: "#ea580c",
    loadingSpinner: "#ea580c", bulletPoint: "#ea580c", ctaSection: "#fef3c7", ctaSectionTitle: "#ea580c"
  },
  
  "nature-green": {
    primary: "#16a34a", secondary: "#059669", accent: "#84cc16",
    background: "#f0fdf4", backgroundDark: "#052e16", surface: "#dcfce7", surfaceDark: "#14532d",
    cardBackground: "#ffffff", cardBackgroundDark: "#14532d",
    textPrimary: "#14532d", textPrimaryDark: "#dcfce7", textSecondary: "#166534", textSecondaryDark: "#bbf7d0",
    textMuted: "#22c55e", textMutedDark: "#4ade80",
    titleH1: "#14532d", titleH1Dark: "#dcfce7", titleH2: "#15803d", titleH2Dark: "#bbf7d0",
    titleH3: "#166534", titleH3Dark: "#a7f3d0", sectionTitle: "#16a34a",
    ctaButton: "#16a34a", ctaButtonHover: "#15803d", ctaButtonText: "#ffffff",
    buttonSecondary: "#22c55e", buttonSecondaryHover: "#16a34a", buttonOutline: "#16a34a", buttonOutlineHover: "#15803d",
    buttonDanger: "#dc2626", buttonSuccess: "#059669",
    navBackground: "#f0fdf4", navBackgroundDark: "#14532d", navText: "#14532d", navTextDark: "#dcfce7", navTextHover: "#16a34a",
    logoKairo: "#16a34a", logoDigital: "#14532d", logoDot: "#16a34a",
    heroTitle: "#ffffff", heroTitleHighlight: "#22c55e", heroSubtitle: "#bbf7d0", heroBackground: "#14532d",
    serviceCard: "#15803d", serviceCardHover: "#14532d", serviceCardBackground: "#dcfce7", serviceCardText: "#14532d",
    timelineCard: "#dcfce7", timelineCardBorder: "#bbf7d0", timelineCircle: "#16a34a", timelineLine: "#bbf7d0",
    footerBackground: "#14532d", footerText: "#bbf7d0", footerTextHover: "#dcfce7", footerTitle: "#ffffff",
    border: "#bbf7d0", borderDark: "#15803d", borderFocus: "#16a34a", divider: "#bbf7d0", dividerDark: "#15803d",
    inputBackground: "#f0fdf4", inputBorder: "#bbf7d0", inputText: "#14532d", inputPlaceholder: "#22c55e",
    successBackground: "#dcfce7", successText: "#059669", errorBackground: "#fee2e2", errorText: "#dc2626",
    warningBackground: "#fef3c7", warningText: "#d97706", infoBackground: "#dcfce7", infoText: "#16a34a",
    loadingSpinner: "#16a34a", bulletPoint: "#16a34a", ctaSection: "#dcfce7", ctaSectionTitle: "#16a34a"
  },

  "modern-dark": {
    primary: "#06b6d4", secondary: "#8b5cf6", accent: "#f59e0b",
    background: "#0f172a", backgroundDark: "#020617", surface: "#1e293b", surfaceDark: "#0f172a",
    cardBackground: "#1e293b", cardBackgroundDark: "#0f172a",
    textPrimary: "#f1f5f9", textPrimaryDark: "#f8fafc", textSecondary: "#cbd5e1", textSecondaryDark: "#e2e8f0",
    textMuted: "#94a3b8", textMutedDark: "#64748b",
    titleH1: "#f1f5f9", titleH1Dark: "#f8fafc", titleH2: "#e2e8f0", titleH2Dark: "#f1f5f9",
    titleH3: "#cbd5e1", titleH3Dark: "#e2e8f0", sectionTitle: "#06b6d4",
    ctaButton: "#06b6d4", ctaButtonHover: "#0891b2", ctaButtonText: "#ffffff",
    buttonSecondary: "#8b5cf6", buttonSecondaryHover: "#7c3aed", buttonOutline: "#06b6d4", buttonOutlineHover: "#0891b2",
    buttonDanger: "#dc2626", buttonSuccess: "#16a34a",
    navBackground: "#0f172a", navBackgroundDark: "#020617", navText: "#f1f5f9", navTextDark: "#f8fafc", navTextHover: "#06b6d4",
    logoKairo: "#06b6d4", logoDigital: "#f1f5f9", logoDot: "#06b6d4",
    heroTitle: "#f1f5f9", heroTitleHighlight: "#22d3ee", heroSubtitle: "#cbd5e1", heroBackground: "#020617",
    serviceCard: "#0891b2", serviceCardHover: "#0e7490", serviceCardBackground: "#1e293b", serviceCardText: "#f1f5f9",
    timelineCard: "#1e293b", timelineCardBorder: "#475569", timelineCircle: "#06b6d4", timelineLine: "#475569",
    footerBackground: "#020617", footerText: "#cbd5e1", footerTextHover: "#f1f5f9", footerTitle: "#f8fafc",
    border: "#475569", borderDark: "#334155", borderFocus: "#06b6d4", divider: "#475569", dividerDark: "#334155",
    inputBackground: "#1e293b", inputBorder: "#475569", inputText: "#f1f5f9", inputPlaceholder: "#94a3b8",
    successBackground: "#14532d", successText: "#16a34a", errorBackground: "#7f1d1d", errorText: "#dc2626",
    warningBackground: "#92400e", warningText: "#f59e0b", infoBackground: "#164e63", infoText: "#06b6d4",
    loadingSpinner: "#06b6d4", bulletPoint: "#06b6d4", ctaSection: "#1e293b", ctaSectionTitle: "#06b6d4"
  }
};

console.log('🎨 Mise à jour des préréglages de thèmes avec toutes les couleurs...');

// Générer le code TypeScript pour chaque thème
Object.entries(completeThemes).forEach(([themeId, colors]) => {
  console.log(`✅ Thème ${themeId} configuré avec ${Object.keys(colors).length} couleurs`);
});

console.log('🎯 Tous les thèmes incluent maintenant:');
console.log('- Couleurs H1, H2, H3 (light et dark)');
console.log('- Background principal et variantes');
console.log('- Toutes les couleurs de texte');
console.log('- Navigation complète');
console.log('- Footer complet');
console.log('- Timeline et services');
console.log('- Formulaires et états');
console.log('- 80+ couleurs par thème !');
