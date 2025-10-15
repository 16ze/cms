"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useColors } from "@/lib/hooks/useColors";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import companyData from "@/config/company.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "@/components/ui/apple-grid.css";

interface AppleGridServicesProps {
  content?: any;
}

export function AppleGridServices({ content }: AppleGridServicesProps) {
  const colors = useColors();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Configuration des services avec layout Apple
  const mainServices = [
    {
      id: "site-vitrine",
      title: "Site Vitrine",
      subtitle: "Votre présence en ligne. Professionnelle et élégante.",
      description: "Sites web qui convertissent vos visiteurs en clients.",
      ctaPrimary: "En savoir plus",
      ctaSecondary: "Voir nos créations",
      background: "#e6f3ff",
      textColor: "#0066cc",
      gridArea: "1 / 1 / 2 / 2", // Haut gauche
      image: "/images/placeholder-site-vitrine.jpg",
    },
    {
      id: "app-web",
      title: "Application",
      subtitle: "Solutions sur mesure. Performantes et évolutives.",
      description: "Applications web personnalisées pour vos besoins.",
      ctaPrimary: "Explorer",
      ctaSecondary: "Demander un devis",
      background: "#1a1a1a",
      textColor: "#ffffff",
      gridArea: "1 / 2 / 3 / 3", // Haut droite (grande)
      image: "/images/placeholder-app-web.jpg",
    },
    {
      id: "ecommerce",
      title: "E-commerce",
      subtitle: "Vendez en ligne simplement.",
      description: "Boutiques performantes avec paiement sécurisé.",
      ctaPrimary: "Découvrir",
      ctaSecondary: "Portfolio",
      background: "#f0f9ff",
      textColor: "#0369a1",
      gridArea: "2 / 1 / 3 / 2", // Bas gauche
      image: "/images/placeholder-ecommerce.jpg",
    },
  ];

  // Carrousel des projets (comme Apple TV+)
  const portfolioProjects = [
    {
      id: "holy-beauty",
      title: "Holy Beauty",
      category: "Site Vitrine",
      image: "/images/projects/holy-beauty.jpg",
      description: "Institut de beauté moderne et élégant",
    },
    {
      id: "purple-nails",
      title: "Purple Nails Studio",
      category: "E-commerce",
      image: "/images/projects/purple-nails.jpg",
      description: "Boutique en ligne pour onglerie",
    },
    {
      id: "kairo-portfolio",
      title: companyData.company.name,
      category: "Application Web",
      image: "/images/projects/kairo-digital.jpg",
      description: "Portfolio dynamique et moderne",
    },
    {
      id: "restaurant-app",
      title: "La Table Gourmande",
      category: "Application Web",
      image: "/images/placeholder-restaurant.jpg",
      description: "Application de réservation restaurant",
    },
    {
      id: "fitness-site",
      title: "FitMax Club",
      category: "Site Vitrine",
      image: "/images/placeholder-fitness.jpg",
      description: "Site vitrine pour salle de sport",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.max(1, portfolioProjects.length - 2)
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(1, portfolioProjects.length - 2)) %
        Math.max(1, portfolioProjects.length - 2)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 opacity-80" />
        </div>
        <div className="relative z-10 text-center px-4">
          <ScrollReveal animation="fade-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              Nos Services
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Des solutions digitales qui transforment votre vision en succès
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-medium"
            >
              Découvrir nos services
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Grille Services - Style Apple */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="apple-services-grid">
          {mainServices.map((service, index) => (
            <div
              key={service.id}
              className={`service-card ${
                service.id === "app-web" ? "large" : ""
              }`}
              style={{
                backgroundColor: service.background,
              }}
            >
              {/* Contenu texte */}
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-4xl lg:text-5xl font-bold mb-4"
                    style={{ color: service.textColor }}
                  >
                    {service.title}
                  </h2>
                  <p
                    className="text-lg lg:text-xl font-medium mb-4"
                    style={{ color: service.textColor, opacity: 0.8 }}
                  >
                    {service.subtitle}
                  </p>
                  <p
                    className="text-base lg:text-lg"
                    style={{ color: service.textColor, opacity: 0.7 }}
                  >
                    {service.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium">
                    {service.ctaPrimary}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 px-6 py-3 rounded-full font-medium"
                    style={{
                      borderColor: service.textColor,
                      color: service.textColor,
                      backgroundColor: "transparent",
                    }}
                  >
                    {service.ctaSecondary}
                  </Button>
                </div>
              </div>

              {/* Zone image placeholder */}
              <div className="mt-8 lg:mt-12">
                <div
                  className="h-32 lg:h-48 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: service.textColor + "20",
                    border: `2px solid ${service.textColor}30`,
                  }}
                >
                  <span
                    className="text-2xl lg:text-3xl font-bold opacity-40"
                    style={{ color: service.textColor }}
                  >
                    IMAGE {service.title.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Portfolio Carrousel - Style Apple TV+ */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Nos Réalisations
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              Découvrez nos projets qui font la différence
            </p>
          </div>

          {/* Carrousel */}
          <div className="relative">
            {/* Contrôles de navigation */}
            {portfolioProjects.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Carrousel des projets */}
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
              >
                {portfolioProjects.map((project, index) => (
                  <div key={project.id} className="w-1/3 flex-shrink-0 px-3">
                    <div className="relative group cursor-pointer">
                      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-800">
                        {/* Placeholder pour image */}
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold opacity-40">
                            {project.title}
                          </span>
                        </div>

                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Contenu overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-sm text-blue-400 font-medium mb-1">
                            {project.category}
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({
                length: Math.max(1, portfolioProjects.length - 2),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-white"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA finale */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <ScrollReveal animation="fade-up">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-gray-900">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Transformons ensemble votre idée en solution digitale performante
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg font-medium"
              >
                Démarrer un projet
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-4 rounded-full text-lg font-medium"
              >
                Voir le portfolio
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
