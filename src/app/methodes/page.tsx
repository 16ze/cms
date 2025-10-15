import { MethodesContent } from "@/components/pages/methodes-content";
import { MainLayout } from "@/components/layout/main-layout";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

export async function generateMetadata() {
  return generateDynamicMetadata(
    "Méthodes de travail",
    "Découvrez notre méthodologie éprouvée en 5 étapes pour transformer vos idées en solutions digitales performantes. Processus transparent et structuré à Belfort.",
    "méthodologie développement web, processus création site, étapes projet web, méthodologie Belfort, développement web structuré, processus transparent"
  );
}

export default function MethodesPage() {
 return (
 <MainLayout>
 <MethodesContent />
 </MainLayout>
 );
}


