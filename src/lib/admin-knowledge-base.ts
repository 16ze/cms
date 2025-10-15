// Base de connaissances pour l'assistant admin
export const ADMIN_KNOWLEDGE_BASE = {
  // Informations générales sur KAIRO Digital
  company: {
    name: "KAIRO Digital",
    description: "Agence de développement web et mobile spécialisée dans les solutions digitales innovantes",
    services: [
      "Développement web (React, Next.js, Node.js)",
      "Développement mobile (React Native, Flutter)",
      "E-commerce (Shopify, WooCommerce, solutions sur mesure)",
      "Applications web progressives (PWA)",
      "Intégration d'APIs et services tiers",
      "Maintenance et support technique"
    ],
    technologies: [
      "JavaScript/TypeScript",
      "React/Next.js",
      "Node.js/Express",
      "React Native",
      "PostgreSQL/MongoDB",
      "AWS/Vercel/Netlify",
      "Docker",
      "Git/GitHub"
    ]
  },

  // FAQ fréquentes
  faq: [
    {
      question: "Comment créer une nouvelle réservation ?",
      answer: "Allez dans la section 'Réservations' du dashboard admin, puis cliquez sur 'Nouvelle réservation'. Remplissez les informations du client et sélectionnez la date/heure souhaitée."
    },
    {
      question: "Comment modifier le contenu du site ?",
      answer: "Utilisez l'éditeur de contenu dans la section 'Gestion de contenu'. Vous pouvez modifier les textes, images et paramètres directement depuis l'interface admin."
    },
    {
      question: "Comment gérer les utilisateurs admin ?",
      answer: "Seuls les Super Administrateurs peuvent gérer les utilisateurs. Allez dans 'Utilisateurs' pour créer, modifier ou supprimer des comptes admin."
    },
    {
      question: "Comment exporter les données ?",
      answer: "Utilisez les fonctionnalités d'export dans chaque section (réservations, clients, etc.). Les données sont exportées au format CSV."
    }
  ],

  // Commandes système
  systemCommands: [
    {
      command: "stats",
      description: "Affiche les statistiques du système",
      example: "Affiche-moi les stats"
    },
    {
      command: "help",
      description: "Affiche l'aide et les commandes disponibles",
      example: "Comment utiliser le système ?"
    },
    {
      command: "reservations",
      description: "Gère les réservations",
      example: "Montre-moi les nouvelles réservations"
    }
  ]
};

// Classe helper pour l'assistant admin
export class AdminAssistantHelper {
  static findBestAnswer(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    // Recherche dans la FAQ
    for (const item of ADMIN_KNOWLEDGE_BASE.faq) {
      if (this.calculateSimilarity(lowerQuestion, item.question.toLowerCase()) > 0.7) {
        return item.answer;
      }
    }

    // Recherche par mots-clés
    if (lowerQuestion.includes('réservation') || lowerQuestion.includes('booking')) {
      return "Pour gérer les réservations, allez dans la section 'Réservations' du dashboard. Vous pouvez voir, créer, modifier et confirmer les rendez-vous clients.";
    }

    if (lowerQuestion.includes('contenu') || lowerQuestion.includes('content')) {
      return "Pour modifier le contenu du site, utilisez l'éditeur de contenu dans la section 'Gestion de contenu'. Vous pouvez modifier tous les textes et images du site.";
    }

    if (lowerQuestion.includes('utilisateur') || lowerQuestion.includes('admin')) {
      return "La gestion des utilisateurs est disponible dans la section 'Utilisateurs' (accessible uniquement aux Super Administrateurs).";
    }

    if (lowerQuestion.includes('statistique') || lowerQuestion.includes('stats')) {
      return "Les statistiques sont affichées sur le dashboard principal. Vous y trouverez le nombre de réservations, utilisateurs et activités récentes.";
    }

    if (lowerQuestion.includes('aide') || lowerQuestion.includes('help')) {
      return "Je suis l'assistant admin de KAIRO Digital. Je peux vous aider avec les réservations, la gestion de contenu, les utilisateurs et les statistiques. Que souhaitez-vous savoir ?";
    }

    return null;
  }

  static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  static getDefaultResponse(): string {
    return "Je suis l'assistant admin de KAIRO Digital. Je peux vous aider avec la gestion des réservations, le contenu du site, les utilisateurs et les statistiques. Comment puis-je vous assister ?";
  }

  static getSystemStatus(): object {
    return {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      status: "active",
      features: [
        "Gestion des réservations",
        "Éditeur de contenu",
        "Gestion des utilisateurs",
        "Statistiques et rapports"
      ]
    };
  }
}
