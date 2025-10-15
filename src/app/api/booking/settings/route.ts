import { NextResponse } from "next/server";
import { getBookingSettings, validateBookingSettings } from "../../../../lib/booking-settings";

// GET /api/booking/settings - Récupérer les paramètres de réservation
export async function GET() {
  try {
    console.log("🔧 API: Récupération des paramètres de réservation");
    
    const settings = await getBookingSettings();
    
    if (!validateBookingSettings(settings)) {
      console.warn("⚠️ Paramètres de réservation invalides détectés");
    }
    
    return NextResponse.json({
      success: true,
      settings,
      message: "Paramètres de réservation récupérés avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres de réservation:", error);
    
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la récupération des paramètres de réservation",
      settings: null
    }, { status: 500 });
  }
}
