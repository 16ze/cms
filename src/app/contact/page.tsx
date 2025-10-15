import { ContactContent } from "@/components/pages/contact-content-new";
import { MainLayout } from "@/components/layout/main-layout";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

export async function generateMetadata() {
  return generateDynamicMetadata(
    "Contact",
    "Contactez-nous pour vos projets web",
    "contact KAIRO Digital, devis site web, développement web Belfort, agence web contact"
  );
}

export default function ContactPage() {
 return (
 <MainLayout>
 <ContactContent />
 </MainLayout>
 );
}
