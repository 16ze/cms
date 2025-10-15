"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useColors } from "@/lib/hooks/useColors";
import { useSettingsSync } from "@/hooks/use-settings-sync";
import { useState } from "react";
import contentData from "@/config/content.json";

interface FooterContent {
  quickProjects?: Array<{
    title: string;
    description: string;
    icon: string;
    link: string;
    linkText: string;
  }>;
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  copyright?: string;
  footer?: {
    company?: {
      name?: string;
      description?: string;
      phone?: string;
      email?: string;
    };
    social?:
      | string[]
      | {
          facebook?: string;
          instagram?: string;
          linkedin?: string;
        };
  };
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  faq?: {
    title?: string;
    items?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

interface HomepageContent {
  faq?: {
    title?: string;
    items?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export function DynamicFooter() {
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const globalContent = contentData.global;
  const footerContent = contentData.footer as FooterContent | null;
  const homepageContent = contentData.homepage as HomepageContent | null;
  const { colors } = useColors();
  const { settings } = useSettingsSync();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();

  // Import direct du JSON - Pas de fallbacks hardcodés
  const quickProjects = footerContent?.quickProjects || [];
  const sections = footerContent?.sections || [];

  // Données directement depuis le JSON
  const copyright =
    footerContent?.copyright?.replace("{year}", currentYear.toString()) ||
    `© ${currentYear} ${footerContent?.company}. Tous droits réservés.`;
  const companyInfo = footerContent?.description;
  const siteName = footerContent?.company;
  const phone = footerContent?.contact?.phone;
  const email = footerContent?.contact?.email;
  const address = footerContent?.contact?.address;

  // Icônes pour les projets rapides
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "code":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
      case "shop":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
    }
  };

  return (
    <footer
      className="py-8 sm:py-12 lg:py-16 mt-auto bg-gradient-to-br from-gray-50 to-white border-t border-gray-200"
      style={{
        borderTopColor: colors.border,
      }}
    >
      <div className="container mx-auto px-4 sm:px-4 lg:px-8 max-w-7xl lg:max-w-9xl">
        {/* Section FAQ */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900">
            {homepageContent?.faq?.title}
          </h3>
          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <div className="space-y-4">
              {(homepageContent?.faq?.items || []).map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50:bg-gray-700 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900">
                      {item.question}
                    </span>
                    <span className="text-blue-600 text-xl font-bold">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`px-6 transition-all duration-300 ease-in-out ${
                      openFaq === index
                        ? "pb-4 max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Séparateur entre FAQ et colonnes */}
        <div className="border-t border-gray-200 mb-8 sm:mb-12"></div>

        {/* Colonnes de contact et navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* En-tête du footer avec logo et description */}
          <div className="sm:col-span-2 lg:col-span-1 lg:border-r lg:border-gray-200 lg:pr-12">
            <div className="mb-4">
              <span className="text-lg sm:text-xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {siteName}
                </span>
              </span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              {companyInfo}
            </p>
            {/* CTA rapide */}
            <div className="mt-4 sm:mt-6">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                <Link
                  href={footerContent?.ctaButtonUrl || "/contact"}
                  className="px-4"
                >
                  {footerContent?.ctaButton}
                </Link>
              </Button>
            </div>
          </div>
          {/* Colonne contact */}
          <div className="sm:col-span-2 lg:col-span-1 lg:border-r lg:border-gray-200 ">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900">
              Contactez-nous
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm text-gray-900">
                    Téléphone
                  </p>
                  <Link
                    href={`tel:${phone}`}
                    className="text-blue-600 hover:text-blue-800:text-blue-300 transition-colors text-xs sm:text-sm break-all"
                  >
                    {phone}
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm text-gray-900">
                    Email
                  </p>
                  <Link
                    href={`mailto:${email}`}
                    className="text-blue-600 hover:text-blue-800:text-blue-300 transition-colors text-xs sm:text-sm break-all"
                  >
                    {email}
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm text-gray-900">
                    Localisation
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">{address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonnes de liens */}
          {sections.map((section, index) => (
            <div
              key={index}
              className={`p-2 lg:px-2 ${
                index < sections.length - 1
                  ? "lg:border-r lg:border-gray-200"
                  : ""
              }`}
            >
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900">
                {section.title}
              </h4>
              <ul className="space-y-1 sm:space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600:text-blue-400 transition-colors duration-200 flex items-center group text-xs sm:text-sm"
                    >
                      <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 sm:mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div className="pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              {copyright}
            </p>

            {/* Réseaux sociaux - Import direct du JSON */}
            <div className="flex space-x-4 sm:space-x-6">
              {footerContent?.social && Array.isArray(footerContent.social) && (
                <>
                  {footerContent.social[0] && (
                    <Link
                      href={footerContent.social[0]}
                      className="transition-colors"
                      style={{ color: colors.footerText }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = colors.primary)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = colors.footerText)
                      }
                      aria-label="Facebook"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Link>
                  )}
                  {footerContent.social[1] && (
                    <Link
                      href={footerContent.social[1]}
                      className="transition-colors"
                      style={{ color: colors.footerText }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = colors.secondary)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = colors.footerText)
                      }
                      aria-label="Instagram"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.747 0-3.158-1.412-3.158-3.158 0-1.747 1.412-3.158 3.158-3.158 1.747 0 3.158 1.412 3.158 3.158 0 1.746-1.412 3.158-3.158 3.158z" />
                      </svg>
                    </Link>
                  )}
                  {footerContent.social[2] && (
                    <Link
                      href={footerContent.social[2]}
                      className="transition-colors"
                      style={{ color: colors.footerText }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = colors.primary)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = colors.footerText)
                      }
                      aria-label="LinkedIn"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
