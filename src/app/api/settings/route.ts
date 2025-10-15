import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Récupérer tous les paramètres du site
export async function GET() {
  try {
    // Récupérer tous les paramètres par catégorie
    let allSettings;
    try {
      allSettings = await prisma.siteSettings.findMany({
        where: { isActive: true },
      });
    } catch (dbError) {
      console.log(
        "📦 Base de données non initialisée, utilisation des paramètres par défaut"
      );
      allSettings = [];
    }

    // Organiser les paramètres par catégorie
    const generalSettings = allSettings.filter((s) => s.category === "general");
    const seoSettings = allSettings.filter((s) => s.category === "seo");
    const bookingSettings = allSettings.filter((s) => s.category === "booking");
    const socialSettings = allSettings.filter((s) => s.category === "social");
    const businessSettings = allSettings.filter(
      (s) => s.category === "business"
    );
    const systemSettings = allSettings.filter((s) => s.category === "system");

    // Fonction helper pour parser les paramètres
    const parseSettings = (settings: any[], category: string) => {
      const result: any = {};
      settings.forEach((setting) => {
        if (setting.key.startsWith(`${category}_`)) {
          const key = setting.key.replace(`${category}_`, "");
          try {
            // Essayer de parser comme JSON, sinon utiliser la valeur brute
            const parsedValue = JSON.parse(setting.value);
            result[key] = parsedValue;
          } catch {
            // Si ce n'est pas du JSON valide, essayer de parser comme boolean ou number
            const value = setting.value;
            if (value === "true" || value === "false") {
              result[key] = value === "true";
            } else if (!isNaN(Number(value))) {
              result[key] = Number(value);
            } else {
              result[key] = value;
            }
          }
        }
      });
      return result;
    };

    const generalData = parseSettings(generalSettings, "general");
    const socialData = parseSettings(socialSettings, "social");
    const bookingData = parseSettings(bookingSettings, "booking");
    const seoData = parseSettings(seoSettings, "seo");
    const businessData = parseSettings(businessSettings, "business");
    const systemData = parseSettings(systemSettings, "system");

    return NextResponse.json({
      success: true,
      siteName: generalData.siteName || "KAIRO Digital",
      siteDescription:
        generalData.tagline ||
        "Agence de développement web et consulting digital",
      contactEmail:
        generalData.contactEmail || "contact.kairodigital@gmail.com",
      phoneNumber: generalData.phoneNumber || "06 XX XX XX XX",
      address: generalData.address || "",
      socialMedia:
        Object.keys(socialData).length > 0
          ? socialData
          : {
              facebook: "https://facebook.com/kairodigital",
              twitter: "",
              instagram: "https://instagram.com/kairodigital",
              linkedin: "https://linkedin.com/company/kairodigital",
            },
      bookingSettings:
        Object.keys(bookingData).length > 0
          ? bookingData
          : {
              minimumNoticeHours: 24,
              maxAdvanceBookingDays: 30,
              allowWeekendBookings: true,
              bookingTimeSlotMinutes: 60,
              shootingDuration: 180,
            },
      seoSettings:
        Object.keys(seoData).length > 0
          ? {
              ...seoData,
              // Assurer la compatibilité avec les anciens noms
              defaultMetaTitle:
                seoData.defaultMetaTitle || seoData.metaTitle || "",
              defaultMetaDescription:
                seoData.defaultMetaDescription || seoData.metaDescription || "",
            }
          : {
              defaultMetaTitle:
                "KAIRO Digital | Agence web & consulting digital",
              defaultMetaDescription:
                "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale.",
              keywords: "web, digital, développement, consulting, kairo",
              ogTitle: "KAIRO Digital | Agence web & consulting digital",
              ogDescription:
                "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale.",
              ogImage: "/images/kairo-og-image.jpg",
              twitterCard: "summary_large_image",
              canonicalUrl: "https://www.kairo-digital.fr",
              googleAnalyticsId: "G-58FT91034E",
              googleSearchConsole: "58FT91034E",
              googleTagManagerId: "GTM-T7G7LSDZ",
              sitemapEnabled: true,
              robotsTxtEnabled: true,
              structuredData: true,
            },
      businessSettings:
        Object.keys(businessData).length > 0
          ? businessData
          : {
              sector: "",
              city: "",
              region: "",
              profession: "",
              mainServices: "",
              targetAudience: "",
            },
      systemSettings:
        Object.keys(systemData).length > 0
          ? systemData
          : {
              maintenanceMode: false,
              maintenanceMessage:
                "Site en maintenance. Nous serons de retour bientôt !",
            },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Mettre à jour les paramètres du site
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { general, social, booking, seo, business, system } = body;

    // Fonction helper pour sauvegarder les paramètres
    const saveSettings = async (category: string, settings: any) => {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSettings.upsert({
          where: { key: `${category}_${key}` },
          update: {
            value: JSON.stringify(value),
            updatedAt: new Date(),
          },
          create: {
            key: `${category}_${key}`,
            value: JSON.stringify(value),
            category: category,
            description: `Paramètre ${key} pour ${category}`,
            isActive: true,
          },
        });
      }
    };

    // Mettre à jour les paramètres généraux
    if (general) {
      await saveSettings("general", general);
    }

    // Mettre à jour les paramètres sociaux
    if (social) {
      await saveSettings("social", social);
    }

    // Mettre à jour les paramètres de réservation
    if (booking) {
      await saveSettings("booking", booking);
    }

    // Mettre à jour les paramètres SEO
    if (seo) {
      await saveSettings("seo", seo);
    }

    // Mettre à jour les paramètres business
    if (business) {
      await saveSettings("business", business);
    }

    // Mettre à jour les paramètres système
    if (system) {
      await saveSettings("system", system);
    }

    return NextResponse.json({
      success: true,
      message: "Paramètres mis à jour avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
