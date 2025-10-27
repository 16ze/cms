"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Users,
  Star,
} from "lucide-react";
import {
  useFrontendContent,
  useGoogleReviews,
} from "@/hooks/use-frontend-content";

interface SiteConfig {
  pages: string[];
  features: string[];
  colors: string;
  businessType: string;
  specialties: string[];
}

export default function BeauteAccueilPage() {
  // Charger le contenu dynamique frontend
  const { content: frontendContent, loading: contentLoading } =
    useFrontendContent({
      pageSlug: "accueil",
      autoSync: true,
    });

  // Charger les avis Google
  const { reviews } = useGoogleReviews({ autoSync: true });

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // ✅ Valeurs par défaut avec fallback - Support structure plate ET nested
  const heroTitle =
    frontendContent?.hero?.title ||
    frontendContent?.hero?.text?.title ||
    "Bienvenue dans votre salon de beauté";
  const heroSubtitle =
    frontendContent?.hero?.subtitle ||
    frontendContent?.hero?.text?.subtitle ||
    "Prenez soin de vous avec nos prestations professionnelles";
  const heroPrimaryButton = frontendContent?.hero?.primaryButton ||
    frontendContent?.hero?.button?.primary || {
      text: "Réserver un rendez-vous",
      url: "/reservation",
    };
  const heroSecondaryButton = frontendContent?.hero?.secondaryButton ||
    frontendContent?.hero?.button?.secondary || {
      text: "En savoir plus",
      url: "/prestations",
    };

  const servicesTitle =
    frontendContent?.services?.title ||
    frontendContent?.services?.text?.title ||
    "Nos Prestations";
  const servicesSubtitle =
    frontendContent?.services?.subtitle ||
    frontendContent?.services?.text?.subtitle ||
    "Découvrez notre gamme de services professionnels";
  const services = frontendContent?.services?.services ||
    frontendContent?.services?.service || [
      {
        name: "Soins Visage",
        description: "Prestation professionnelle réalisée par nos experts",
      },
      {
        name: "Pose d'Ongles",
        description: "Prestation professionnelle réalisée par nos experts",
      },
      {
        name: "Maquillage",
        description: "Prestation professionnelle réalisée par nos experts",
      },
    ];

  const teamTitle =
    frontendContent?.team?.title ||
    frontendContent?.team?.text?.title ||
    "Notre Équipe";
  const teamSubtitle =
    frontendContent?.team?.subtitle ||
    frontendContent?.team?.text?.subtitle ||
    "Des professionnels à votre service";
  const teamMembers = frontendContent?.team?.members ||
    frontendContent?.team?.member || [
      { name: "Sophie", role: "Esthéticienne professionnelle", rating: 5 },
      { name: "Marie", role: "Esthéticienne professionnelle", rating: 5 },
      { name: "Julie", role: "Esthéticienne professionnelle", rating: 5 },
    ];

  const contactTitle =
    frontendContent?.contact?.title ||
    frontendContent?.contact?.text?.title ||
    "Contactez-nous";
  const contactSubtitle =
    frontendContent?.contact?.subtitle ||
    frontendContent?.contact?.text?.subtitle ||
    "Nous sommes là pour répondre à vos questions";
  const contactInfo = frontendContent?.contact ||
    frontendContent?.contact?.info || {
      phone: "01 23 45 67 89",
      email: "contact@example.com",
      address: "123 Rue de la Beauté, Paris",
    };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-pink-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Beauté & Esthétique
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-pink-600">
                Accueil
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Prestations
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Équipe
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                Contact
              </a>
            </nav>
            <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
              Réserver
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {heroTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-8">{heroSubtitle}</p>
            <div className="flex justify-center gap-4">
              <button className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {heroPrimaryButton.text}
              </button>
              <button className="bg-white text-pink-600 px-8 py-3 rounded-lg border-2 border-pink-600 hover:bg-pink-50 transition-colors">
                {heroSecondaryButton.text}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {servicesTitle}
            </h2>
            <p className="text-gray-600">{servicesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="text-pink-600 hover:text-pink-700 font-medium">
                  En savoir plus →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {teamTitle}
            </h2>
            <p className="text-gray-600">{teamSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member: any, i: number) => (
              <div key={i} className="bg-white rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-600 mb-4">{member.role}</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (member.rating || 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      {reviews && reviews.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ce que disent nos clients
              </h2>
              <p className="text-gray-600">
                Découvrez les avis de nos clients satisfaits
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.slice(0, 6).map((review: any) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {review.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.authorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {contactTitle}
            </h2>
            <p className="text-gray-600">{contactSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">{contactInfo.phone}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">{contactInfo.email}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">{contactInfo.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Beauté & Esthétique
              </h3>
              <p className="text-gray-400">
                Votre salon de beauté professionnel
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Prestations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Équipe
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{contactInfo.phone}</li>
                <li>{contactInfo.email}</li>
                <li>{contactInfo.address}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Beauté & Esthétique. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
