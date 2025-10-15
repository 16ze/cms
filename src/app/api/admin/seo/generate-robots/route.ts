import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin (contournement pour développement)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`);
      if (!authResponse.ok) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    // Générer le contenu du robots.txt
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kairo-digital.fr";

    const robotsContent = `# Robots.txt pour ${baseUrl}
# Généré automatiquement par KAIRO Digital

User-agent: *
Allow: /

# Pages principales
Allow: /about
Allow: /services
Allow: /portfolio
Allow: /blog
Allow: /contact

# Ressources statiques
Allow: /images/
Allow: /css/
Allow: /js/
Allow: /fonts/

# Pages à exclure
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Temps de crawl recommandé
Crawl-delay: 1`;

    // Écrire le fichier robots.txt dans le dossier public
    const robotsPath = join(process.cwd(), "public", "robots.txt");
    writeFileSync(robotsPath, robotsContent, "utf8");

    return NextResponse.json({
      success: true,
      message: "robots.txt généré avec succès",
      path: "/robots.txt"
    });

  } catch (error) {
    console.error("Erreur lors de la génération du robots.txt:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du robots.txt" },
      { status: 500 }
    );
  }
}
