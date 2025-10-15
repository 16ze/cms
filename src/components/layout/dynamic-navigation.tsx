"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useColors } from "@/lib/hooks/useColors";
import { useButtonStyles } from "@/lib/hooks/useButtonStyles";
import { useSettingsSync } from "@/hooks/use-settings-sync";
import contentData from "@/config/content.json";

interface NavigationItem {
  name: string;
  href: string;
}

interface HeaderContent {
  navigation?:
    | NavigationItem[]
    | {
        navigation?: NavigationItem[];
        buttons?: Record<string, string>;
        buttonUrls?: Record<string, string>;
      };
  buttons?: Record<string, string>;
  buttonUrls?: Record<string, string>;
}

// Fonction pour obtenir l'icône SVG basée sur le nom de l'icône
const getNavIcon = (iconName: string) => {
  switch (iconName) {
    case "home":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      );
    case "users":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-8h3v8h-3zM12.5 11.5c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM12.5 22c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z" />
        </svg>
      );
    case "layers":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
    case "check-circle":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case "user":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    default:
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      );
  }
};

function NavigationContent() {
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const headerContent = contentData.header as HeaderContent | null;
  const { colors } = useColors();
  const { defaultStyle, generateStyleCSS } = useButtonStyles();
  const { settings } = useSettingsSync();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Récupérer les données de navigation du contenu dynamique avec fallback sécurisé
  const defaultNavigation: NavigationItem[] = [
    { name: "Accueil", href: "/" },
    { name: "Méthodes", href: "/freelance" },
    { name: "Services", href: "/services" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // S'assurer que navigation est toujours un tableau
  // Gérer les deux structures possibles: headerContent.navigation (array) ou headerContent.navigation.navigation (array)
  let rawNavigation = headerContent?.navigation;

  // Si navigation n'est pas un tableau, vérifier s'il contient une propriété navigation
  if (
    rawNavigation &&
    !Array.isArray(rawNavigation) &&
    rawNavigation.navigation
  ) {
    rawNavigation = rawNavigation.navigation;
  }

  const navigation: NavigationItem[] = Array.isArray(rawNavigation)
    ? rawNavigation
    : defaultNavigation;

  // S'assurer que Contact est toujours présent dans la navigation
  const hasContact = navigation.some((item) => item.name === "Contact");
  const finalNavigation = hasContact
    ? navigation
    : [...navigation, { name: "Contact", href: "/contact" }];

  // Gérer les buttons et buttonUrls avec les deux structures possibles
  const buttons = headerContent?.buttons ||
    (headerContent?.navigation && !Array.isArray(headerContent.navigation)
      ? headerContent.navigation.buttons
      : null) || {
      booking: "Réserver",
    };

  const buttonUrls = headerContent?.buttonUrls ||
    (headerContent?.navigation && !Array.isArray(headerContent.navigation)
      ? headerContent.navigation.buttonUrls
      : null) || {
      booking: "/consultation",
    };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gérer l'animation du menu mobile et le scroll
  React.useEffect(() => {
    const menuPanel = document.querySelector(
      "[data-menu-panel]"
    ) as HTMLElement;

    if (isMenuOpen) {
      // Empêcher le scroll de la page
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      // Animation d'ouverture : glisser depuis la gauche
      if (menuPanel) {
        setTimeout(() => {
          menuPanel.style.transform = "translateX(0)";
        }, 10);
      }
    } else {
      // Rétablir le scroll de la page
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";

      // Animation de fermeture : glisser vers la gauche
      if (menuPanel) {
        menuPanel.style.transform = "translateX(-100%)";
      }
    }

    // Cleanup : rétablir le scroll quand le composant est démonté
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isMenuOpen]);

  // Fermer le menu quand on clique sur un lien
  const handleLinkClick = () => {
    // Animation de fermeture fluide
    const menuPanel = document.querySelector(
      "[data-menu-panel]"
    ) as HTMLElement;
    if (menuPanel) {
      menuPanel.style.transform = "translateX(-100%)";
      // Attendre la fin de l'animation avant de fermer
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 300);
    } else {
      setIsMenuOpen(false);
    }
  };

  // Fermer le menu
  const handleCloseMenu = () => {
    // Animation de fermeture fluide
    const menuPanel = document.querySelector(
      "[data-menu-panel]"
    ) as HTMLElement;
    if (menuPanel) {
      menuPanel.style.transform = "translateX(-100%)";
      // Attendre la fin de l'animation avant de fermer
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 300);
    } else {
      setIsMenuOpen(false);
    }
  };

  // Logo composant
  // Logo dynamique depuis le JSON
  const logoText = headerContent?.logo || "Logo";
  const logoWords = logoText.split(" ");
  const firstWord = logoWords[0] || logoText;
  const secondWord = logoWords.slice(1).join(" ");

  const Logo = (
    <Link
      href="/"
      className="text-xl font-bold tracking-tight transition-colors duration-300"
      onClick={handleLinkClick}
    >
      <span className="drop-shadow-md">
        <span
          style={{
            color:
              isScrolled || !isHomePage ? colors.logoKairo : colors.heroTitle,
          }}
        >
          {firstWord}
        </span>
        {secondWord && (
          <>
            {" "}
            <span
              style={{
                color:
                  isScrolled || !isHomePage
                    ? colors.logoDigital
                    : colors.heroTitle,
              }}
            >
              {secondWord}
            </span>
          </>
        )}
        <span style={{ color: colors.logoDot }}>.</span>
      </span>
    </Link>
  );

  return (
    <header
      className="py-4 border-b transition-all duration-300 backdrop-blur-sm fixed top-0 left-0 right-0 z-[40]"
      style={{
        borderBottomColor:
          isScrolled || !isHomePage ? colors.border : "transparent",
        backgroundColor:
          isScrolled || !isHomePage
            ? `${colors.navBackground}f2`
            : isHomePage
            ? "transparent"
            : `${colors.navBackground}f2`,
      }}
    >
      <div className="container mx-auto px-4 md:flex md:items-center md:justify-center">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between md:hidden">
          {/* Hamburger Button */}
          <button
            type="button"
            className={`p-3 relative rounded-md transition-colors active:scale-95 touch-manipulation -ml-1 ${
              isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{
              color:
                isScrolled || !isHomePage ? colors.navText : colors.heroTitle,
              backgroundColor: "transparent",
              zIndex: 10001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-controls="mobile-menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Logo Mobile */}
          <div className="flex-1 text-center">{Logo}</div>

          {/* CTA Mobile */}
          <Link
            href={buttons.bookingUrl || "/consultation"}
            className={`p-2 relative transition-colors ${
              isScrolled || !isHomePage
                ? "bg-green-600 text-white"
                : "bg-white/20 text-white backdrop-blur-sm"
            } rounded-full p-2`}
            style={{
              zIndex: 10001,
            }}
            onClick={handleLinkClick}
            aria-label={buttons.bookingAriaLabel || "Réserver une consultation"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-[9999] md:hidden"
            style={{
              zIndex: 9999,
            }}
            onClick={handleCloseMenu}
          >
            <div
              className="fixed left-0 w-4/5"
              style={{
                top: 0,
                bottom: 0,
                height: "100vh",
                backgroundColor: "#ffffff",
                borderRight: "1px solid rgba(0, 0, 0, 0.1)",
                boxShadow: "0 0 40px rgba(0, 0, 0, 0.2)",
                transform: "translateX(-100%)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 10000,
              }}
              data-menu-panel
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}
              >
                <div className="text-lg font-semibold">
                  {headerContent?.companyName || "KAIRO Digital"}
                </div>
                <button
                  type="button"
                  className="p-2 transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = colors.navText)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = colors.textSecondary)
                  }
                  onClick={handleCloseMenu}
                  aria-label="Fermer le menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="p-4" id="mobile-menu">
                <div className="space-y-1">
                  {finalNavigation.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-4 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:bg-gray-50"
                      style={{
                        backgroundColor:
                          pathname === link.href ? "#e3f2fd" : "transparent",
                        color: pathname === link.href ? "#1976d2" : "#374151",
                      }}
                      onMouseEnter={(e) => {
                        if (pathname !== link.href) {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                          e.currentTarget.style.color = "#1d1d1f";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== link.href) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#374151";
                        }
                      }}
                      onClick={handleLinkClick}
                    >
                      {/* Icône pour chaque lien */}
                      <div className="w-6 h-6 flex-shrink-0">
                        {getNavIcon((link as any).icon || "home")}
                      </div>
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                </div>

                <div
                  className="mt-6 pt-6 border-t space-y-4"
                  style={{ borderTopColor: colors.border }}
                >
                  <Button
                    asChild
                    variant="default"
                    className="w-full h-12 transition-colors rounded-lg"
                    style={{
                      backgroundColor: "#34c759",
                      color: "#ffffff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#28a745")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#34c759")
                    }
                    onClick={handleLinkClick}
                  >
                    <Link href={buttons.bookingUrl || "/consultation"}>{buttons.booking}</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between w-full max-w-6xl">
          {/* Logo Desktop */}
          <div className="flex-shrink-0">{Logo}</div>

          {/* Navigation Links */}
          <nav className="flex space-x-8">
            {finalNavigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  pathname === link.href
                    ? isScrolled || !isHomePage
                      ? ""
                      : "underline underline-offset-4"
                    : ""
                }`}
                style={{
                  color:
                    pathname === link.href
                      ? isScrolled || !isHomePage
                        ? colors.navTextHover
                        : colors.heroTitle
                      : isScrolled || !isHomePage
                      ? colors.navText
                      : `${colors.heroTitle}e6`, // 90% opacity
                }}
                onMouseEnter={(e) => {
                  if (pathname !== link.href) {
                    e.currentTarget.style.color =
                      isScrolled || !isHomePage
                        ? colors.navTextHover
                        : colors.heroTitle;
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== link.href) {
                    e.currentTarget.style.color =
                      isScrolled || !isHomePage
                        ? colors.navText
                        : `${colors.heroTitle}e6`;
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            {/* Styles de boutons dynamiques */}
            {defaultStyle && (
              <style>
                {generateStyleCSS(defaultStyle, "header-booking-btn")}
              </style>
            )}

            <Button
              asChild
              variant="default"
              className="header-booking-btn border-none shadow-sm transition-all duration-300 text-xs md:text-xs lg:text-sm py-1 px-2 h-auto"
              style={{
                backgroundColor: colors.buttonSuccess,
                color: colors.ctaButtonText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.buttonSuccess;
              }}
            >
              <Link href={buttonUrls.booking || "/consultation"}>
                {buttons.booking}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Composant wrapper pour Navigation avec Suspense
export function DynamicNavigation() {
  return (
    <Suspense
      fallback={
        <div className="py-4 border-b border-neutral-200 bg-white/95 fixed top-0 left-0 right-0 z-[40]">
          <div className="container mx-auto px-4">
            <div className="h-8 flex items-center justify-between">
              <div className="w-24 h-6 bg-neutral-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      }
    >
      <NavigationContent />
    </Suspense>
  );
}

export default DynamicNavigation;
