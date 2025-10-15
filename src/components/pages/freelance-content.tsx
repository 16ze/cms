"use client";

import { MainLayout } from "@/components/layout/main-layout";
import "../../styles/freelance-page.css";
import contentData from "@/config/content.json";

interface FreelanceContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    heroDescription: string;
  };
  introduction: {
    title: string;
    description: string;
    subtitle: string;
    details: string;
  };
  etapes: Array<{
    nom: string;
    duree: string;
    description: string;
    livrables: string;
    icone: string;
    details: string;
  }>;
  outils: Array<{
    categorie: string;
    liste_outils: string;
    description: string;
    details: string;
  }>;
  garanties: Array<{
    titre: string;
    description: string;
    details: string;
  }>;
  cta: {
    titre: string;
    bouton_principal: string;
    bouton_principal_url: string;
    bouton_secondaire: string;
    bouton_secondaire_url: string;
  };
}

export function FreelanceContent() {
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const typedContent = contentData.freelance as unknown as FreelanceContent;

  const hero = typedContent.hero || ({} as FreelanceContent["hero"]);
  const introduction =
    typedContent.introduction || ({} as FreelanceContent["introduction"]);
  const etapesList = Array.isArray(typedContent.etapes)
    ? typedContent.etapes
    : Object.values(typedContent.etapes || {});
  const outilsList = Array.isArray(typedContent.outils)
    ? typedContent.outils
    : Object.values(typedContent.outils || {});
  const garantiesList = Array.isArray(typedContent.garanties)
    ? typedContent.garanties
    : Object.values(typedContent.garanties || {});
  const cta = typedContent.cta || ({} as FreelanceContent["cta"]);

  return (
    <MainLayout>
      <div className="freelance-page">
        {/* 1. HERO SECTION - Différent de l'accueil */}
        <section className="freelance-hero">
          <div className="freelance-hero-content">
            <h1 className="freelance-hero-title">
              {hero.title || "Méthodologie Freelance"}
            </h1>
            <p className="freelance-hero-subtitle">
              {hero.subtitle || "Processus guidé et transparent"}
            </p>
            <p className="freelance-hero-description">
              {hero.heroDescription ||
                "Découvrez comment nous pilotons votre projet du diagnostic à la livraison."}
            </p>
          </div>
        </section>

        {/* 2. INTRODUCTION MÉTHODOLOGIE */}
        <section className="freelance-intro">
          <div className="freelance-intro-container">
            <h2 className="freelance-intro-title">
              {introduction.title || "Notre méthode en détail"}
            </h2>
            <p className="freelance-intro-description">
              {introduction.description ||
                "Chaque étape est conçue pour maximiser l'impact et la qualité du projet."}
            </p>
            <p className="freelance-intro-subtitle">
              {introduction.subtitle ||
                "Une collaboration structurée et transparente."}
            </p>
            <p className="freelance-intro-details">
              {introduction.details ||
                "Du cadrage initial aux optimisations finales, nous restons à vos côtés."}
            </p>
          </div>
        </section>

        {/* 3. PROCESSUS EN ÉTAPES - Section principale */}
        <section className="freelance-process">
          <div className="freelance-process-container">
            <h2 className="freelance-process-title">
              Notre Processus en {etapesList.length} Étapes
            </h2>
            <div className="freelance-timeline">
              {etapesList.map((etape, index) => {
                const typedEtape = etape as FreelanceContent["etapes"][0];
                return (
                  <div key={index} className="freelance-timeline-item">
                    <div className="freelance-timeline-content">
                      <h3 className="freelance-timeline-nom">
                        {typedEtape.nom}
                      </h3>
                      <p className="freelance-timeline-duree">
                        {typedEtape.duree}
                      </p>
                      <p className="freelance-timeline-description">
                        {typedEtape.description}
                      </p>
                      <div className="freelance-timeline-livrables">
                        <strong>Livrables :</strong> {typedEtape.livrables}
                      </div>
                      <p className="freelance-timeline-details">
                        {typedEtape.details}
                      </p>
                    </div>
                    <div className="freelance-timeline-icon">
                      {/* Icône basée sur le nom de l'icône */}
                      {typedEtape.icone === "search" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {typedEtape.icone === "design" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {typedEtape.icone === "code" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 8L16 12L12 16L8 12L12 8Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {typedEtape.icone === "test" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 12L11 14L15 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {typedEtape.icone === "rocket" && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13 10L21.2 2.8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 6.8V2H17.2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. OUTILS & TECHNOLOGIES */}
        {outilsList.length > 0 && (
          <section className="freelance-tools">
            <div className="freelance-tools-container">
              <h2 className="freelance-tools-title">Outils & Technologies</h2>
              <div className="freelance-tools-grid">
                {outilsList.map((outil, index) => {
                  const typedOutil = outil as FreelanceContent["outils"][0];
                  return (
                    <div key={index} className="freelance-tool-item">
                      <h3 className="freelance-tool-categorie">
                        {typedOutil.categorie}
                      </h3>
                      <div className="freelance-tool-outils">
                        <strong>Outils utilisés :</strong>{" "}
                        {typedOutil.liste_outils}
                      </div>
                      <p className="freelance-tool-description">
                        {typedOutil.description}
                      </p>
                      <p className="freelance-tool-details">
                        {typedOutil.details}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. GARANTIES & ENGAGEMENT */}
        <section className="freelance-guarantees">
          <div className="freelance-guarantees-container">
            <h2 className="freelance-guarantees-title">
              Nos Garanties & Engagements
            </h2>
            <div className="freelance-guarantees-grid">
              {garantiesList.map((garantie, index) => {
                const typedGarantie =
                  garantie as FreelanceContent["garanties"][0];
                return (
                  <div key={index} className="freelance-guarantee-item">
                    <h3 className="freelance-guarantee-titre">
                      {typedGarantie.titre}
                    </h3>
                    <p className="freelance-guarantee-description">
                      {typedGarantie.description}
                    </p>
                    <p className="freelance-guarantee-details">
                      {typedGarantie.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. CTA FINAL */}
        <section className="freelance-cta">
          <div className="freelance-cta-container">
            <h2 className="freelance-cta-title">
              {cta.titre || "Envie d’en discuter ?"}
            </h2>
            <div className="freelance-cta-buttons">
              <a
                href={cta.bouton_principal_url || "/contact"}
                className="freelance-cta-primary"
              >
                {cta.bouton_principal || "Demander un devis"}
              </a>
              <a
                href={cta.bouton_secondaire_url || "/portfolio"}
                className="freelance-cta-secondary"
              >
                {cta.bouton_secondaire || "Voir nos réalisations"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
