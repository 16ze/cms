const fs = require('fs');
const path = require('path');

// Lire le fichier theme-presets.tsx
const filePath = path.join(__dirname, '../src/components/admin/theme-presets.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remplacer "minimal-gray" complet
const minimalGrayComplete = `  {
    id: "minimal-gray",
    name: "Minimaliste Gris",
    description: "Clean et épuré",
    icon: <Palette className="w-5 h-5" />,
    category: "modern",
    colors: {
      // Couleurs principales
      primary: "#374151", secondary: "#6b7280", accent: "#f59e0b",
      
      // Arrière-plans
      background: "#ffffff", backgroundDark: "#111827", surface: "#f9fafb", surfaceDark: "#1f2937",
      cardBackground: "#ffffff", cardBackgroundDark: "#1f2937",
      
      // Textes
      textPrimary: "#1f2937", textPrimaryDark: "#f9fafb", textSecondary: "#4b5563", textSecondaryDark: "#d1d5db",
      textMuted: "#6b7280", textMutedDark: "#9ca3af",
      
      // Titres
      titleH1: "#1f2937", titleH1Dark: "#f9fafb", titleH2: "#374151", titleH2Dark: "#e5e7eb",
      titleH3: "#4b5563", titleH3Dark: "#d1d5db", sectionTitle: "#374151",
      
      // Boutons
      ctaButton: "#374151", ctaButtonHover: "#1f2937", ctaButtonText: "#ffffff",
      buttonSecondary: "#6b7280", buttonSecondaryHover: "#4b5563", buttonOutline: "#374151", buttonOutlineHover: "#1f2937",
      buttonDanger: "#dc2626", buttonSuccess: "#16a34a",
      
      // Navigation
      navBackground: "#ffffff", navBackgroundDark: "#1f2937", navText: "#1f2937", navTextDark: "#f9fafb", navTextHover: "#374151",
      
      // Logo
      logoKairo: "#374151", logoDigital: "#1f2937", logoDot: "#374151",
      
      // Hero
      heroTitle: "#ffffff", heroTitleHighlight: "#6b7280", heroSubtitle: "#d1d5db", heroBackground: "#1f2937",
      
      // Services
      serviceCard: "#4b5563", serviceCardHover: "#374151", serviceCardBackground: "#f9fafb", serviceCardText: "#1f2937",
      
      // Timeline
      timelineCard: "#f9fafb", timelineCardBorder: "#e5e7eb", timelineCircle: "#374151", timelineLine: "#e5e7eb",
      
      // Footer
      footerBackground: "#1f2937", footerText: "#d1d5db", footerTextHover: "#f9fafb", footerTitle: "#ffffff",
      
      // Bordures et éléments
      border: "#e5e7eb", borderDark: "#374151", borderFocus: "#374151", divider: "#e5e7eb", dividerDark: "#374151",
      
      // Formulaires
      inputBackground: "#ffffff", inputBorder: "#d1d5db", inputText: "#1f2937", inputPlaceholder: "#6b7280",
      
      // États
      successBackground: "#dcfce7", successText: "#16a34a", errorBackground: "#fee2e2", errorText: "#dc2626",
      warningBackground: "#fef3c7", warningText: "#f59e0b", infoBackground: "#f0f9ff", infoText: "#374151",
      
      // Divers
      loadingSpinner: "#374151", bulletPoint: "#374151", ctaSection: "#f9fafb", ctaSectionTitle: "#374151"
    }
  },`;

// Ajouter "ocean-blue" complet
const oceanBlueComplete = `  {
    id: "ocean-blue",
    name: "Océan Bleu",
    description: "Inspiré par l'océan",
    icon: <Waves className="w-5 h-5" />,
    category: "nature",
    colors: {
      // Couleurs principales
      primary: "#0ea5e9", secondary: "#06b6d4", accent: "#22d3ee",
      
      // Arrière-plans
      background: "#f0f9ff", backgroundDark: "#0c4a6e", surface: "#e0f2fe", surfaceDark: "#0e7490",
      cardBackground: "#ffffff", cardBackgroundDark: "#0e7490",
      
      // Textes
      textPrimary: "#0c4a6e", textPrimaryDark: "#e0f2fe", textSecondary: "#0369a1", textSecondaryDark: "#bae6fd",
      textMuted: "#0ea5e9", textMutedDark: "#38bdf8",
      
      // Titres
      titleH1: "#0c4a6e", titleH1Dark: "#e0f2fe", titleH2: "#0369a1", titleH2Dark: "#bae6fd",
      titleH3: "#0284c7", titleH3Dark: "#7dd3fc", sectionTitle: "#0ea5e9",
      
      // Boutons
      ctaButton: "#0ea5e9", ctaButtonHover: "#0284c7", ctaButtonText: "#ffffff",
      buttonSecondary: "#06b6d4", buttonSecondaryHover: "#0ea5e9", buttonOutline: "#0ea5e9", buttonOutlineHover: "#0284c7",
      buttonDanger: "#dc2626", buttonSuccess: "#16a34a",
      
      // Navigation
      navBackground: "#f0f9ff", navBackgroundDark: "#0e7490", navText: "#0c4a6e", navTextDark: "#e0f2fe", navTextHover: "#0ea5e9",
      
      // Logo
      logoKairo: "#0ea5e9", logoDigital: "#0c4a6e", logoDot: "#0ea5e9",
      
      // Hero
      heroTitle: "#ffffff", heroTitleHighlight: "#22d3ee", heroSubtitle: "#bae6fd", heroBackground: "#0c4a6e",
      
      // Services
      serviceCard: "#0284c7", serviceCardHover: "#0c4a6e", serviceCardBackground: "#e0f2fe", serviceCardText: "#0c4a6e",
      
      // Timeline
      timelineCard: "#e0f2fe", timelineCardBorder: "#bae6fd", timelineCircle: "#0ea5e9", timelineLine: "#bae6fd",
      
      // Footer
      footerBackground: "#0c4a6e", footerText: "#bae6fd", footerTextHover: "#e0f2fe", footerTitle: "#ffffff",
      
      // Bordures et éléments
      border: "#bae6fd", borderDark: "#0284c7", borderFocus: "#0ea5e9", divider: "#bae6fd", dividerDark: "#0284c7",
      
      // Formulaires
      inputBackground: "#f0f9ff", inputBorder: "#bae6fd", inputText: "#0c4a6e", inputPlaceholder: "#0ea5e9",
      
      // États
      successBackground: "#dcfce7", successText: "#16a34a", errorBackground: "#fee2e2", errorText: "#dc2626",
      warningBackground: "#fef3c7", warningText: "#f59e0b", infoBackground: "#e0f2fe", infoText: "#0ea5e9",
      
      // Divers
      loadingSpinner: "#0ea5e9", bulletPoint: "#0ea5e9", ctaSection: "#e0f2fe", ctaSectionTitle: "#0ea5e9"
    }
  }`;

// Regex pour remplacer minimal-gray
const minimalGrayRegex = /\{\s*id:\s*"minimal-gray"[\s\S]*?\}\s*\}\s*,/;
content = content.replace(minimalGrayRegex, minimalGrayComplete);

// Regex pour remplacer ocean-blue OU l'ajouter s'il n'existe pas
const oceanBlueRegex = /\{\s*id:\s*"ocean-blue"[\s\S]*?\}\s*\}\s*,?/;
if (content.match(oceanBlueRegex)) {
  content = content.replace(oceanBlueRegex, oceanBlueComplete);
} else {
  // Ajouter ocean-blue à la fin du tableau
  content = content.replace(/];$/, `${oceanBlueComplete}\n];`);
}

// Écrire le fichier mis à jour
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Préréglages "minimal-gray" et "ocean-blue" mis à jour avec toutes les couleurs !');
console.log('🎨 Chaque thème inclut maintenant 60+ couleurs complètes:');
console.log('   - titleH2, titleH3, sectionTitle');
console.log('   - background, surface, cardBackground');
console.log('   - Toutes les variantes de texte');
console.log('   - Navigation complète');
console.log('   - Footer complet');
console.log('   - Timeline et services');
console.log('   - Formulaires et états');
console.log('🚀 Tous les préréglages sont maintenant complets !');
