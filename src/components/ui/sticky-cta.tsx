"use client";

import Link from "next/link";
import { Button } from "./button";
import { useEffect, useState } from "react";
import { X, ArrowRight, MessageCircle } from "lucide-react";
import { useColors } from "@/lib/hooks/useColors";
import contentData from "@/config/content.json";

export function StickyCTA() {
  // Démarrer avec isVisible et isDismissed à false pour éviter le flash d'hydratation
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { colors } = useColors();

  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const ctaContent = contentData.stickyCTA;

  useEffect(() => {
    // Indiquer que le composant est maintenant chargé côté client
    setIsLoaded(true);

    // Vérifier si l'utilisateur a déjà fermé le popup
    const hasUserDismissed = localStorage.getItem("sticky-cta-dismissed");
    setIsDismissed(hasUserDismissed === "true");

    const handleScroll = () => {
      // Afficher après 300px de scroll (seulement si pas fermé par l'utilisateur)
      if (hasUserDismissed !== "true") {
        setIsVisible(window.scrollY > 300);
      }
    };

    // Vérifier la position initiale du scroll
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Enregistrer la préférence de l'utilisateur
    localStorage.setItem("sticky-cta-dismissed", "true");
  };

  // Ne rien afficher avant que le code client ne soit exécuté
  if (!isLoaded || !isVisible || isDismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 py-4 z-50 border-t transform transition-all duration-500 shadow-xl"
      style={{
        background: `linear-gradient(to right, ${colors.primary}, ${colors.ctaButton}, ${colors.primary})`,
        borderTopColor: colors.primary,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center relative">
          {/* Contenu principal */}
          <div className="flex items-center mb-3 sm:mb-0">
            <div
              className="hidden sm:flex mr-4 p-2 rounded-full"
              style={{ backgroundColor: `${colors.primary}66` }}
            >
              <MessageCircle size={24} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-base sm:text-lg text-white">
                {ctaContent?.title}
              </p>
              <p className="text-white text-sm mt-1">{ctaContent?.subtitle}</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="hidden sm:flex bg-transparent border-white/30 text-white hover:text-white transition-all duration-200"
              style={
                {
                  "--hover-bg": `${colors.primary}4d`,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.primary}4d`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Link href={ctaContent?.secondaryButtonUrl || "/contact"}>
                {ctaContent?.secondaryButton}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="flex items-center gap-2 font-semibold shadow-md transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: colors.background,
                color: colors.primary,
              }}
            >
              <Link href={ctaContent?.primaryButtonUrl || "/contact"}>
                {ctaContent?.primaryButton} <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {/* Bouton de fermeture */}
          <button
            onClick={handleDismiss}
            className="absolute -top-10 right-0 sm:relative sm:top-0 sm:ml-4 p-2 rounded-full transition-colors shadow-md hover:opacity-80"
            style={{ backgroundColor: colors.primary }}
            aria-label="Fermer le message"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Version mobile uniquement - affichage simplifié */}
        <div className="flex justify-center mt-2 sm:hidden">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-transparent border-white/30 text-white hover:text-white text-xs transition-all duration-200"
            style={
              {
                "--hover-bg": `${colors.primary}4d`,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${colors.primary}4d`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Link href={ctaContent?.secondaryButtonUrl || "/contact"}>
              {ctaContent?.secondaryButton}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
