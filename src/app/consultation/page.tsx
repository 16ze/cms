import { MainLayout } from "@/components/layout/main-layout";
import BookingForm from "./components/booking-form";
import contentData from "@/config/content.json";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

// Import direct du JSON pour le contenu de la page
const consultationContent = contentData.consultation;

export async function generateMetadata() {
  return generateDynamicMetadata(
    consultationContent?.metadata?.title || "Consultation",
    consultationContent?.metadata?.description || "Réservez votre consultation gratuite",
    consultationContent?.metadata?.keywords || "consultation gratuite, rendez-vous, développement web"
  );
}

export default function ConsultationPage() {
  return (
    <MainLayout>
      <div className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20 text-white mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {consultationContent?.hero?.title}
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            {consultationContent?.hero?.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-blue-50 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {consultationContent?.benefits?.title}
              </h2>
              <ul className="space-y-4 mb-6">
                {consultationContent?.benefits?.items?.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 text-blue-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <p className="text-blue-900 font-medium">
                  {consultationContent?.benefits?.footer}
                </p>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {consultationContent?.form?.title}
              </h2>

              {/* Formulaire de réservation */}
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
