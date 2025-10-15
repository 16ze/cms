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

    // Générer le contenu du sitemap
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kairo-digital.fr";
    const currentDate = new Date().toISOString();

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/portfolio</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    // Écrire le fichier sitemap.xml dans le dossier public
    const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
    writeFileSync(sitemapPath, sitemapContent, "utf8");

    return NextResponse.json({
      success: true,
      message: "Sitemap généré avec succès",
      path: "/sitemap.xml"
    });

  } catch (error) {
    console.error("Erreur lors de la génération du sitemap:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du sitemap" },
      { status: 500 }
    );
  }
}
