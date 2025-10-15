import { ServicesContent } from "@/components/pages/services-content-new";
import { MainLayout } from "@/components/layout/main-layout";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

export async function generateMetadata() {
  return generateDynamicMetadata(
    "Services",
    "Découvrez nos services de développement web et d'amélioration de visibilité en ligne à Belfort. Sites vitrines, e-commerce, applications web et référencement pour entreprises en Franche-Comté.",
    "développement web Belfort, services web, sites vitrines, e-commerce, référencement web Belfort, applications web, site internet Belfort, agence web Franche-Comté, création site internet"
  );
}

export default function ServicesPage() {
 return (
 <MainLayout>
 <ServicesContent />
 </MainLayout>
 );
}
