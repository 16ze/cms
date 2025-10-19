// Base de connaissances pour l'assistant admin - Guide complet d'utilisation
export const ADMIN_KNOWLEDGE_BASE = {
  // Informations générales sur KAIRO Digital
  company: {
    name: "KAIRO Digital",
    description:
      "Agence de développement web et mobile spécialisée dans les solutions digitales innovantes",
    services: [
      "Développement web (React, Next.js, Node.js)",
      "Développement mobile (React Native, Flutter)",
      "E-commerce (Shopify, WooCommerce, solutions sur mesure)",
      "Applications web progressives (PWA)",
      "Intégration d'APIs et services tiers",
      "Maintenance et support technique",
    ],
    technologies: [
      "JavaScript/TypeScript",
      "React/Next.js",
      "Node.js/Express",
      "React Native",
      "PostgreSQL/MongoDB",
      "AWS/Vercel/Netlify",
      "Docker",
      "Git/GitHub",
    ],
  },

  // Structure de l'administration
  admin_structure: {
    navigation: {
      dashboard: {
        label: "Dashboard",
        path: "/admin/dashboard",
        description: "Vue d'ensemble et statistiques principales",
        features: [
          "Statistiques des réservations",
          "Statistiques utilisateurs",
          "Activités récentes",
          "Alertes SEO",
        ],
        common_tasks: [
          "Consulter les nouvelles réservations",
          "Voir les activités récentes",
          "Vérifier les statistiques",
        ],
      },
      reservations: {
        label: "Réservations",
        path: "/admin/reservations",
        description: "Gestion complète des rendez-vous clients",
        features: [
          "Liste de toutes les réservations",
          "Filtres par statut",
          "Recherche par client",
          "Confirmation/Annulation",
          "Déplacement de créneau",
        ],
        common_tasks: [
          "Confirmer une réservation",
          "Annuler une réservation",
          "Déplacer un créneau",
          "Voir les détails d'une réservation",
        ],
      },
      clients: {
        label: "Clients",
        path: "/admin/clients",
        description: "Base de données CRM complète",
        features: [
          "Liste de tous les contacts",
          "Ajout de nouveaux clients",
          "Modification des informations",
          "Filtres par statut et source",
          "Historique des interactions",
        ],
        common_tasks: [
          "Ajouter un nouveau client",
          "Modifier les informations d'un client",
          "Rechercher un client",
          "Exporter la liste des clients",
        ],
      },
      content: {
        label: "Contenu",
        path: "/admin/content/advanced",
        description: "Gestion du contenu du site web",
        features: [
          "Liste de toutes les pages",
          "Gestion des sections",
          "Prévisualisation en temps réel",
          "Configuration SEO par page",
        ],
        common_tasks: [
          "Modifier le contenu d'une page",
          "Ajouter une section",
          "Supprimer une section",
          "Prévisualiser les modifications",
        ],
        access: "Super Administrateur uniquement",
      },
      site: {
        label: "Site",
        path: "/admin/site",
        description: "Configuration header, footer et thèmes",
        features: [
          "Configuration du header",
          "Configuration du footer",
          "Gestion des thèmes",
          "Personnalisation visuelle",
        ],
        common_tasks: [
          "Modifier le logo",
          "Configurer le menu",
          "Personnaliser le footer",
        ],
        access: "Super Administrateur uniquement",
      },
      users: {
        label: "Utilisateurs",
        path: "/admin/users",
        description: "Gestion des administrateurs",
        features: [
          "Création d'utilisateurs",
          "Modification des rôles",
          "Gestion des permissions",
          "Suppression d'utilisateurs",
        ],
        common_tasks: [
          "Créer un nouvel admin",
          "Modifier les permissions",
          "Supprimer un utilisateur",
        ],
        access: "Super Administrateur uniquement",
      },
      settings: {
        label: "Paramètres",
        path: "/admin/settings",
        description: "Configuration générale du site",
        features: [
          "Informations générales",
          "Réseaux sociaux",
          "Configuration des réservations",
          "SEO et métadonnées",
          "Intégrations tierces",
        ],
        common_tasks: [
          "Modifier les informations de contact",
          "Configurer Google Analytics",
          "Paramétrer les réservations",
        ],
        access: "Super Administrateur uniquement",
      },
    },
    roles: {
      admin: {
        label: "Administrateur",
        icon: "🛡️",
        color: "green",
        permissions: [
          "Voir et gérer les réservations",
          "Voir et gérer les clients",
          "Voir le dashboard et statistiques",
        ],
        restrictions: [
          "Ne peut pas modifier le contenu du site",
          "Ne peut pas configurer le header/footer",
          "Ne peut pas créer/supprimer des utilisateurs",
          "Ne peut pas modifier les paramètres système",
          "Ne peut pas accéder aux outils SEO avancés",
        ],
      },
      super_admin: {
        label: "Super Administrateur",
        icon: "👑",
        color: "purple",
        permissions: [
          "Toutes les permissions d'Administrateur",
          "Gérer le contenu du site",
          "Configurer header/footer",
          "Créer et supprimer des utilisateurs",
          "Modifier tous les paramètres",
          "Utiliser tous les outils SEO",
          "Accéder à toutes les sections",
        ],
        restrictions: [],
      },
    },
  },

  // Procédures détaillées
  procedures: {
    ajouter_client: {
      steps: [
        "1. Cliquez sur 'Clients' dans le menu latéral",
        "2. Cliquez sur '+ Nouveau client' en haut à droite",
        "3. Remplissez les champs obligatoires : Prénom, Nom, Email",
        "4. Ajoutez les informations optionnelles : Téléphone, Entreprise, Adresse",
        "5. Sélectionnez le Statut : Prospect, Client ou Inactif",
        "6. Choisissez la Source : Site Web, Recommandation, Réseaux Sociaux ou Contact Direct",
        "7. Ajoutez des notes si nécessaire",
        "8. Cliquez sur 'Créer le client'",
      ],
      tips: [
        "💡 Remplissez un maximum d'informations dès le départ pour un suivi optimal",
        "💡 Le statut 'Prospect' est recommandé pour les nouveaux contacts",
        "💡 Les notes vous permettent de garder un historique des échanges",
      ],
      related_actions: [
        "Modifier un client",
        "Voir les détails",
        "Exporter les clients",
      ],
    },
    modifier_contenu_page: {
      steps: [
        "1. Cliquez sur 'Contenu' dans le menu latéral (Super Admin requis)",
        "2. Trouvez la page à modifier dans la liste",
        "3. Cliquez sur le bouton 'Modifier'",
        "4. Vous accédez à l'éditeur de page",
        "5. Modifiez le contenu des sections",
        "6. Cliquez sur 'Enregistrer' après chaque modification",
        "7. Prévisualisez pour vérifier le rendu (icône œil)",
      ],
      tips: [
        "💡 Prévisualisez toujours après une modification",
        "💡 Les modifications sont sauvegardées section par section",
        "💡 Optimisez vos images avant de les uploader (max 200 Ko)",
      ],
      related_actions: [
        "Prévisualiser une page",
        "Supprimer une section",
        "Configurer le SEO",
      ],
    },
    configurer_header: {
      steps: [
        "1. Cliquez sur 'Site' dans le menu latéral (Super Admin requis)",
        "2. Allez dans l'onglet 'Header'",
        "3. Cliquez sur 'Changer le logo' pour modifier le logo",
        "4. Uploadez votre image (PNG avec fond transparent recommandé)",
        "5. Dimensions recommandées : 200x60px à 300x90px",
        "6. Configurez le menu de navigation",
        "7. Cliquez sur 'Enregistrer'",
      ],
      tips: [
        "💡 Utilisez un logo au format PNG avec fond transparent",
        "💡 Testez le rendu sur mobile et desktop",
        "💡 Le header s'adapte automatiquement aux différentes tailles d'écran",
      ],
      related_actions: [
        "Configurer le footer",
        "Personnaliser les couleurs",
        "Gérer le menu",
      ],
    },
    gerer_reservations: {
      steps: [
        "1. Cliquez sur 'Réservations' dans le menu latéral",
        "2. Vous voyez toutes les réservations dans un tableau",
        "3. Utilisez les filtres pour afficher : Tous, En Attente, Confirmées, Annulées",
        "4. Pour CONFIRMER : Cliquez sur le bouton ✓ (coche verte)",
        "5. Pour ANNULER (En Attente) : Cliquez sur ✗ (croix rouge)",
        "6. Pour VOIR LES DÉTAILS : Cliquez sur 👁 (œil)",
        "7. Pour DÉPLACER : Depuis les détails > 'Déplacer le créneau'",
        "8. Pour ANNULER (Confirmée) : Depuis les détails > 'Annuler définitivement'",
      ],
      tips: [
        "💡 Vérifiez toujours votre agenda avant de confirmer",
        "💡 Le client reçoit automatiquement un email à chaque action",
        "💡 Soyez toujours transparent sur les raisons d'un déplacement ou d'une annulation",
        "💡 Utilisez le bouton Actualiser pour recharger les nouvelles réservations",
      ],
      related_actions: [
        "Confirmer une réservation",
        "Annuler une réservation",
        "Déplacer un créneau",
      ],
    },
    modifier_permissions: {
      steps: [
        "1. Cliquez sur 'Utilisateurs' dans le menu latéral (Super Admin requis)",
        "2. Trouvez l'utilisateur Administrateur dans la liste",
        "3. Cliquez sur l'icône 🔑 (clé) pour gérer les permissions",
        "4. Cochez/décochez les permissions souhaitées",
        "5. Options disponibles : Dashboard, Réservations, Clients, Contenu, Site",
        "6. Cliquez sur 'Enregistrer les permissions'",
      ],
      tips: [
        "💡 Les Super Admins ont toujours toutes les permissions",
        "💡 Accordez uniquement les permissions nécessaires par sécurité",
        "💡 Les changements sont effectifs immédiatement",
      ],
      related_actions: [
        "Créer un utilisateur",
        "Modifier un utilisateur",
        "Supprimer un utilisateur",
      ],
    },
    voir_statistiques: {
      steps: [
        "1. Allez sur le Dashboard (page d'accueil de l'admin)",
        "2. Vous voyez les statistiques principales en haut :",
        "   - Total Réservations",
        "   - En Attente",
        "   - Confirmées",
        "   - Cette Semaine",
        "3. Section Utilisateurs : Total, Administrateurs, Super Admins",
        "4. Activités Récentes : Dernières actions effectuées",
        "5. Alertes SEO : Si configurées, améliorations/baisses de positionnement",
      ],
      tips: [
        "💡 Consultez le dashboard quotidiennement",
        "💡 Les activités récentes montrent qui a fait quoi",
        "💡 Pour des stats détaillées, utilisez Google Analytics",
      ],
      related_actions: [
        "Configurer Google Analytics",
        "Voir les réservations",
        "Exporter les données",
      ],
    },
    configurer_google_analytics: {
      steps: [
        "1. Allez sur https://analytics.google.com",
        "2. Créez un compte Google Analytics",
        "3. Créez une propriété pour votre site",
        "4. Configurez le flux de données Web",
        "5. Copiez l'ID de mesure (format : G-XXXXXXXXXX)",
        "6. Dans votre admin, allez dans Paramètres > SEO ou Intégrations",
        "7. Collez l'ID dans le champ 'Google Analytics ID'",
        "8. Enregistrez",
        "9. Vérifiez dans Analytics > Temps réel après 5 minutes",
      ],
      tips: [
        "💡 Les données peuvent prendre 24-48h pour s'afficher complètement",
        "💡 Consultez Analytics une fois par semaine minimum",
        "💡 Utilisez les rapports Acquisition, Engagement et Conversions",
      ],
      related_actions: [
        "Configurer Google Search Console",
        "Voir les statistiques",
        "Optimiser le SEO",
      ],
      external_link: "https://analytics.google.com",
    },
  },

  // Dépannage (Troubleshooting)
  troubleshooting: {
    login_issues: {
      symptoms: [
        "Mot de passe oublié",
        "Email ou mot de passe incorrect",
        "Page blanche après connexion",
      ],
      solutions: [
        "✅ Vérifiez que vous utilisez le bon email (celui enregistré)",
        "✅ Vérifiez Caps Lock (majuscules)",
        "✅ Essayez de copier-coller le mot de passe",
        "✅ Videz le cache du navigateur (Ctrl+Shift+Suppr)",
        "✅ Essayez en navigation privée",
        "✅ Actualisez la page (F5)",
        "✅ Essayez un autre navigateur (Chrome, Firefox, Safari)",
        "✅ Vérifiez que JavaScript est activé",
      ],
      prevention: [
        "💡 Utilisez un gestionnaire de mots de passe",
        "💡 Notez votre mot de passe dans un endroit sûr",
        "💡 Contactez un Super Admin pour réinitialiser votre mot de passe",
      ],
    },
    upload_problems: {
      symptoms: [
        "Fichier trop volumineux",
        "Format de fichier non autorisé",
        "Upload qui reste bloqué",
      ],
      solutions: [
        "✅ Compressez l'image avec TinyPNG (https://tinypng.com)",
        "✅ Réduisez les dimensions (max 1920px de large)",
        "✅ Convertissez en WebP",
        "✅ Vérifiez le format : JPG, PNG, GIF, WebP, SVG, PDF, MP4",
        "✅ Vérifiez la taille : Max 10 Mo pour images, 50 Mo pour vidéos",
        "✅ Vérifiez votre connexion internet",
        "✅ Attendez 2-3 minutes (gros fichiers)",
        "✅ Actualisez la page et réessayez",
      ],
      prevention: [
        "💡 Optimisez toujours vos images avant upload",
        "💡 Utilisez le bon format pour chaque usage",
        "💡 Testez avec un fichier plus léger d'abord",
      ],
    },
    preview_not_working: {
      symptoms: [
        "Prévisualisation ne charge pas",
        "Page blanche lors de la prévisualisation",
        "Modifications non visibles",
      ],
      solutions: [
        "✅ Attendez 2-3 minutes (délai de cache)",
        "✅ Actualisez en Ctrl+F5 (force refresh)",
        "✅ Videz le cache de votre navigateur",
        "✅ Essayez en navigation privée",
        "✅ Vérifiez que la section est bien 'Active'",
        "✅ Vérifiez que la page est en statut 'Publié'",
      ],
      prevention: [
        "💡 Toujours sauvegarder avant de prévisualiser",
        "💡 Attendez quelques minutes après une modification importante",
      ],
    },
    save_issues: {
      symptoms: [
        "Erreur lors de la sauvegarde",
        "Modifications non sauvegardées",
        "Page qui ne répond plus",
      ],
      solutions: [
        "✅ Vérifiez votre connexion internet",
        "✅ Ne fermez pas la page pendant l'enregistrement",
        "✅ Réduisez la taille du contenu (textes très longs)",
        "✅ Actualisez et réessayez",
        "✅ Copiez votre contenu ailleurs puis réessayez",
        "✅ Essayez de sauvegarder section par section",
      ],
      prevention: [
        "💡 Sauvegardez régulièrement",
        "💡 Copiez votre contenu avant les grosses modifications",
        "💡 Ne travaillez pas sur plusieurs sections en même temps",
      ],
    },
    navigation_issues: {
      symptoms: [
        "Menu qui ne s'affiche pas",
        "Impossible d'accéder à une section",
        "Page 404 ou erreur 403",
      ],
      solutions: [
        "✅ Actualisez la page",
        "✅ Vérifiez que JavaScript est activé",
        "✅ Essayez en mode portrait et paysage (mobile)",
        "✅ Redémarrez votre navigateur",
        "✅ Videz le cache",
        "✅ Vérifiez vos permissions (Administrateur vs Super Admin)",
        "✅ Reconnectez-vous",
        "✅ Retournez au dashboard et naviguez depuis là",
      ],
      prevention: [
        "💡 Ne forcez pas le rafraîchissement pendant une action",
        "💡 Demandez les permissions nécessaires à un Super Admin",
        "💡 Vérifiez l'URL dans la barre d'adresse",
      ],
    },
  },

  // FAQ enrichie
  faq: [
    {
      question: "Comment créer une nouvelle réservation ?",
      answer:
        "Allez dans la section 'Réservations' du dashboard admin, puis cliquez sur 'Nouvelle réservation'. Remplissez les informations du client et sélectionnez la date/heure souhaitée.",
      category: "reservations",
    },
    {
      question: "Comment modifier le contenu du site ?",
      answer:
        "Utilisez l'éditeur de contenu dans la section 'Gestion de contenu' (Super Admin uniquement). Vous pouvez modifier les textes, images et paramètres directement depuis l'interface admin.",
      category: "content",
    },
    {
      question: "Comment gérer les utilisateurs admin ?",
      answer:
        "Seuls les Super Administrateurs peuvent gérer les utilisateurs. Allez dans 'Utilisateurs' pour créer, modifier ou supprimer des comptes admin.",
      category: "users",
    },
    {
      question: "Comment exporter les données ?",
      answer:
        "Allez dans la section concernée (Clients, Réservations, etc.) et cliquez sur le bouton 'Exporter' en haut à droite. Les données sont exportées au format CSV ou Excel.",
      category: "data",
    },
    {
      question: "Combien d'administrateurs puis-je créer ?",
      answer:
        "Illimité. Créez autant d'administrateurs que nécessaire, mais par sécurité, limitez les Super Admins à 2-3 personnes de confiance.",
      category: "users",
    },
    {
      question: "Les clients reçoivent-ils des emails automatiques ?",
      answer:
        "Oui, des emails sont envoyés automatiquement pour : Confirmation de réservation, Rappel 24h avant, Déplacement de créneau, Annulation de réservation.",
      category: "reservations",
    },
    {
      question: "Comment améliorer mon référencement ?",
      answer:
        "Actions rapides : 1) Remplissez tous les champs SEO (Titre, Description, Mots-clés), 2) Optimisez vos images, 3) Publiez du contenu régulièrement, 4) Obtenez des liens externes, 5) Soyez actif sur les réseaux sociaux, 6) Inscrivez-vous sur Google My Business.",
      category: "seo",
    },
    {
      question: "Le site est-il mobile-friendly ?",
      answer:
        "Oui, 100% responsive. Le site s'adapte automatiquement à tous les appareils : smartphones, tablettes, ordinateurs de bureau et grands écrans. Testez avec Google Mobile-Friendly Test.",
      category: "general",
    },
    {
      question: "Comment exporter la liste des clients ?",
      answer:
        "Allez dans 'Clients', cliquez sur 'Exporter' en haut à droite, choisissez le format (CSV ou Excel), et le fichier se télécharge automatiquement.",
      category: "clients",
    },
    {
      question: "Comment changer le logo du site ?",
      answer:
        "Allez dans Site > Header, cliquez sur 'Changer le logo', uploadez votre image (PNG avec fond transparent recommandé, dimensions : 200x60px à 300x90px), puis enregistrez.",
      category: "site",
    },
  ],

  // Liens externes utiles
  external_links: {
    google_analytics: {
      url: "https://analytics.google.com",
      description:
        "Google Analytics - Suivi et analyse des statistiques de votre site",
      category: "analytics",
    },
    google_search_console: {
      url: "https://search.google.com/search-console",
      description:
        "Google Search Console - Surveillance du référencement et indexation",
      category: "seo",
    },
    google_tag_manager: {
      url: "https://tagmanager.google.com",
      description: "Google Tag Manager - Gestion des balises de suivi",
      category: "analytics",
    },
    google_oauth: {
      url: "https://console.cloud.google.com/apis/credentials",
      description: "Google Cloud Console - Configuration OAuth et APIs",
      category: "integrations",
    },
    tinypng: {
      url: "https://tinypng.com",
      description: "TinyPNG - Compression d'images en ligne gratuite",
      category: "tools",
    },
    squoosh: {
      url: "https://squoosh.app",
      description: "Squoosh - Outil de compression d'images de Google",
      category: "tools",
    },
    mobile_friendly_test: {
      url: "https://search.google.com/test/mobile-friendly",
      description:
        "Google Mobile-Friendly Test - Vérifiez la compatibilité mobile",
      category: "seo",
    },
  },

  // Raccourcis clavier
  keyboard_shortcuts: {
    "Ctrl + S": "Sauvegarder (dans les éditeurs)",
    "Ctrl + F": "Rechercher dans la page",
    "Ctrl + Z": "Annuler la dernière action",
    "Ctrl + Y": "Rétablir",
    F5: "Actualiser la page",
    "Ctrl + Shift + Suppr": "Vider le cache",
    "Ctrl + Click": "Ouvrir dans un nouvel onglet",
    Échap: "Fermer une fenêtre modale",
  },

  // Glossaire
  glossary: {
    Admin: "Abréviation d'Administrateur",
    CRM: "Customer Relationship Management - Gestion de la relation client",
    Dashboard: "Tableau de bord principal",
    Meta: "Métadonnées invisibles pour les utilisateurs mais lues par Google",
    SEO: "Search Engine Optimization - Optimisation pour les moteurs de recherche",
    Slug: "URL simplifiée d'une page (ex: /a-propos)",
    "Super Admin": "Administrateur avec tous les droits",
    Widget: "Petit module ou fonctionnalité intégré",
    Cache: "Mémoire temporaire du navigateur",
    Cookie: "Petit fichier stocké pour mémoriser des informations",
    API: "Interface de programmation permettant la communication entre systèmes",
    Responsive: "Qui s'adapte à toutes les tailles d'écran",
    HTTPS: "Protocole sécurisé (cadenas 🔒)",
    Backlink: "Lien externe pointant vers votre site",
  },
};

// Classe helper pour l'assistant admin avec détection d'intention enrichie
export class AdminAssistantHelper {
  /**
   * Détecte l'intention de l'utilisateur dans sa question
   * Retourne un objet avec le type d'intention et les détails
   */
  static detectIntent(question: string): {
    type: string;
    action?: string;
    target?: string;
    issue?: string;
  } {
    const lowerQuestion = question.toLowerCase();

    // Détection des procédures (Comment faire X ?)
    if (
      lowerQuestion.match(/comment (ajouter|créer|nouveau).*(client|contact)/)
    ) {
      return { type: "procedure_request", action: "add_client" };
    }
    if (
      lowerQuestion.match(
        /comment (modifier|éditer|changer).*(contenu|page|texte)/
      )
    ) {
      return { type: "procedure_request", action: "edit_content" };
    }
    if (
      lowerQuestion.match(
        /comment (configurer|modifier|changer).*(header|entête|logo)/
      )
    ) {
      return { type: "procedure_request", action: "manage_header" };
    }
    if (
      lowerQuestion.match(
        /comment (gérer|voir|traiter).*(réservation|rdv|rendez-vous)/
      )
    ) {
      return { type: "procedure_request", action: "manage_bookings" };
    }
    if (
      lowerQuestion.match(
        /comment (modifier|gérer|changer).*(permission|utilisateur|admin)/
      )
    ) {
      return { type: "procedure_request", action: "user_management" };
    }
    if (
      lowerQuestion.match(
        /comment (voir|consulter|accéder).*(stat|statistique)/
      )
    ) {
      return { type: "procedure_request", action: "view_stats" };
    }
    if (lowerQuestion.match(/comment.*(google analytics|analytics)/)) {
      return { type: "procedure_request", action: "configure_analytics" };
    }

    // Détection de navigation (Où est X ?)
    if (
      lowerQuestion.match(
        /(où|trouver|accéder|aller).*(dashboard|tableau de bord)/
      )
    ) {
      return { type: "navigation_help", target: "dashboard" };
    }
    if (lowerQuestion.match(/(où|trouver|accéder|aller).*(réservation|rdv)/)) {
      return { type: "navigation_help", target: "reservations" };
    }
    if (lowerQuestion.match(/(où|trouver|accéder|aller).*(client|crm)/)) {
      return { type: "navigation_help", target: "clients" };
    }
    if (lowerQuestion.match(/(où|trouver|accéder|aller).*(contenu|page)/)) {
      return { type: "navigation_help", target: "content" };
    }
    if (
      lowerQuestion.match(/(où|trouver|accéder|aller).*(utilisateur|admin)/)
    ) {
      return { type: "navigation_help", target: "users" };
    }
    if (
      lowerQuestion.match(
        /(où|trouver|accéder|aller).*(paramètre|setting|configuration)/
      )
    ) {
      return { type: "navigation_help", target: "settings" };
    }

    // Détection de problèmes (dépannage)
    if (
      lowerQuestion.match(
        /(problème|erreur|bug|marche pas).*(connexion|login|mot de passe)/
      )
    ) {
      return { type: "troubleshooting", issue: "login" };
    }
    if (
      lowerQuestion.match(
        /(problème|erreur|bug|marche pas).*(upload|téléchargement|fichier)/
      )
    ) {
      return { type: "troubleshooting", issue: "upload" };
    }
    if (
      lowerQuestion.match(
        /(problème|erreur|bug|marche pas).*(prévisualisation|preview|affichage)/
      )
    ) {
      return { type: "troubleshooting", issue: "preview" };
    }
    if (
      lowerQuestion.match(
        /(problème|erreur|bug|marche pas).*(sauvegarde|enregistrement|save)/
      )
    ) {
      return { type: "troubleshooting", issue: "save" };
    }
    if (
      lowerQuestion.match(
        /(problème|erreur|bug|marche pas).*(navigation|menu|accès)/
      )
    ) {
      return { type: "troubleshooting", issue: "navigation" };
    }

    // Détection de questions sur les rôles et permissions
    if (
      lowerQuestion.match(/(différence|rôle|permission).*(admin|super admin)/)
    ) {
      return { type: "role_info", target: "roles" };
    }

    // Détection de liens externes
    if (
      lowerQuestion.match(/(lien|url|adresse).*(google analytics|analytics)/)
    ) {
      return { type: "external_link", target: "google_analytics" };
    }
    if (lowerQuestion.match(/(lien|url|adresse).*(search console|console)/)) {
      return { type: "external_link", target: "google_search_console" };
    }
    if (
      lowerQuestion.match(/(lien|url|adresse).*(tinypng|compression|image)/)
    ) {
      return { type: "external_link", target: "tinypng" };
    }

    // Par défaut : recherche dans la FAQ
    return { type: "faq_search" };
  }

  /**
   * Retourne le chemin de navigation pour une cible donnée
   */
  static getNavigationPath(target: string): string | null {
    const navigation = ADMIN_KNOWLEDGE_BASE.admin_structure.navigation;
    const navItem = navigation[target as keyof typeof navigation];
    return navItem ? navItem.path : null;
  }

  /**
   * Recherche dans la FAQ
   */
  static findBestAnswer(question: string): string | null {
    const lowerQuestion = question.toLowerCase();

    // Recherche dans la FAQ
    for (const item of ADMIN_KNOWLEDGE_BASE.faq) {
      if (
        this.calculateSimilarity(lowerQuestion, item.question.toLowerCase()) >
        0.6
      ) {
        return item.answer;
      }
    }

    // Recherche par catégorie de mots-clés
    if (
      lowerQuestion.includes("réservation") ||
      lowerQuestion.includes("rdv")
    ) {
      const faqItem = ADMIN_KNOWLEDGE_BASE.faq.find(
        (f) => f.category === "reservations"
      );
      return faqItem ? faqItem.answer : null;
    }

    if (lowerQuestion.includes("client") || lowerQuestion.includes("crm")) {
      const faqItem = ADMIN_KNOWLEDGE_BASE.faq.find(
        (f) => f.category === "clients"
      );
      return faqItem ? faqItem.answer : null;
    }

    if (lowerQuestion.includes("contenu") || lowerQuestion.includes("page")) {
      const faqItem = ADMIN_KNOWLEDGE_BASE.faq.find(
        (f) => f.category === "content"
      );
      return faqItem ? faqItem.answer : null;
    }

    return null;
  }

  /**
   * Calcule la similarité entre deux chaînes de caractères
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(" ").filter((w) => w.length > 3); // Ignorer les mots courts
    const words2 = str2.split(" ").filter((w) => w.length > 3);
    const intersection = words1.filter((word) => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  /**
   * Retourne la réponse par défaut
   */
  static getDefaultResponse(): string {
    return `Je suis l'assistant admin de KAIRO Digital 24/7. Je peux vous aider avec :

**📊 Dashboard & Statistiques**
• Consulter les statistiques
• Voir les activités récentes

**📅 Réservations**
• Confirmer une réservation
• Annuler ou déplacer un créneau
• Voir les détails

**👥 Clients (CRM)**
• Ajouter un nouveau client
• Modifier les informations
• Exporter les données

**📝 Contenu du Site** (Super Admin)
• Modifier les pages
• Gérer les sections
• Prévisualiser

**👤 Utilisateurs** (Super Admin)
• Créer des administrateurs
• Gérer les permissions

**⚙️ Paramètres & SEO** (Super Admin)
• Configuration générale
• Google Analytics
• Optimisation SEO

**🔧 Dépannage**
• Problèmes de connexion
• Problèmes d'upload
• Problèmes de sauvegarde

**Comment puis-je vous aider aujourd'hui ?**`;
  }

  /**
   * Retourne des informations sur les rôles
   */
  static getRoleInformation(): string {
    const roles = ADMIN_KNOWLEDGE_BASE.admin_structure.roles;

    return `**Différence entre les rôles :**

**${roles.admin.icon} ${roles.admin.label}** (Badge ${roles.admin.color})
✅ **Peut faire :**
${roles.admin.permissions.map((p) => `• ${p}`).join("\n")}

❌ **Ne peut pas faire :**
${roles.admin.restrictions.map((r) => `• ${r}`).join("\n")}

---

**${roles.super_admin.icon} ${roles.super_admin.label}** (Badge ${
      roles.super_admin.color
    })
✅ **Accès complet :**
${roles.super_admin.permissions.map((p) => `• ${p}`).join("\n")}

💡 **Conseil :** Pour des raisons de sécurité, limitez les Super Admins à 2-3 personnes de confiance.`;
  }

  /**
   * Retourne un lien externe avec sa description
   */
  static getExternalLink(target: string): string | null {
    const links = ADMIN_KNOWLEDGE_BASE.external_links;
    const link = links[target as keyof typeof links];

    if (link) {
      return `**${link.description}**\n\n🔗 **Lien :** ${link.url}\n\n💡 Cliquez sur le lien pour accéder directement au service.`;
    }

    return null;
  }

  /**
   * Retourne le statut du système
   */
  static getSystemStatus(): object {
    return {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      status: "active",
      features: [
        "Gestion des réservations",
        "CRM complet",
        "Éditeur de contenu avancé",
        "Gestion des utilisateurs et permissions",
        "Outils SEO intégrés",
        "Google Analytics",
        "Assistant 24/7",
      ],
    };
  }

  /**
   * Retourne un raccourci clavier avec sa description
   */
  static getKeyboardShortcut(action: string): string | null {
    const shortcuts = ADMIN_KNOWLEDGE_BASE.keyboard_shortcuts;

    for (const [shortcut, description] of Object.entries(shortcuts)) {
      if (description.toLowerCase().includes(action.toLowerCase())) {
        return `**${shortcut}** : ${description}`;
      }
    }

    return null;
  }

  /**
   * Retourne la définition d'un terme du glossaire
   */
  static getGlossaryTerm(term: string): string | null {
    const glossary = ADMIN_KNOWLEDGE_BASE.glossary;
    const normalizedTerm =
      term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();

    if (glossary[normalizedTerm as keyof typeof glossary]) {
      return `**${normalizedTerm}** : ${
        glossary[normalizedTerm as keyof typeof glossary]
      }`;
    }

    return null;
  }
}
