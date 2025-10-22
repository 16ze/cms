import { NextRequest, NextResponse } from "next/server";
import { TemplateService } from "@/lib/template-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const elements = await TemplateService.getSidebarElements(templateId);
    return NextResponse.json({ success: true, data: elements });
  } catch (error) {
    console.error("Erreur récupération sidebar:", error);
    return NextResponse.json(
      { error: "Erreur récupération sidebar" },
      { status: 500 }
    );
  }
}
