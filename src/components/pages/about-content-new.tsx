"use client";

import { useColors } from "@/hooks/use-colors";
import {
  Award,
  Users,
  Clock,
  MapPin,
  Heart,
  Zap,
  Shield,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import contentData from "@/config/content.json";

interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  story: {
    title: string;
    subtitle: string;
    content: string;
  };
  values: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  stats: {
    title: string;
    subtitle: string;
    items: Array<{
      label: string;
      number: string;
      description: string;
    }>;
  };
  location: {
    title: string;
    subtitle: string;
    content: string;
    advantages: string[];
  };
}

export function AboutContent() {
  const { colors } = useColors();

  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const content = contentData.about as AboutContent;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "award":
        return <Award className="w-6 h-6" />;
      case "heart":
        return <Heart className="w-6 h-6" />;
      case "zap":
        return <Zap className="w-6 h-6" />;
      case "users":
        return <Users className="w-6 h-6" />;
      case "clock":
        return <Clock className="w-6 h-6" />;
      case "map-pin":
        return <MapPin className="w-6 h-6" />;
      case "shield":
        return <Shield className="w-6 h-6" />;
      case "target":
        return <Target className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
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
              {content.hero?.title || "À propos de KAIRO Digital"}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {content.hero?.subtitle || "Votre partenaire digital à Belfort"}
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {content.hero?.description ||
                "Découvrez notre histoire, nos valeurs et notre engagement pour votre succès digital en Franche-Comté."}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.story?.title || "Notre Histoire"}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {content.story?.subtitle ||
                "Une passion pour l'excellence digitale"}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              {content.story?.content || contentData.about.foundedText}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.values?.title || "Nos Valeurs"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.values?.subtitle ||
                "Les principes qui guident notre travail au quotidien"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(content.values?.items || []).map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <div style={{ color: colors.primary }}>
                    {getIcon(value.icon)}
                  </div>
                </div>

                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  {value.title}
                </h3>

                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.location?.title || "Basé à Belfort"}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {content.location?.subtitle || "Au cœur de la Franche-Comté"}
            </p>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              {content.location?.content ||
                "Notre positionnement à Belfort nous permet d'offrir un service de proximité exceptionnel aux entreprises de la région."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(content.location?.advantages || []).map((advantage, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-lg"
                style={{ backgroundColor: colors.primary + "10" }}
              >
                <div
                  className="w-3 h-3 rounded-full mr-4"
                  style={{ backgroundColor: colors.primary }}
                ></div>
                <span className="text-gray-700">{advantage}</span>
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
            Prêt à travailler ensemble ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez comment nous pouvons transformer votre vision en succès
            digital
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              Nous contacter
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
