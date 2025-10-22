import { NextResponse } from "next/server";
import { TemplateService } from "@/lib/template-service";

export async function GET() {
  try {
    const templates = await TemplateService.getTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error("Erreur récupération templates:", error);
    return NextResponse.json(
      { error: "Erreur récupération templates" },
      { status: 500 }
    );
  }
}
