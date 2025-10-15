"use client";

import { useColors } from "@/hooks/use-colors";
import { useContentSync } from "@/hooks/use-content-sync";
import {
  Clock,
  Users,
  Code,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import contentData from "@/config/content.json";

interface MethodesContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  process: {
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      number: string;
      duration: string;
      description: string;
      deliverables: string[];
    }>;
  };
  guarantees: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

const defaultContent: MethodesContent = {
  hero: {
    title: "Notre Méthodologie",
    subtitle: "Un processus éprouvé en 5 étapes",
    description:
      "Découvrez comment nous transformons vos idées en solutions digitales performantes grâce à notre approche structurée et transparente.",
  },
  process: {
    title: "Processus de Développement",
    subtitle:
      "Une approche méthodique et transparente pour garantir la réussite de votre projet",
    steps: [
      {
        title: "Analyse & Discovery",
        number: "01",
        duration: "1-2 semaines",
        description:
          "Compréhension approfondie de vos besoins, objectifs et contraintes techniques",
        deliverables: [
          "Brief créatif",
          "Architecture technique",
          "Planning détaillé",
        ],
      },
      {
        title: "Conception & Design",
        number: "02",
        duration: "2-3 semaines",
        description:
          "Création de maquettes et wireframes avec une approche centrée utilisateur",
        deliverables: [
          "Maquettes UI/UX",
          "Guide de style",
          "Prototypes interactifs",
        ],
      },
      {
        title: "Développement",
        number: "03",
        duration: "4-8 semaines",
        description:
          "Codage propre et optimisé avec les technologies les plus récentes",
        deliverables: [
          "Code source",
          "Documentation technique",
          "Tests unitaires",
        ],
      },
      {
        title: "Tests & Qualité",
        number: "04",
        duration: "1-2 semaines",
        description:
          "Validation complète du fonctionnement et de la performance",
        deliverables: [
          "Tests d'intégration",
          "Audit de performance",
          "Tests de sécurité",
        ],
      },
      {
        title: "Déploiement & Formation",
        number: "05",
        duration: "1 semaine",
        description:
          "Mise en ligne et formation de votre équipe à l'utilisation",
        deliverables: [
          "Site en production",
          "Formation utilisateur",
          "Support post-lancement",
        ],
      },
    ],
  },
  guarantees: {
    title: "Nos Garanties",
    subtitle: "Des engagements concrets pour votre tranquillité d'esprit",
    items: [
      {
        icon: "clock",
        title: "Respect des délais",
        description:
          "Engagement sur les dates de livraison avec suivi hebdomadaire",
      },
      {
        icon: "users",
        title: "Communication transparente",
        description:
          "Rapports réguliers et accès permanent à l'avancement du projet",
      },
      {
        icon: "code",
        title: "Code source propriétaire",
        description: "Livraison complète du code source et de la documentation",
      },
      {
        icon: "shield",
        title: "Support post-lancement",
        description:
          "Accompagnement et maintenance pendant 3 mois après la livraison",
      },
    ],
  },
};

export function MethodesContent() {
  const { colors } = useColors();
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const { lastUpdate, isConnected } = useContentSync({ interval: 10000 });

  const content = contentData.methodes || defaultContent;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "clock":
        return <Clock className="w-6 h-6" />;
      case "users":
        return <Users className="w-6 h-6" />;
      case "code":
        return <Code className="w-6 h-6" />;
      case "shield":
        return <Shield className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              style={{ color: colors.primary }}
            >
              {content.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {content.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.process.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.process.subtitle}
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12">
            {content.process.steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 lg:p-12 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div
                    className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {step.number}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {step.title}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {step.duration}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-6 text-lg">
                      {step.description}
                    </p>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Livrables :
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.deliverables.map((deliverable, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {deliverable}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.guarantees.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.guarantees.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.guarantees.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <div style={{ color: colors.primary }}>
                    {getIcon(item.icon)}
                  </div>
                </div>

                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  {item.title}
                </h3>

                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ color: colors.primary }}
          >
            Prêt à démarrer votre projet ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transformons vos idées en succès digital avec notre méthodologie
            éprouvée
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              Démarrer un projet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              Voir nos services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
