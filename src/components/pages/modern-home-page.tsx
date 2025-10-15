"use client";

import { useState, useEffect } from "react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useColors } from "../../lib/hooks/useColors";
import "../../styles/modern-home.css";
import companyData from "@/config/company.json";
import contentData from "@/config/content.json";

// Interfaces pour le contenu de la page d'accueil
interface HomepageContent {
  hero?: {
    logoText?: string;
    logoDigital?: string;
    title?: string;
    subtitle?: string;
    logo?: string;
    heroImage?: string;
    ctaButton?: string;
    ctaButtonUrl?: string;
  };
  education?: {
    bubble1?: string;
    bubble2?: string;
    bubble3?: string;
    ctaButton?: string;
    ctaButtonUrl?: string;
  };
  services?: {
    title?: string;
    subtitle?: string;
    slogan?: string;
    primaryButton?: string;
    primaryButtonUrl?: string;
    secondaryButton?: string;
    secondaryButtonUrl?: string;
    mockups?: {
      vitrine?: { label?: string };
      ecommerce?: { label?: string };
      application?: { label?: string };
    };
  };
  grid?: {
    visibility?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
    performance?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
    conversion?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
    responsive?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
    security?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
    roi?: {
      title?: string;
      subtitle?: string;
      image?: string;
      primaryButton?: string;
      primaryButtonUrl?: string;
      secondaryButton?: string;
      secondaryButtonUrl?: string;
    };
  };
  portfolio?: {
    slides?: Array<{
      title: string;
      subtitle: string;
      category: string;
      image: string;
    }>;
  };
  finalCta?: {
    title?: string;
    subtitle?: string;
    primaryButton?: string;
    primaryButtonUrl?: string;
    secondaryButton?: string;
    secondaryButtonUrl?: string;
  };
  faq?: {
    title?: string;
    items?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

const ModernHomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const { colors } = useColors();

  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const homepageContent = contentData.homepage as HomepageContent;

  // Utiliser directement les slides du JSON
  const rawSlides = homepageContent?.portfolio?.slides || [];

  const normalizedSlides = rawSlides
    .map((slide) => {
      const title = slide?.title?.trim() || "";
      const subtitle = slide?.subtitle?.trim() || "";
      const category = slide?.category?.trim() || "";
      const image = slide?.image?.trim() || "";
      const alt = slide?.alt?.trim() || "";

      return { title, subtitle, category, image, alt };
    })
    .filter((slide) => Boolean(slide.title && slide.image));

  const resolvedSlides = normalizedSlides;

  const slidesWithResolvedData = resolvedSlides.map((slide) => {
    // Assurer que slide est un objet avec les bonnes propriétés
    const safeSlide = slide as {
      title?: string;
      subtitle?: string;
      category?: string;
      image?: string;
      alt?: string;
    };

    return {
      title: safeSlide.title || "",
      subtitle: safeSlide.subtitle || "",
      category: safeSlide.category || "",
      image: safeSlide.image || "",
      alt: safeSlide.alt || "",
    };
  });

  const handleImageError = (index: number) => {
    setImageErrors((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  };

  useEffect(() => {
    if (isPlaying && slidesWithResolvedData.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slidesWithResolvedData.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, slidesWithResolvedData.length]);

  useEffect(() => {
    if (currentSlide >= slidesWithResolvedData.length) {
      setCurrentSlide(0);
    }
  }, [slidesWithResolvedData.length, currentSlide]);

  return (
    <div
      style={
        {
          "--primary-color": colors?.primary || "#007aff",
          "--secondary-color": colors?.secondary || "#8b5cf6",
          "--accent-color": colors?.accent || "#f59e0b",
          "--text-primary": colors?.textPrimary || "#1d1d1f",
          "--text-secondary": colors?.textSecondary || "#86868b",
          "--background-primary": colors?.background || "#ffffff",
          "--background-secondary": colors?.surface || "#f5f5f7",
        } as React.CSSProperties
      }
    >
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-logo-container">
            <Image
              src="/logo-court.svg"
              alt={`${companyData.company.name} Logo`}
              width={200}
              height={60}
              className="hero-logo-svg"
              priority
            />
          </div>
          <h1 className="hero-title">{homepageContent?.hero?.title}</h1>
          <p className="hero-subtitle">{homepageContent?.hero?.subtitle}</p>
          <a href={homepageContent?.hero?.ctaButtonUrl} className="hero-cta">
            {homepageContent?.hero?.ctaButton}
          </a>
        </div>
        <div className="hero-glow"></div>
      </section>

      {/* 2. SECTION ÉDUCATION */}
      <section className="education-section">
        <div className="education-background">
          <div className="web-icons">
            <div className="icon-html">&lt;/&gt;</div>
            <div className="icon-css">CSS</div>
            <div className="icon-js">JS</div>
            <div className="icon-react">⚛</div>
            <div className="icon-node">NODE</div>
          </div>
        </div>
        <div className="education-content">
          <div className="conversation-bubbles">
            <div className="bubble bubble-1">
              <p>{homepageContent?.education?.bubble1}</p>
            </div>
            <div className="bubble bubble-2">
              <p>{homepageContent?.education?.bubble2}</p>
            </div>
            <div className="bubble bubble-3">
              <p>{homepageContent?.education?.bubble3}</p>
            </div>
          </div>

          <div className="education-mockups">
            <div className="mockup mockup-1">
              <div className="mockup-screen">
                <div className="mockup-content">
                  <div className="mockup-header"></div>
                  <div className="mockup-body">
                    <div className="mockup-card"></div>
                    <div className="mockup-card"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mockup mockup-2">
              <div className="mockup-screen">
                <div className="mockup-content">
                  <div className="mockup-nav"></div>
                  <div className="mockup-hero"></div>
                </div>
              </div>
            </div>
          </div>

          <a
            href={homepageContent?.education?.ctaButtonUrl}
            className="education-cta"
          >
            {homepageContent?.education?.ctaButton}
          </a>
        </div>
      </section>

      {/* 3. SECTION SERVICES PRINCIPAUX */}
      <section className="services-section">
        <div className="services-content">
          <h2 className="services-title">{homepageContent?.services?.title}</h2>
          <p className="services-subtitle">
            {homepageContent?.services?.subtitle}
          </p>

          <div className="services-buttons">
            <a
              href={homepageContent?.services?.primaryButtonUrl}
              className="services-cta primary"
            >
              {homepageContent?.services?.primaryButton}
            </a>
            <a
              href={homepageContent?.services?.secondaryButtonUrl}
              className="services-cta secondary"
            >
              {homepageContent?.services?.secondaryButton}
            </a>
          </div>

          <p className="services-slogan">{homepageContent?.services?.slogan}</p>

          <div className="services-mockups">
            <div className="service-mockup">
              <div className="service-screen">
                <div className="service-content vitrine">
                  <div className="service-header"></div>
                  <div className="service-hero">
                    <div className="service-text-block"></div>
                    <div className="service-text-block short"></div>
                  </div>
                  <div className="service-cards">
                    <div className="service-card"></div>
                    <div className="service-card"></div>
                    <div className="service-card"></div>
                  </div>
                </div>
              </div>
              <p className="service-label">
                {homepageContent?.services?.mockups?.vitrine?.label}
              </p>
            </div>

            <div className="service-mockup">
              <div className="service-screen">
                <div className="service-content ecommerce">
                  <div className="service-header ecommerce-nav"></div>
                  <div className="service-products">
                    <div className="product-grid">
                      <div className="product-item"></div>
                      <div className="product-item"></div>
                      <div className="product-item"></div>
                      <div className="product-item"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="service-label">
                {homepageContent?.services?.mockups?.ecommerce?.label}
              </p>
            </div>

            <div className="service-mockup">
              <div className="service-screen">
                <div className="service-content application">
                  <div className="app-sidebar"></div>
                  <div className="app-main">
                    <div className="app-toolbar"></div>
                    <div className="app-dashboard">
                      <div className="dashboard-widget"></div>
                      <div className="dashboard-widget"></div>
                      <div className="dashboard-chart"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="service-label">
                {homepageContent?.services?.mockups?.application?.label}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GRID 2x3 - Grille de services */}
      <section className="grid-section">
        <div className="grid-container">
          <div className="grid-row">
            <div className="grid-item visibility">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.visibility?.image || ""}
                  alt={
                    homepageContent?.grid?.visibility?.alt || "Visibilité 24/7"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.visibility?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.visibility?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.visibility?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.visibility?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid-item performance">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.performance?.image || ""}
                  alt={
                    homepageContent?.grid?.performance?.alt ||
                    "Performance Optimale"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.performance?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.performance?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.performance?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.performance?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-row">
            <div className="grid-item conversion">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.conversion?.image || ""}
                  alt={
                    homepageContent?.grid?.conversion?.alt ||
                    "Génération de leads"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.conversion?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.conversion?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.conversion?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.conversion?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid-item responsive">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.responsive?.image || ""}
                  alt={
                    homepageContent?.grid?.responsive?.alt || "Design Adaptatif"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.responsive?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.responsive?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.responsive?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.responsive?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-row">
            <div className="grid-item security">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.security?.image || ""}
                  alt={
                    homepageContent?.grid?.security?.alt || "Sécurité Avancée"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.security?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.security?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.security?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.security?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid-item roi">
              <div className="grid-background">
                <Image
                  src={homepageContent?.grid?.roi?.image || ""}
                  alt={
                    homepageContent?.grid?.roi?.alt ||
                    "Retour sur Investissement"
                  }
                  width={400}
                  height={300}
                  className="grid-background-image"
                />
              </div>
              <div className="grid-content">
                <div className="grid-text-content">
                  <h3 className="grid-title">
                    {homepageContent?.grid?.roi?.title}
                  </h3>
                  <p className="grid-subtitle">
                    {homepageContent?.grid?.roi?.subtitle}
                  </p>
                </div>
                <div className="grid-buttons">
                  <button className="grid-cta primary">
                    {homepageContent?.grid?.roi?.primaryButton}
                  </button>
                  <button className="grid-cta secondary">
                    {homepageContent?.grid?.roi?.secondaryButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CAROUSEL PORTFOLIO */}
      <section className="portfolio-carousel">
        <div className="carousel-container">
          <div
            className="carousel-slides"
            style={{
              transform: `translateX(calc(-${currentSlide} * (70vw + 20px)))`,
            }}
          >
            {slidesWithResolvedData.map((slide, index) => {
              const hasError = imageErrors[index];
              const backgroundImage = hasError ? "none" : `url(${slide.image})`;

              return (
                <div
                  key={index}
                  className={`carousel-slide ${
                    index === currentSlide ? "active" : ""
                  }`}
                  style={{ backgroundImage }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt || slide.title}
                    width={800}
                    height={600}
                    className="carousel-slide-loader"
                    onError={() => handleImageError(index)}
                    loading="lazy"
                  />
                  <div className="slide-overlay">
                    <div className="slide-content">
                      <div className="slide-header">
                        <h3 className="slide-title">{slide.title}</h3>
                        <p className="slide-subtitle">{slide.subtitle}</p>
                      </div>
                      <div className="slide-footer">
                        <button className="slide-cta">Voir le projet</button>
                        <span className="slide-category">{slide.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="carousel-controls">
          <button
            className="carousel-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={
              isPlaying ? "Mettre le carrousel en pause" : "Lancer le carrousel"
            }
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Play className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="carousel-pagination">
          {slidesWithResolvedData.map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* 6. SECTION CTA FINALE */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <h2 className="final-cta-title">
            {homepageContent?.finalCta?.title}
          </h2>
          <p className="final-cta-subtitle">
            {homepageContent?.finalCta?.subtitle}
          </p>
          <div className="final-cta-buttons">
            <button className="final-cta-btn primary">
              {homepageContent?.finalCta?.primaryButton}
            </button>
            <button className="final-cta-btn secondary">
              {homepageContent?.finalCta?.secondaryButton}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;
