import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Configuration du chatbot
const CHATBOT_CONFIG = {
  maxHistoryLength: 10,
  confidenceThreshold: 0.6,
  maxRetries: 3,
  fallbackTriggers: [
    "je veux parler à un humain",
    "agent humain",
    "pas satisfait",
    "problème",
    "réclamation",
    "contact humain",
  ],
};

// Base de connaissances KAIRO Digital mise à jour
const KAIRO_KNOWLEDGE_BASE = {
  services: {
    development_web: {
      title: "Développement Web",
      description:
        "Création de sites web sur mesure avec technologies modernes",
      technologies: ["React", "Next.js", "PHP", "Node.js"],
      process: "Analyse > Design > Développement > Tests > Déploiement",
      duration: "6-12 semaines selon complexité",
      price_range: "450€ à 5000€ selon complexité",
    },
    mobile_apps: {
      title: "Applications Mobiles",
      description: "Développement d'applications iOS et Android natives",
      technologies: ["React Native", "Flutter", "Swift", "Kotlin"],
      features: ["Cross-platform", "Performance native", "App Store ready"],
    },
    ecommerce: {
      title: "E-commerce",
      description: "Création de boutiques en ligne performantes",
      platforms: ["WooCommerce", "Shopify", "PrestaShop", "Sur mesure"],
      features: ["Paiement sécurisé", "Gestion des stocks", "SEO optimisé"],
    },
    seo: {
      title: "Référencement SEO",
      description: "Amélioration de la visibilité sur les moteurs de recherche",
      services: [
        "Audit technique",
        "Optimisation contenu",
        "Stratégie mots-clés",
        "Suivi performances",
      ],
      benefits: [
        "Plus de visiteurs qualifiés",
        "Visibilité 24h/24",
        "Coût d'acquisition réduit",
      ],
    },
  },
  company: {
    location: "Belfort, Bourgogne-Franche-Comté, France",
    specialties: ["Sites vitrines", "E-commerce", "Applications web", "SEO"],
    methodology: "Approche agile avec communication hebdomadaire",
    guarantees: [
      "Code source fourni",
      "Support 30 jours",
      "Livraison dans les délais",
    ],
  },
  contact: {
    email: "contact.kairodigital@gmail.com",
    phone: "+33 6 99 80 19 49",
    address: "Belfort, Bourgogne-Franche-Comté, France",
    consultation: "Gratuite et sans engagement",
    response_time: "Réponse sous 24h maximum",
    meeting_types: ["Visioconférence", "Présentiel Belfort", "Téléphone"],
  },
};

// FAQ intégrée mise à jour
const FAQ_DATA = [
  {
    question: "Combien coûte un site web ?",
    answer:
      "Nos tarifs varient de 450€ à 5000€ selon la complexité et les fonctionnalités de votre projet. Pour obtenir un devis précis adapté à vos besoins spécifiques, contactez-nous directement.",
    category: "pricing",
    keywords: ["prix", "coût", "tarif", "budget", "combien"],
  },
  {
    question: "Combien de temps pour créer un site ?",
    answer:
      "En moyenne 6-12 semaines selon la complexité. Site vitrine : 4-6 semaines, e-commerce : 8-12 semaines, application web : sur devis. Nous respectons toujours les délais annoncés.",
    category: "timeline",
    keywords: ["délai", "durée", "temps", "livraison", "quand"],
  },
  {
    question: "Quelles technologies utilisez-vous ?",
    answer:
      "Nous utilisons les technologies modernes : React, Next.js, PHP, Node.js pour le web, React Native et Flutter pour le mobile. Nous choisissons la meilleure technologie selon votre projet.",
    category: "technical",
    keywords: ["technologie", "technique", "react", "php", "node"],
  },
  {
    question: "Proposez-vous un accompagnement après livraison ?",
    answer:
      "Oui, nous fournissons un support de 30 jours inclus, puis des formules de maintenance et d'accompagnement sur mesure. Nous restons disponibles pour vos évolutions futures.",
    category: "support",
    keywords: ["support", "maintenance", "accompagnement", "après"],
  },
];

// Détection d'intentions améliorée
function detectIntent(message: string): string {
  const intents = {
    price_inquiry: ["prix", "coût", "tarif", "budget", "combien"],
    service_info: [
      "service",
      "développement",
      "création",
      "site",
      "application",
    ],
    timeline: ["délai", "temps", "durée", "quand", "combien de temps"],
    portfolio: ["réalisation", "exemple", "portfolio", "travaux", "projets"],
    contact: ["contact", "rendez-vous", "appel", "rencontrer", "discuter"],
    technical: [
      "technologie",
      "technique",
      "comment",
      "cms",
      "hébergement",
      "seo",
      "référencement",
      "responsive",
      "mobile",
      "e-commerce",
      "boutique en ligne",
      "qu'est-ce que",
      "définition",
      "expliquer",
    ],
  };

  const messageLower = message.toLowerCase();

  // Vérifier d'abord les intentions spécifiques
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => messageLower.includes(keyword))) {
      // Vérification spéciale pour éviter la confusion entre prix et délais
      if (intent === "price_inquiry" && messageLower.includes("temps")) {
        continue; // Passer à l'intention suivante si c'est une question de temps
      }
      return intent;
    }
  }

  return "general";
}

// Recherche dans la base de connaissances
function searchKnowledgeBase(query: string, intent: string): any {
  const queryLower = query.toLowerCase();

  // Recherche dans la FAQ
  const faqMatches = FAQ_DATA.filter(
    (faq) =>
      faq.keywords.some((keyword) => queryLower.includes(keyword)) ||
      faq.question.toLowerCase().includes(queryLower)
  );

  // Recherche dans les services
  const serviceMatches = Object.entries(KAIRO_KNOWLEDGE_BASE.services)
    .filter(
      ([key, service]) =>
        service.title.toLowerCase().includes(queryLower) ||
        service.description.toLowerCase().includes(queryLower)
    )
    .map(([key, service]) => service);

  return {
    faq: faqMatches,
    services: serviceMatches,
    company: KAIRO_KNOWLEDGE_BASE.company,
    contact: KAIRO_KNOWLEDGE_BASE.contact,
  };
}

// Génération de réponse intelligente mise à jour
function generateResponse(
  query: string,
  context: any,
  intent: string
): { response: string; confidence: number } {
  const queryLower = query.toLowerCase();

  // Réponses spécifiques selon l'intention
  switch (intent) {
    case "price_inquiry":
      return {
        response: `Nos tarifs varient de 450€ à 5000€ selon la complexité et les fonctionnalités de votre projet.

Pour obtenir un devis précis adapté à vos besoins spécifiques, je vous invite à me contacter directement :

📧 Email : ${KAIRO_KNOWLEDGE_BASE.contact.email}
📞 Téléphone : ${KAIRO_KNOWLEDGE_BASE.contact.phone}
📅 Vous pouvez aussi réserver un créneau de consultation gratuite

Souhaitez-vous prendre rendez-vous dès maintenant ? Vous pouvez cliquer ici pour accéder directement à notre page de consultation : /consultation`,
        confidence: 0.9,
      };

    case "timeline":
      return {
        response: `Les délais varient selon le type de projet :

• Site vitrine : 4-6 semaines
• E-commerce : 8-12 semaines
• Application web : sur devis

Nous respectons toujours les délais annoncés et vous tenons informés chaque semaine de l'avancement.`,
        confidence: 0.9,
      };

    case "portfolio":
      return {
        response: `Notre portfolio n'est pas accessible publiquement par choix, afin de préserver la confidentialité de nos clients.

Cependant, lors de notre consultation gratuite, nous pourrons vous présenter des exemples de réalisations pertinents pour votre secteur d'activité et vos besoins spécifiques.

Souhaitez-vous programmer une consultation pour découvrir nos travaux ?`,
        confidence: 0.85,
      };

    case "contact":
      return {
        response: `Je peux vous aider à programmer une consultation gratuite avec notre équipe !

Choisissez votre mode de contact préféré :

🎥 Visioconférence (Zoom/Teams)
🏢 Rendez-vous à Belfort
📞 Appel téléphonique

📧 Email : ${KAIRO_KNOWLEDGE_BASE.contact.email}
📞 Téléphone : ${KAIRO_KNOWLEDGE_BASE.contact.phone}
📍 Localisation : ${KAIRO_KNOWLEDGE_BASE.contact.address}

⏱️ ${KAIRO_KNOWLEDGE_BASE.contact.response_time}
🆓 ${KAIRO_KNOWLEDGE_BASE.contact.consultation}

Quel créneau vous conviendrait le mieux ? 

Vous pouvez aussi cliquer ici pour accéder directement à notre page de consultation : /consultation`,
        confidence: 0.9,
      };

    case "technical":
      // Définitions techniques détaillées
      if (queryLower.includes("seo") || queryLower.includes("référencement")) {
        return {
          response: `Le SEO (Search Engine Optimization) ou référencement naturel est l'ensemble des techniques qui permettent d'améliorer la visibilité de votre site web sur les moteurs de recherche comme Google.

🎯 **Objectif** : Apparaître dans les premiers résultats de recherche

📈 **Avantages** :
• Plus de visiteurs qualifiés
• Visibilité 24h/24, 7j/7
• Coût d'acquisition client réduit
• Crédibilité renforcée

🔧 **Notre approche SEO** :
• Audit technique complet
• Optimisation du contenu
• Amélioration de la vitesse
• Stratégie de mots-clés
• Suivi des performances

Voulez-vous en savoir plus sur nos services SEO ou programmer une consultation ?`,
          confidence: 0.9,
        };
      }

      if (
        queryLower.includes("développement web") ||
        queryLower.includes("création site")
      ) {
        return {
          response: `Le développement web consiste à créer des sites internet et applications web sur mesure, adaptés à vos besoins spécifiques.

💻 **Types de projets** :
• Sites vitrines professionnels
• Boutiques e-commerce
• Applications web métier
• Plateformes personnalisées

🛠️ **Technologies utilisées** :
• Frontend : HTML, CSS, JavaScript, React
• Backend : PHP, Node.js, Python
• Bases de données : MySQL, PostgreSQL
• CMS : WordPress, solutions sur mesure

⭐ **Nos atouts** :
• Code propre et optimisé
• Design responsive (mobile-friendly)
• Sécurité renforcée
• SEO intégré dès la conception
• Maintenance et support inclus

Souhaitez-vous discuter de votre projet web ?`,
          confidence: 0.9,
        };
      }

      if (queryLower.includes("responsive") || queryLower.includes("mobile")) {
        return {
          response: `Le design responsive (ou adaptatif) garantit que votre site s'affiche parfaitement sur tous les appareils : ordinateurs, tablettes et smartphones.

📱 **Pourquoi c'est essentiel** :
• 60% du trafic web vient du mobile
• Google favorise les sites mobile-friendly
• Meilleure expérience utilisateur
• Un seul site pour tous les appareils

Tous nos sites sont conçus responsive par défaut.`,
          confidence: 0.8,
        };
      }

      if (
        queryLower.includes("cms") ||
        queryLower.includes("système de gestion")
      ) {
        return {
          response: `Un CMS (Content Management System) est un système qui vous permet de modifier facilement le contenu de votre site sans connaissances techniques.

✅ **Avantages** :
• Modification autonome du contenu
• Interface intuitive
• Gestion des images et médias
• Mises à jour faciles

🔧 **Nos solutions** :
• WordPress personnalisé
• CMS sur mesure
• Interface d'administration simplifiée

Voulez-vous en savoir plus sur nos solutions CMS ?`,
          confidence: 0.8,
        };
      }

      if (
        queryLower.includes("e-commerce") ||
        queryLower.includes("boutique en ligne")
      ) {
        return {
          response: `L'e-commerce permet de vendre vos produits ou services directement en ligne, 24h/24.

🛒 **Fonctionnalités incluses** :
• Catalogue produits
• Panier et commandes
• Paiement sécurisé
• Gestion des stocks
• Suivi des livraisons
• Espace client

💳 **Moyens de paiement** :
• Carte bancaire (Stripe, PayPal)
• Virement, chèque
• Paiement en plusieurs fois

📊 **Outils de gestion** :
• Dashboard de vente
• Statistiques détaillées
• Gestion des clients

Intéressé par une boutique en ligne ?`,
          confidence: 0.8,
        };
      }

      return {
        response: `Je vois que vous vous intéressez à nos services techniques. 

Pouvez-vous préciser votre question ? Je peux vous expliquer :
• Le développement web
• Le référencement SEO
• Les boutiques e-commerce
• Les CMS et systèmes de gestion
• Le design responsive

Ou souhaitez-vous programmer une consultation pour discuter de votre projet ?`,
        confidence: 0.7,
      };

    default:
      // Recherche générique dans la base de connaissances
      const knowledge = searchKnowledgeBase(query, intent);

      if (knowledge.faq.length > 0) {
        return {
          response: knowledge.faq[0].answer,
          confidence: 0.8,
        };
      }

      if (knowledge.services.length > 0) {
        const service = knowledge.services[0];
        return {
          response: `Je vois que vous vous intéressez à nos services de ${service.title.toLowerCase()}. 

${service.description}

Voulez-vous plus de détails sur ce service ou souhaitez-vous discuter de votre projet ?`,
          confidence: 0.7,
        };
      }

      return {
        response: `Bonjour ! Je suis l'assistant KAIRO Digital. 

Je peux vous aider avec :
• Nos services et tarifs (450€ à 5000€)
• Nos délais de réalisation  
• Prendre rendez-vous
• Explications techniques (SEO, développement web, etc.)

Que souhaitez-vous savoir ?`,
        confidence: 0.6,
      };
  }
}

// Vérification du fallback
function shouldTriggerFallback(
  message: string,
  confidence: number,
  retryCount: number
): boolean {
  const messageLower = message.toLowerCase();

  // Déclenchement explicite
  if (
    CHATBOT_CONFIG.fallbackTriggers.some((trigger) =>
      messageLower.includes(trigger)
    )
  ) {
    return true;
  }

  // Confiance faible après plusieurs tentatives
  if (
    confidence < CHATBOT_CONFIG.confidenceThreshold &&
    retryCount >= CHATBOT_CONFIG.maxRetries
  ) {
    return true;
  }

  return false;
}

// Réponse de fallback mise à jour
function getFallbackResponse(): string {
  return `Je ne suis pas sûr de bien comprendre votre question. Pouvez-vous la reformuler ?

Ou souhaitez-vous :
• Parler de votre projet web
• Connaître nos tarifs (450€ à 5000€)
• Prendre rendez-vous
• Contacter directement notre équipe

📧 Email : ${KAIRO_KNOWLEDGE_BASE.contact.email}
📞 Téléphone : ${KAIRO_KNOWLEDGE_BASE.contact.phone}

⏱️ ${KAIRO_KNOWLEDGE_BASE.contact.response_time}
🆓 ${KAIRO_KNOWLEDGE_BASE.contact.consultation}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, conversationHistory = [] } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message et sessionId requis" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Détecter l'intention
    const intent = detectIntent(message);

    // Générer la réponse
    const { response, confidence } = generateResponse(
      message,
      conversationHistory,
      intent
    );

    // Vérifier si fallback nécessaire
    const retryCount = conversationHistory.filter(
      (msg) => msg.senderType === "user"
    ).length;
    const shouldFallback = shouldTriggerFallback(
      message,
      confidence,
      retryCount
    );

    const finalResponse = shouldFallback ? getFallbackResponse() : response;
    const responseTime = Date.now() - startTime;

    // Sauvegarder la conversation en base
    try {
      // Trouver ou créer la conversation
      let conversation = await prisma.chatbotConversation.findUnique({
        where: { sessionId },
      });

      if (!conversation) {
        const headersList = await headers();
        conversation = await prisma.chatbotConversation.create({
          data: {
            sessionId,
            userIp: request.ip || null,
            userAgent: headersList.get("user-agent") || null,
            pageUrl: headersList.get("referer") || null,
          },
        });
      } else {
        // Mettre à jour l'activité
        await prisma.chatbotConversation.update({
          where: { id: conversation.id },
          data: { lastActivity: new Date() },
        });
      }

      // Sauvegarder le message utilisateur
      await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: "user",
          messageContent: message,
          intent: intent,
        },
      });

      // Sauvegarder la réponse du bot
      await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: "bot",
          messageContent: finalResponse,
          contextUsed: { intent, confidence, shouldFallback },
          responseTimeMs: responseTime,
          confidence: confidence,
          intent: intent,
        },
      });

      // Analytics
      const analyticsHeaders = await headers();
      await prisma.chatbotAnalytics.create({
        data: {
          sessionId,
          eventType: "message_sent",
          eventData: {
            intent,
            confidence,
            responseTime,
            shouldFallback,
          },
          pageUrl: analyticsHeaders.get("referer") || null,
        },
      });
    } catch (dbError) {
      console.error("Erreur base de données chatbot:", dbError);
      // Continuer même si la sauvegarde échoue
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      confidence: confidence,
      intent: intent,
      shouldFallback: shouldFallback,
      responseTime: responseTime,
    });
  } catch (error) {
    console.error("Erreur chatbot:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        fallbackResponse:
          "Désolé, je rencontre un problème technique. Veuillez nous contacter directement à contact@kairodigital.fr",
      },
      { status: 500 }
    );
  }
}
