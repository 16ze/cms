import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/design/generate-css - Générer le CSS avec les variables de design
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSectionStyles = searchParams.get('includeSectionStyles') === 'true';
    const sectionId = searchParams.get('sectionId');

    // Récupérer les paramètres de design globaux
    const globalSettings = await prisma.designGlobalSettings.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { property: 'asc' }
      ]
    });

    // Organiser les paramètres par catégorie
    const organizedSettings = globalSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.property] = {
        value: setting.value,
        deviceType: setting.deviceType
      };
      return acc;
    }, {} as Record<string, Record<string, { value: string; deviceType: string }>>);

    // Générer le CSS de base
    let css = generateBaseCSS(organizedSettings);

    // Ajouter les styles de section si demandé
    if (includeSectionStyles && sectionId) {
      const sectionStyles = await prisma.designSectionStyles.findUnique({
        where: { contentSectionId: sectionId }
      });

      if (sectionStyles) {
        css += generateSectionCSS(sectionId, sectionStyles.styleConfigJson);
      }
    }

    // Ajouter les styles de thème actif
    const activeTheme = await prisma.designTheme.findFirst({
      where: { isActive: true }
    });

    if (activeTheme) {
      css += generateThemeCSS(activeTheme.configJson);
    }

    // Ajouter les media queries pour le responsive
    css += generateResponsiveCSS(organizedSettings);

    return new NextResponse(css, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error("❌ Erreur lors de la génération du CSS:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du CSS" },
      { status: 500 }
    );
  }
}

// POST /api/admin/design/generate-css - Générer et sauvegarder le CSS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, sectionStyles, themeConfig } = body;

    let css = '';

    // Générer le CSS de base
    if (settings) {
      css += generateBaseCSS(settings);
    }

    // Ajouter les styles de section
    if (sectionStyles) {
      Object.entries(sectionStyles).forEach(([sectionId, styles]) => {
        css += generateSectionCSS(sectionId, styles);
      });
    }

    // Ajouter les styles de thème
    if (themeConfig) {
      css += generateThemeCSS(themeConfig);
    }

    // Ajouter les media queries
    if (settings) {
      css += generateResponsiveCSS(settings);
    }

    // TODO: Sauvegarder le CSS généré dans un fichier ou en base
    // Pour l'instant, on retourne juste le CSS généré

    return NextResponse.json({
      success: true,
      data: { css },
      message: "CSS généré avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la génération du CSS:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du CSS" },
      { status: 500 }
    );
  }
}

// Fonction pour générer le CSS de base avec les variables
function generateBaseCSS(settings: Record<string, Record<string, { value: string; deviceType: string }>>): string {
  let css = ':root {\n';

  // Variables de couleurs
  if (settings.colors) {
    Object.entries(settings.colors).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `  --color-${property}: ${config.value};\n`;
      }
    });
  }

  // Variables de typographie
  if (settings.typography) {
    Object.entries(settings.typography).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `  --font-${property}: ${config.value};\n`;
      }
    });
  }

  // Variables d'espacements
  if (settings.spacing) {
    Object.entries(settings.spacing).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `  --spacing-${property}: ${config.value};\n`;
      }
    });
  }

  // Variables de layout
  if (settings.layout) {
    Object.entries(settings.layout).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `  --layout-${property}: ${config.value};\n`;
      }
    });
  }

  css += '}\n\n';

  // Classes utilitaires de base
  css += generateUtilityClasses(settings);

  return css;
}

// Fonction pour générer les styles de section
function generateSectionCSS(sectionId: string, styles: any): string {
  let css = `/* Styles pour la section ${sectionId} */\n`;
  
  if (styles.colors) {
    css += `[data-section-id="${sectionId}"] {\n`;
    Object.entries(styles.colors).forEach(([property, value]) => {
      css += `  --section-color-${property}: ${value};\n`;
    });
    css += '}\n\n';
  }

  if (styles.background) {
    css += `[data-section-id="${sectionId}"] {\n`;
    if (styles.background.type === 'image') {
      css += `  background-image: url(${styles.background.value});\n`;
      css += `  background-position: ${styles.background.position || 'center'};\n`;
      css += `  background-size: ${styles.background.size || 'cover'};\n`;
    } else if (styles.background.type === 'color') {
      css += `  background-color: ${styles.background.value};\n`;
    } else if (styles.background.type === 'gradient') {
      css += `  background: ${styles.background.value};\n`;
    }
    
    if (styles.background.overlay && styles.background.overlay.opacity > 0) {
      css += `  position: relative;\n`;
      css += `}\n\n`;
      css += `[data-section-id="${sectionId}"]::before {\n`;
      css += `  content: '';\n`;
      css += `  position: absolute;\n`;
      css += `  inset: 0;\n`;
      css += `  background-color: ${styles.background.overlay.color};\n`;
      css += `  opacity: ${styles.background.overlay.opacity};\n`;
      css += `  z-index: 1;\n`;
    }
    css += '}\n\n';
  }

  return css;
}

// Fonction pour générer les styles de thème
function generateThemeCSS(themeConfig: any): string {
  let css = '/* Styles du thème */\n';
  
  if (themeConfig.colors) {
    css += ':root {\n';
    Object.entries(themeConfig.colors).forEach(([property, value]) => {
      css += `  --theme-color-${property}: ${value};\n`;
    });
    css += '}\n\n';
  }

  if (themeConfig.typography) {
    css += 'body {\n';
    if (themeConfig.typography.primaryFont) {
      css += `  font-family: ${themeConfig.typography.primaryFont}, system-ui, sans-serif;\n`;
    }
    css += '}\n\n';
  }

  return css;
}

// Fonction pour générer les media queries responsive
function generateResponsiveCSS(settings: Record<string, Record<string, { value: string; deviceType: string }>>): string {
  let css = '';

  // Media query pour tablet
  const tabletSettings = Object.entries(settings).filter(([category, props]) =>
    Object.values(props).some(prop => prop.deviceType === 'tablet')
  );

  if (tabletSettings.length > 0) {
    css += '@media (max-width: 1023px) {\n';
    css += '  :root {\n';
    tabletSettings.forEach(([category, props]) => {
      Object.entries(props).forEach(([property, config]) => {
        if (config.deviceType === 'tablet') {
          css += `    --${category}-${property}: ${config.value};\n`;
        }
      });
    });
    css += '  }\n';
    css += '}\n\n';
  }

  // Media query pour mobile
  const mobileSettings = Object.entries(settings).filter(([category, props]) =>
    Object.values(props).some(prop => prop.deviceType === 'mobile')
  );

  if (mobileSettings.length > 0) {
    css += '@media (max-width: 767px) {\n';
    css += '  :root {\n';
    mobileSettings.forEach(([category, props]) => {
      Object.entries(props).forEach(([property, config]) => {
        if (config.deviceType === 'mobile') {
          css += `    --${category}-${property}: ${config.value};\n`;
        }
      });
    });
    css += '  }\n';
    css += '}\n\n';
  }

  return css;
}

// Fonction pour générer les classes utilitaires
function generateUtilityClasses(settings: Record<string, Record<string, { value: string; deviceType: string }>>): string {
  let css = '/* Classes utilitaires */\n';

  // Classes de couleurs
  if (settings.colors) {
    Object.entries(settings.colors).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `.text-${property} { color: var(--color-${property}); }\n`;
        css += `.bg-${property} { background-color: var(--color-${property}); }\n`;
        css += `.border-${property} { border-color: var(--color-${property}); }\n`;
      }
    });
  }

  // Classes de typographie
  if (settings.typography) {
    if (settings.typography.primaryFont) {
      css += '.font-primary { font-family: var(--font-primaryFont); }\n';
    }
    if (settings.typography.secondaryFont) {
      css += '.font-secondary { font-family: var(--font-secondaryFont); }\n';
    }
  }

  // Classes d'espacements
  if (settings.spacing) {
    Object.entries(settings.spacing).forEach(([property, config]) => {
      if (config.deviceType === 'all') {
        css += `.p-${property} { padding: var(--spacing-${property}); }\n`;
        css += `.m-${property} { margin: var(--spacing-${property}); }\n`;
      }
    });
  }

  css += '\n';
  return css;
}
