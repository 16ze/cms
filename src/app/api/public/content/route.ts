import { NextRequest, NextResponse } from "next/server";
import { JSONContentService } from "@/lib/json-content-service";

// Fonction pour générer un ETag simple
function generateETag(data: any): string {
  const content = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

// GET /api/public/content - API publique pour récupérer le contenu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");

    console.log(
      `📖 API Publique: Chargement du contenu${
        page ? ` pour la page ${page}` : " global"
      }`
    );

    let content;
    const version = Date.now().toString();

    if (page) {
      // Charger une page spécifique
      content = await JSONContentService.loadPage(page);

      if (!content) {
        // Essayer de charger tout le contenu et extraire la page
        const allContent = await JSONContentService.loadAll();
        content = allContent[page];

        if (!content) {
          return NextResponse.json(
            { error: `Page "${page}" non trouvée` },
            { status: 404 }
          );
        }
      }

      // Préparer la réponse
      const responseData = { [page]: content };
      const etag = generateETag(responseData);

      // Vérifier If-None-Match pour cache conditionnel
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            etag: etag,
            "x-content-version": version,
            "cache-control": "public, max-age=300", // 5 minutes
          },
        });
      }

      // Retourner le contenu avec headers de cache
      return NextResponse.json(responseData, {
        headers: {
          etag: etag,
          "x-content-version": version,
          "cache-control": "public, max-age=300",
          vary: "Accept-Encoding",
        },
      });
    } else {
      // Charger tout le contenu
      content = await JSONContentService.loadAll();
      const etag = generateETag(content);

      // Vérifier If-None-Match pour cache conditionnel
      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            etag: etag,
            "x-content-version": version,
            "cache-control": "public, max-age=300",
          },
        });
      }

      return NextResponse.json(content, {
        headers: {
          etag: etag,
          "x-content-version": version,
          "cache-control": "public, max-age=300",
          vary: "Accept-Encoding",
        },
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors du chargement du contenu public:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du contenu" },
      { status: 500 }
    );
  }
}
