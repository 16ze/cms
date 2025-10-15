import { AboutContent } from "@/components/pages/about-content-new";
import { MainLayout } from "@/components/layout/main-layout";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

export async function generateMetadata() {
  return generateDynamicMetadata(
    "À propos",
    "Découvrez notre équipe et notre approche du développement web",
    "à propos KAIRO Digital, équipe développement web Belfort, histoire agence web, valeurs KAIRO Digital"
  );
}

export default function AboutPage() {
 return (
 <MainLayout>
 <AboutContent />
 </MainLayout>
 );
}
