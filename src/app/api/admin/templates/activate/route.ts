import { NextRequest, NextResponse } from "next/server";
import { TemplateService } from "@/lib/template-service";

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json();
    await TemplateService.activateTemplate(templateId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur activation template:", error);
    return NextResponse.json(
      { error: "Erreur activation template" },
      { status: 500 }
    );
  }
}
