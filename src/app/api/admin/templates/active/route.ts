import { NextResponse } from "next/server";
import { TemplateService } from "@/lib/template-service";

export async function GET() {
  try {
    const template = await TemplateService.getActiveTemplate();
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("Erreur récupération template actif:", error);
    return NextResponse.json(
      { error: "Erreur récupération template actif" },
      { status: 500 }
    );
  }
}
