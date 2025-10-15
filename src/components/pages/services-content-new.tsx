"use client";

import { useColors } from "@/hooks/use-colors";
import {
  Globe,
  ShoppingCart,
  Smartphone,
  RefreshCw,
  Search,
  Wrench,
  Code,
  Database,
  Palette,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import contentData from "@/config/content.json";

interface ServicesContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      price: string;
      description: string;
      features: string[];
    }>;
  };
  technologies: {
    title: string;
    subtitle: string;
    categories: Array<{
      icon: string;
      name: string;
      technologies: string[];
    }>;
  };
}

const defaultContent: ServicesContent = {
  hero: {
    title: "Nos Services",
    subtitle: "Solutions digitales sur mesure",
    description:
      "Découvrez notre gamme complète de services de développement web pour transformer votre vision en réalité digitale.",
  },
  services: {
    title: "Services de Développement",
    subtitle: "Des solutions adaptées à tous les besoins et budgets",
    items: [
      {
        icon: "globe",
        title: "Site Vitrine",
        price: "À partir de 450€",
        description:
          "Site web professionnel pour présenter votre entreprise et vos services",
        features: [
          "Design responsive",
          "Optimisation SEO",
          "Formulaire de contact",
          "Gestion de contenu",
          "Hébergement inclus",
        ],
      },
      {
        icon: "shopping-cart",
        title: "E-commerce",
        price: "À partir de 1500€",
        description:
          "Boutique en ligne complète pour vendre vos produits en ligne",
        features: [
          "Catalogue produits",
          "Paiement sécurisé",
          "Gestion des stocks",
          "Suivi des commandes",
          "Marketing intégré",
        ],
      },
      {
        icon: "smartphone",
        title: "Application Web",
        price: "Sur devis",
        description:
          "Application web sur mesure pour automatiser vos processus",
        features: [
          "Interface personnalisée",
          "Base de données",
          "API intégrée",
          "Sécurité avancée",
          "Maintenance",
        ],
      },
      {
        icon: "refresh-cw",
        title: "Refonte de Site",
        price: "À partir de 800€",
        description: "Modernisation et amélioration de votre site web existant",
        features: [
          "Audit complet",
          "Design moderne",
          "Performance optimisée",
          "SEO amélioré",
          "Formation",
        ],
      },
      {
        icon: "search",
        title: "Référencement SEO",
        price: "À partir de 300€/mois",
        description:
          "Amélioration de votre visibilité sur les moteurs de recherche",
        features: [
          "Audit SEO complet",
          "Optimisation technique",
          "Création de contenu",
          "Suivi des positions",
          "Rapports mensuels",
        ],
      },
      {
        icon: "wrench",
        title: "Maintenance",
        price: "À partir de 150€/mois",
        description: "Service de maintenance et support technique continu",
        features: [
          "Mises à jour",
          "Sauvegardes",
          "Support technique",
          "Monitoring",
          "Optimisations",
        ],
      },
    ],
  },
  technologies: {
    title: "Technologies Utilisées",
    subtitle:
      "Stack technique moderne et performante pour des solutions robustes",
    categories: [
      {
        icon: "code",
        name: "Frontend",
        technologies: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "Framer Motion",
        ],
      },
      {
        icon: "database",
        name: "Backend",
        technologies: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Prisma"],
      },
      {
        icon: "palette",
        name: "CMS",
        technologies: [
          "WordPress",
          "Strapi",
          "Sanity",
          "Contentful",
          "Custom CMS",
        ],
      },
    ],
  },
};

export function ServicesContent() {
  const { colors } = useColors();

  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const servicesContent = contentData.services;

  // Gérer la structure de l'API qui retourne { services: { services: {...} } }
  let content = defaultContent;

  if (servicesContent) {
    // Si l'API retourne une structure avec services.services
    if (servicesContent.services) {
      content = {
        hero: {
          title: "Nos Services",
          subtitle: "Solutions digitales sur mesure",
          description:
            "Découvrez notre gamme complète de services de développement web pour transformer votre vision en réalité digitale.",
        },
        services: servicesContent.services,
        technologies: defaultContent.technologies,
      };
    } else {
      // Sinon utiliser le contenu par défaut
      content = servicesContent;
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "globe":
        return <Globe className="w-8 h-8" />;
      case "shopping-cart":
        return <ShoppingCart className="w-8 h-8" />;
      case "smartphone":
        return <Smartphone className="w-8 h-8" />;
      case "refresh-cw":
        return <RefreshCw className="w-8 h-8" />;
      case "search":
        return <Search className="w-8 h-8" />;
      case "wrench":
        return <Wrench className="w-8 h-8" />;
      case "code":
        return <Code className="w-8 h-8" />;
      case "database":
        return <Database className="w-8 h-8" />;
      case "palette":
        return <Palette className="w-8 h-8" />;
      default:
        return <Globe className="w-8 h-8" />;
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

      {/* Services Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.services.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.services.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.items.map((service, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <div style={{ color: colors.primary }}>
                    {getIcon(service.icon)}
                  </div>
                </div>

                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">{service.description}</p>

                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <div
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: colors.primary }}
                      ></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.technologies.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.technologies.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {content.technologies.categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <div style={{ color: colors.primary }}>
                    {getIcon(category.icon)}
                  </div>
                </div>

                <h3
                  className="text-2xl font-bold mb-6"
                  style={{ color: colors.primary }}
                >
                  {category.name}
                </h3>

                <div className="flex flex-wrap justify-center gap-2">
                  {category.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: colors.primary + "20",
                        color: colors.primary,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
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
            Prêt à transformer votre vision ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez comment nos services peuvent propulser votre entreprise
            vers de nouveaux sommets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              Demander un devis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/methodes"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold border-2 transition-all duration-300 hover:scale-105"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              Voir notre méthodologie
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
