"use client";

import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import contentData from "@/config/content.json";

interface ContactContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  form: {
    title: string;
    subtitle: string;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export function ContactContent() {
  const { colors } = useColors();
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const content = contentData.contact as ContactContent;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    project: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        project: "",
        budget: "",
        message: "",
      });
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      {/* Contact Form & Info Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  {content.form.title}
                </h2>
                <p className="text-lg text-gray-600">{content.form.subtitle}</p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-green-700">
                    Nous vous recontacterons dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de projet *
                      </label>
                      <select
                        name="project"
                        value={formData.project}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      >
                        <option value="">Sélectionnez un projet</option>
                        <option value="site-vitrine">Site Vitrine</option>
                        <option value="e-commerce">E-commerce</option>
                        <option value="application">Application Web</option>
                        <option value="refonte">Refonte de Site</option>
                        <option value="seo">Référencement SEO</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget estimé
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ focusRingColor: colors.primary }}
                      >
                        <option value="">Sélectionnez un budget</option>
                        <option value="500-1000">500€ - 1000€</option>
                        <option value="1000-3000">1000€ - 3000€</option>
                        <option value="3000-5000">3000€ - 5000€</option>
                        <option value="5000-10000">5000€ - 10000€</option>
                        <option value="10000+">10000€+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du projet *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-offset-2 transition-all duration-200 resize-none"
                      style={{ focusRingColor: colors.primary }}
                      placeholder="Décrivez votre projet, vos objectifs et vos besoins..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  {content.contact.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {content.contact.subtitle}
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Mail
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href={`mailto:${content.contact.email}`}
                      className="text-gray-600 hover:text-blue-600:text-blue-400 transition-colors"
                    >
                      {content.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Phone
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Téléphone
                    </h3>
                    <a
                      href={`tel:${content.contact.phone}`}
                      className="text-gray-600 hover:text-blue-600:text-blue-400 transition-colors"
                    >
                      {content.contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <MapPin
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Adresse
                    </h3>
                    <p className="text-gray-600">{content.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.primary + "20" }}
                  >
                    <Clock
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Horaires
                    </h3>
                    <p className="text-gray-600">{content.contact.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ color: colors.primary }}
            >
              {content.faq.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.faq.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {content.faq.items.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {item.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
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
            Prêt à démarrer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Réservez un appel découverte gratuit
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation"
              className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              Réserver un appel
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
              Voir nos réalisations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
