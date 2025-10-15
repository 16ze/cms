import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de prévisualisation
    const preview = searchParams.get("preview");
    const contentParam = searchParams.get("content");
    const typographyParam = searchParams.get("typography");
    const buttonStylesParam = searchParams.get("buttonStyles");
    
    if (!preview || !contentParam) {
      return new NextResponse("Paramètres de prévisualisation manquants", { status: 400 });
    }

    // Parser le contenu JSON
    let content: any;
    let typographySettings: any;
    let buttonStyles: any[];

    try {
      content = JSON.parse(contentParam);
      if (typographyParam) {
        typographySettings = JSON.parse(typographyParam);
      }
      if (buttonStylesParam) {
        buttonStyles = JSON.parse(buttonStylesParam);
      }
    } catch (error) {
      return new NextResponse("Contenu JSON invalide", { status: 400 });
    }

    // Générer le HTML de prévisualisation
    const previewHTML = generatePreviewHTML(content, typographySettings, buttonStyles);
    
    return new NextResponse(previewHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

  } catch (error) {
    console.error("Erreur lors de la génération de la prévisualisation:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

function generatePreviewHTML(content: any, typographySettings?: any, buttonStyles?: any[]): string {
  // Générer les variables CSS personnalisées
  const customCSS = generateCustomCSS(typographySettings, buttonStyles);
  
  // Générer le contenu HTML basé sur le contenu modifié
  const contentHTML = generateContentHTML(content);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prévisualisation - KAIRO Digital</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Source+Sans+Pro:wght@300;400;600;700;900&family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* CSS personnalisé pour la prévisualisation */
        ${customCSS}
        
        /* Styles de base pour la prévisualisation */
        .preview-container {
            font-family: var(--font-family, 'Inter', system-ui, sans-serif);
            line-height: var(--line-height-normal, 1.5);
        }
        
        .preview-container h1 {
            font-size: var(--font-size-h1, 3rem);
            font-weight: var(--font-weight-bold, 700);
            line-height: var(--line-height-tight, 1.2);
            letter-spacing: var(--letter-spacing-tight, -0.025em);
        }
        
        .preview-container h2 {
            font-size: var(--font-size-h2, 2.25rem);
            font-weight: var(--font-weight-semibold, 600);
            line-height: var(--line-height-normal, 1.5);
            letter-spacing: var(--letter-spacing-normal, 0em);
        }
        
        .preview-container h3 {
            font-size: var(--font-size-h3, 1.875rem);
            font-weight: var(--font-weight-semibold, 600);
            line-height: var(--line-height-normal, 1.5);
        }
        
        .preview-container p {
            font-size: var(--font-size-base, 1rem);
            font-weight: var(--font-weight-normal, 400);
            line-height: var(--line-height-relaxed, 1.8);
        }
        
        .preview-container .btn {
            display: inline-block;
            padding: var(--btn-padding-y, 0.75rem) var(--btn-padding-x, 1.5rem);
            border-radius: var(--btn-border-radius, 0.5rem);
            font-size: var(--btn-font-size, 1rem);
            font-weight: var(--btn-font-weight, 500);
            text-decoration: none;
            transition: all var(--btn-transition-duration, 200ms) ease;
            cursor: pointer;
            border: 1px solid transparent;
        }
        
        .preview-container .btn:hover {
            transform: var(--btn-hover-transform, scale(1.05));
        }
        
        /* Indicateur de prévisualisation */
        .preview-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .preview-banner::before {
            content: "👁️ MODE PRÉVISUALISATION - Les modifications ne sont pas encore sauvegardées";
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .preview-container h1 {
                font-size: var(--font-size-h1-mobile, 2.25rem);
            }
            
            .preview-container h2 {
                font-size: var(--font-size-h2-mobile, 1.875rem);
            }
        }
    </style>
</head>
<body class="bg-white dark:bg-neutral-900">
    <!-- Bannière de prévisualisation -->
    <div class="preview-banner"></div>
    
    <!-- Contenu de prévisualisation -->
    <div class="preview-container">
        ${contentHTML}
    </div>
    
    <script>
        // Script pour la prévisualisation interactive
        document.addEventListener('DOMContentLoaded', function() {
            // Ajouter des interactions de base
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Simuler un clic en mode prévisualisation
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
            
            // Ajouter des effets de hover pour les images
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                    this.style.transition = 'transform 0.3s ease';
                });
                
                img.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
            
            // Afficher un message de prévisualisation
            console.log('🎨 Mode prévisualisation actif - Contenu modifié affiché en temps réel');
        });
    </script>
</body>
</html>`;
}

function generateCustomCSS(typographySettings?: any, buttonStyles?: any[]): string {
  let css = ':root {\n';
  
  // Variables de typographie
  if (typographySettings) {
    css += `  /* Typographie */\n`;
    css += `  --font-family: ${getFontFamilyCSS(typographySettings.fontFamily)};\n`;
    
    if (typographySettings.fontSize) {
      Object.entries(typographySettings.fontSize).forEach(([key, value]) => {
        css += `  --font-size-${key}: ${value}px;\n`;
      });
    }
    
    if (typographySettings.fontWeight) {
      Object.entries(typographySettings.fontWeight).forEach(([key, value]) => {
        css += `  --font-weight-${key}: ${value};\n`;
      });
    }
    
    if (typographySettings.lineHeight) {
      Object.entries(typographySettings.lineHeight).forEach(([key, value]) => {
        css += `  --line-height-${key}: ${value};\n`;
      });
    }
    
    if (typographySettings.letterSpacing) {
      Object.entries(typographySettings.letterSpacing).forEach(([key, value]) => {
        css += `  --letter-spacing-${key}: ${value}em;\n`;
      });
    }
  }
  
  // Variables de styles de boutons
  if (buttonStyles && buttonStyles.length > 0) {
    css += `  /* Styles de boutons */\n`;
    buttonStyles.forEach((style, index) => {
      const prefix = `btn-${style.type}-${index}`;
      css += `  --${prefix}-background: ${style.colors.background};\n`;
      css += `  --${prefix}-background-hover: ${style.colors.backgroundHover};\n`;
      css += `  --${prefix}-text: ${style.colors.text};\n`;
      css += `  --${prefix}-border: ${style.colors.border};\n`;
      css += `  --${prefix}-border-radius: ${style.borderRadius}px;\n`;
      css += `  --${prefix}-padding-x: ${style.padding.x}px;\n`;
      css += `  --${prefix}-padding-y: ${style.padding.y}px;\n`;
      css += `  --${prefix}-font-size: ${style.fontSize}px;\n`;
      css += `  --${prefix}-font-weight: ${style.fontWeight};\n`;
      
      if (style.shadows.enabled) {
        css += `  --${prefix}-shadow: ${style.shadows.offsetX}px ${style.shadows.offsetY}px ${style.shadows.blur}px ${style.shadows.spread}px ${style.shadows.color};\n`;
      }
      
      if (style.animations.enabled) {
        css += `  --${prefix}-transition-duration: ${style.animations.duration}ms;\n`;
        css += `  --${prefix}-hover-transform: ${getHoverTransform(style.animations.type)};\n`;
      }
    });
  }
  
  css += '}\n\n';
  
  // Styles CSS spécifiques pour les boutons
  if (buttonStyles && buttonStyles.length > 0) {
    buttonStyles.forEach((style, index) => {
      const prefix = `btn-${style.type}-${index}`;
      css += `.btn-${style.type} {\n`;
      css += `  background-color: var(--${prefix}-background);\n`;
      css += `  color: var(--${prefix}-text);\n`;
      css += `  border-color: var(--${prefix}-border);\n`;
      css += `  border-radius: var(--${prefix}-border-radius);\n`;
      css += `  padding: var(--${prefix}-padding-y) var(--${prefix}-padding-x);\n`;
      css += `  font-size: var(--${prefix}-font-size);\n`;
      css += `  font-weight: var(--${prefix}-font-weight);\n`;
      
      if (style.shadows.enabled) {
        css += `  box-shadow: var(--${prefix}-shadow);\n`;
      }
      
      if (style.animations.enabled) {
        css += `  transition: all var(--${prefix}-transition-duration) ease;\n`;
      }
      
      css += `}\n\n`;
      
      css += `.btn-${style.type}:hover {\n`;
      css += `  background-color: var(--${prefix}-background-hover);\n`;
      css += `  transform: var(--${prefix}-hover-transform);\n`;
      css += `}\n\n`;
    });
  }
  
  return css;
}

function getFontFamilyCSS(fontFamily: string): string {
  switch (fontFamily) {
    case "inter": return "'Inter', system-ui, sans-serif";
    case "roboto": return "'Roboto', system-ui, sans-serif";
    case "open-sans": return "'Open Sans', system-ui, sans-serif";
    case "poppins": return "'Poppins', system-ui, sans-serif";
    case "montserrat": return "'Montserrat', system-ui, sans-serif";
    case "playfair-display": return "'Playfair Display', serif";
    case "merriweather": return "'Merriweather', serif";
    case "source-sans-pro": return "'Source Sans Pro', system-ui, sans-serif";
    case "nunito": return "'Nunito', system-ui, sans-serif";
    default: return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
}

function getHoverTransform(animationType: string): string {
  switch (animationType) {
    case "scale": return "scale(1.05)";
    case "slide": return "translateY(-2px)";
    case "bounce": return "translateY(-4px)";
    case "glow": return "scale(1.02)";
    default: return "none";
  }
}

function generateContentHTML(content: any): string {
  // Cette fonction génère le HTML basé sur le contenu modifié
  // Pour l'instant, retournons un exemple de contenu
  // Dans une implémentation complète, elle analyserait le contenu et générerait le HTML correspondant
  
  return `
    <!-- Section Hero -->
    <section class="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="mb-6">${content?.hero?.title || 'Bienvenue sur KAIRO Digital'}</h1>
            <p class="text-xl mb-8 opacity-90">${content?.hero?.subtitle || 'Votre partenaire digital de confiance'}</p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="#" class="btn btn-primary">${content?.hero?.ctaPrimary || 'Commencer'}</a>
                <a href="#" class="btn btn-secondary">${content?.hero?.ctaSecondary || 'En savoir plus'}</a>
            </div>
        </div>
    </section>
    
    <!-- Section Services -->
    <section class="py-20 bg-gray-50 dark:bg-gray-800">
        <div class="container mx-auto px-4">
            <h2 class="text-center mb-16">${content?.services?.title || 'Nos Services'}</h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${generateServicesHTML(content?.services?.items || [])}
            </div>
        </div>
    </section>
    
    <!-- Section CTA -->
    <section class="py-20 bg-blue-600 text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="mb-6">${content?.cta?.title || 'Prêt à collaborer ?'}</h2>
            <p class="text-xl mb-8 opacity-90">${content?.cta?.subtitle || 'Transformons votre vision en réalité'}</p>
            <a href="#" class="btn btn-primary">${content?.cta?.button || 'Discuter de votre projet'}</a>
        </div>
    </section>
  `;
}

function generateServicesHTML(services: any[]): string {
  if (!services || services.length === 0) {
    return `
      <div class="text-center p-8">
        <h3 class="text-xl font-semibold mb-4">Développement Web</h3>
        <p>Création de sites web modernes et performants</p>
      </div>
      <div class="text-center p-8">
        <h3 class="text-xl font-semibold mb-4">Design UI/UX</h3>
        <p>Interfaces utilisateur intuitives et esthétiques</p>
      </div>
      <div class="text-center p-8">
        <h3 class="text-xl font-semibold mb-4">Marketing Digital</h3>
        <p>Stratégies digitales pour augmenter votre visibilité</p>
      </div>
    `;
  }
  
  return services.map(service => `
    <div class="text-center p-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
      <h3 class="text-xl font-semibold mb-4">${service.title || 'Service'}</h3>
      <p>${service.description || 'Description du service'}</p>
    </div>
  `).join('');
}
