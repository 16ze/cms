/**
 * API: PARAMÈTRES SEO PAR TENANT
 * ===============================
 * Multi-tenant ready ✅
 * Chaque tenant a ses propres paramètres SEO isolés
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    console.log("📋 API: GET /api/admin/seo-settings");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult;

    // Super Admin n'a pas de paramètres SEO spécifiques
    if (user.type === "SUPER_ADMIN") {
      return NextResponse.json({
        success: true,
        data: {
          googleAnalyticsId: "",
          googleTagManagerId: "",
          metaTitle: "",
          metaDescription: "",
          keywords: [],
          ogImage: "",
          twitterCard: "summary_large_image",
          sitemapEnabled: true,
          robotsTxt: "",
        },
        message: "Super Admin n'a pas de paramètres SEO",
      });
    }

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // Récupérer ou créer les paramètres SEO du tenant
    let seoSettings = await prisma.tenantSeoSettings.findUnique({
      where: { tenantId },
    });

    // Si le tenant n'a pas encore de paramètres SEO, retourner des valeurs vierges
    if (!seoSettings) {
      console.log(`✅ Première connexion: paramètres SEO vierges pour tenant ${tenantId}`);
      return NextResponse.json({
        success: true,
        data: {
          googleAnalyticsId: "",
          googleTagManagerId: "",
          metaTitle: "",
          metaDescription: "",
          keywords: [],
          ogImage: "",
          twitterCard: "summary_large_image",
          sitemapEnabled: true,
          robotsTxt: "",
        },
        isFirstTime: true,
      });
    }

    // Parser les keywords (JSON array)
    let keywords = [];
    if (seoSettings.keywords) {
      try {
        keywords = JSON.parse(seoSettings.keywords);
      } catch (e) {
        keywords = [];
      }
    }

    console.log(`✅ Paramètres SEO chargés pour tenant ${tenantId}`);

    return NextResponse.json({
      success: true,
      data: {
        googleAnalyticsId: seoSettings.googleAnalyticsId || "",
        googleTagManagerId: seoSettings.googleTagManagerId || "",
        metaTitle: seoSettings.metaTitle || "",
        metaDescription: seoSettings.metaDescription || "",
        keywords,
        ogImage: seoSettings.ogImage || "",
        twitterCard: seoSettings.twitterCard || "summary_large_image",
        sitemapEnabled: seoSettings.sitemapEnabled,
        robotsTxt: seoSettings.robotsTxt || "",
      },
    });
  } catch (error: any) {
    console.error("❌ GET /api/admin/seo-settings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("📋 API: PUT /api/admin/seo-settings");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const user = authResult;

    // Super Admin ne peut pas sauvegarder de paramètres SEO
    if (user.type === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Super Admin n'a pas de paramètres SEO" },
        { status: 403 }
      );
    }

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const body = await request.json();
    const {
      googleAnalyticsId,
      googleTagManagerId,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
      twitterCard,
      sitemapEnabled,
      robotsTxt,
    } = body;

    // Convertir keywords en JSON string
    const keywordsJson = Array.isArray(keywords) ? JSON.stringify(keywords) : "[]";

    // Upsert (créer ou mettre à jour)
    const seoSettings = await prisma.tenantSeoSettings.upsert({
      where: { tenantId },
      update: {
        googleAnalyticsId: googleAnalyticsId || null,
        googleTagManagerId: googleTagManagerId || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywordsJson,
        ogImage: ogImage || null,
        twitterCard: twitterCard || "summary_large_image",
        sitemapEnabled: sitemapEnabled !== undefined ? sitemapEnabled : true,
        robotsTxt: robotsTxt || null,
      },
      create: {
        tenantId,
        googleAnalyticsId: googleAnalyticsId || null,
        googleTagManagerId: googleTagManagerId || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywordsJson,
        ogImage: ogImage || null,
        twitterCard: twitterCard || "summary_large_image",
        sitemapEnabled: sitemapEnabled !== undefined ? sitemapEnabled : true,
        robotsTxt: robotsTxt || null,
      },
    });

    console.log(`✅ Paramètres SEO sauvegardés pour tenant ${tenantId}`);

    return NextResponse.json({
      success: true,
      data: seoSettings,
      message: "Paramètres SEO enregistrés avec succès",
    });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/seo-settings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

