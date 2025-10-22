const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('🌱 Début du seed des templates...');

  try {
    // Nettoyer les données existantes
    await prisma.templateCustomization.deleteMany();
    await prisma.siteTemplate.deleteMany();
    await prisma.templateSidebarConfig.deleteMany();
    await prisma.templatePage.deleteMany();
    await prisma.template.deleteMany();

    console.log('🧹 Données existantes supprimées');

    // 1. TEMPLATE CORPORATE
    const corporateTemplate = await prisma.template.create({
      data: {
        name: 'corporate',
        displayName: 'Corporate Professionnel',
        description: 'Template pour entreprises et organisations professionnelles',
        category: 'CORPORATE',
        configJson: {
          colors: { primary: '#2563eb', secondary: '#64748b' },
          layout: 'modern',
          sections: ['hero', 'services', 'about', 'contact']
        },
        isActive: true,
        isDefault: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil', component: 'HomePage', orderIndex: 1, isRequired: true },
            { slug: 'services', title: 'Services', description: 'Nos services', component: 'ServicesPage', orderIndex: 2, isRequired: true },
            { slug: 'apropos', title: 'À propos', description: 'Notre entreprise', component: 'AboutPage', orderIndex: 3, isRequired: true },
            { slug: 'contact', title: 'Contact', description: 'Nous contacter', component: 'ContactPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'projets', label: 'Projets', icon: 'FolderOpen', href: '/admin/projets', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'equipe', label: 'Équipe', icon: 'Users', href: '/admin/equipe', orderIndex: 2, category: 'CONTENT' }
          ]
        }
      }
    });

    // 2. TEMPLATE E-COMMERCE
    const ecommerceTemplate = await prisma.template.create({
      data: {
        name: 'ecommerce',
        displayName: 'E-commerce Moderne',
        description: 'Template pour boutiques en ligne et vente de produits',
        category: 'ECOMMERCE',
        configJson: {
          colors: { primary: '#059669', secondary: '#6b7280' },
          layout: 'shop',
          sections: ['hero', 'products', 'categories', 'cart']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil boutique', component: 'ShopHomePage', orderIndex: 1, isRequired: true },
            { slug: 'produits', title: 'Produits', description: 'Catalogue produits', component: 'ProductsPage', orderIndex: 2, isRequired: true },
            { slug: 'categories', title: 'Catégories', description: 'Catégories produits', component: 'CategoriesPage', orderIndex: 3, isRequired: true },
            { slug: 'panier', title: 'Panier', description: 'Panier d\'achat', component: 'CartPage', orderIndex: 4, isRequired: true },
            { slug: 'commande', title: 'Commande', description: 'Processus commande', component: 'CheckoutPage', orderIndex: 5, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'produits', label: 'Produits', icon: 'Package', href: '/admin/produits', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'commandes', label: 'Commandes', icon: 'ShoppingCart', href: '/admin/commandes', orderIndex: 2, category: 'RESERVATION' },
            { elementId: 'inventaire', label: 'Inventaire', icon: 'BarChart3', href: '/admin/inventaire', orderIndex: 3, category: 'CONTENT' }
          ]
        }
      }
    });

    // 3. TEMPLATE PORTFOLIO
    const portfolioTemplate = await prisma.template.create({
      data: {
        name: 'portfolio',
        displayName: 'Portfolio Créatif',
        description: 'Template pour portfolios d\'artistes, designers et créatifs',
        category: 'PORTFOLIO',
        configJson: {
          colors: { primary: '#7c3aed', secondary: '#6b7280' },
          layout: 'gallery',
          sections: ['hero', 'gallery', 'about', 'contact']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Portfolio principal', component: 'PortfolioHomePage', orderIndex: 1, isRequired: true },
            { slug: 'galerie', title: 'Galerie', description: 'Mes réalisations', component: 'GalleryPage', orderIndex: 2, isRequired: true },
            { slug: 'apropos', title: 'À propos', description: 'Mon parcours', component: 'AboutPage', orderIndex: 3, isRequired: true },
            { slug: 'contact', title: 'Contact', description: 'Me contacter', component: 'ContactPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'galerie', label: 'Galerie', icon: 'Image', href: '/admin/galerie', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'projets', label: 'Projets', icon: 'FolderOpen', href: '/admin/projets', orderIndex: 2, category: 'CONTENT' }
          ]
        }
      }
    });

    // 4. TEMPLATE BLOG
    const blogTemplate = await prisma.template.create({
      data: {
        name: 'blog',
        displayName: 'Blog Editorial',
        description: 'Template pour blogs, magazines et contenus éditoriaux',
        category: 'BLOG',
        configJson: {
          colors: { primary: '#ea580c', secondary: '#6b7280' },
          layout: 'magazine',
          sections: ['hero', 'articles', 'categories', 'authors']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil blog', component: 'BlogHomePage', orderIndex: 1, isRequired: true },
            { slug: 'articles', title: 'Articles', description: 'Liste des articles', component: 'ArticlesPage', orderIndex: 2, isRequired: true },
            { slug: 'categories', title: 'Catégories', description: 'Catégories d\'articles', component: 'CategoriesPage', orderIndex: 3, isRequired: true },
            { slug: 'auteurs', title: 'Auteurs', description: 'Équipe éditoriale', component: 'AuthorsPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'articles', label: 'Articles', icon: 'FileText', href: '/admin/articles', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'categories', label: 'Catégories', icon: 'Layers', href: '/admin/categories', orderIndex: 2, category: 'CONTENT' },
            { elementId: 'auteurs', label: 'Auteurs', icon: 'Users', href: '/admin/auteurs', orderIndex: 3, category: 'CONTENT' }
          ]
        }
      }
    });

    // 5. TEMPLATE RESTAURANT
    const restaurantTemplate = await prisma.template.create({
      data: {
        name: 'restaurant',
        displayName: 'Restaurant & Gastronomie',
        description: 'Template pour restaurants, cafés et établissements gastronomiques',
        category: 'RESTAURANT',
        configJson: {
          colors: { primary: '#dc2626', secondary: '#6b7280' },
          layout: 'restaurant',
          sections: ['hero', 'menu', 'reservations', 'contact']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil restaurant', component: 'RestaurantHomePage', orderIndex: 1, isRequired: true },
            { slug: 'menu', title: 'Menu', description: 'Carte des plats', component: 'MenuPage', orderIndex: 2, isRequired: true },
            { slug: 'reservations', title: 'Réservations', description: 'Réserver une table', component: 'ReservationsPage', orderIndex: 3, isRequired: true },
            { slug: 'contact', title: 'Contact', description: 'Nous contacter', component: 'ContactPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'menu', label: 'Menu', icon: 'FileText', href: '/admin/menu', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'reservations', label: 'Réservations', icon: 'Calendar', href: '/admin/reservations', orderIndex: 2, category: 'RESERVATION' },
            { elementId: 'tables', label: 'Gestion Tables', icon: 'BarChart3', href: '/admin/tables', orderIndex: 3, category: 'CONTENT' }
          ]
        }
      }
    });

    // 6. TEMPLATE BIEN-ÊTRE & FITNESS
    const wellnessTemplate = await prisma.template.create({
      data: {
        name: 'wellness',
        displayName: 'Bien-être & Fitness',
        description: 'Template pour centres de bien-être, salles de sport et thérapeutes',
        category: 'WELLNESS',
        configJson: {
          colors: { primary: '#0d9488', secondary: '#6b7280' },
          layout: 'wellness',
          sections: ['hero', 'services', 'coaches', 'booking']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil bien-être', component: 'WellnessHomePage', orderIndex: 1, isRequired: true },
            { slug: 'services', title: 'Services', description: 'Nos services bien-être', component: 'ServicesPage', orderIndex: 2, isRequired: true },
            { slug: 'coaches', title: 'Coaches', description: 'Nos professionnels', component: 'CoachesPage', orderIndex: 3, isRequired: true },
            { slug: 'reservation', title: 'Réservation', description: 'Réserver un cours', component: 'BookingPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'cours', label: 'Cours', icon: 'Calendar', href: '/admin/cours', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'coaches', label: 'Coaches', icon: 'Users', href: '/admin/coaches', orderIndex: 2, category: 'CONTENT' },
            { elementId: 'reservations', label: 'Réservations', icon: 'CalendarRange', href: '/admin/reservations', orderIndex: 3, category: 'RESERVATION' },
            { elementId: 'planning', label: 'Planning', icon: 'BarChart3', href: '/admin/planning', orderIndex: 4, category: 'CONTENT' }
          ]
        }
      }
    });

    // 7. TEMPLATE BEAUTÉ & ESTHÉTIQUE
    const beautyTemplate = await prisma.template.create({
      data: {
        name: 'beauty',
        displayName: 'Beauté & Esthétique',
        description: 'Template pour instituts de beauté, salons et centres esthétiques',
        category: 'BEAUTY',
        configJson: {
          colors: { primary: '#ec4899', secondary: '#6b7280' },
          layout: 'beauty',
          sections: ['hero', 'treatments', 'team', 'booking']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil beauté', component: 'BeautyHomePage', orderIndex: 1, isRequired: true },
            { slug: 'soins', title: 'Soins', description: 'Nos soins esthétiques', component: 'TreatmentsPage', orderIndex: 2, isRequired: true },
            { slug: 'equipe', title: 'Équipe', description: 'Nos esthéticiennes', component: 'TeamPage', orderIndex: 3, isRequired: true },
            { slug: 'reservation', title: 'Réservation', description: 'Réserver un soin', component: 'BookingPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'soins', label: 'Soins', icon: 'FileText', href: '/admin/soins', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'equipe', label: 'Équipe', icon: 'Users', href: '/admin/equipe', orderIndex: 2, category: 'CONTENT' },
            { elementId: 'reservations', label: 'Réservations', icon: 'CalendarRange', href: '/admin/reservations', orderIndex: 3, category: 'RESERVATION' },
            { elementId: 'planning', label: 'Planning', icon: 'BarChart3', href: '/admin/planning', orderIndex: 4, category: 'CONTENT' }
          ]
        }
      }
    });

    // 8. TEMPLATE CONSULTATION & THÉRAPIE
    const consultationTemplate = await prisma.template.create({
      data: {
        name: 'consultation',
        displayName: 'Consultation & Thérapie',
        description: 'Template pour thérapeutes, psychologues et professionnels de santé',
        category: 'CONSULTATION',
        configJson: {
          colors: { primary: '#2563eb', secondary: '#6b7280' },
          layout: 'consultation',
          sections: ['hero', 'services', 'therapists', 'booking']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil consultation', component: 'ConsultationHomePage', orderIndex: 1, isRequired: true },
            { slug: 'services', title: 'Services', description: 'Nos services thérapeutiques', component: 'ServicesPage', orderIndex: 2, isRequired: true },
            { slug: 'therapeutes', title: 'Thérapeutes', description: 'Nos professionnels', component: 'TherapistsPage', orderIndex: 3, isRequired: true },
            { slug: 'rendez-vous', title: 'Rendez-vous', description: 'Prendre rendez-vous', component: 'AppointmentPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'patients', label: 'Patients', icon: 'Users', href: '/admin/patients', orderIndex: 1, category: 'CLIENT' },
            { elementId: 'therapeutes', label: 'Thérapeutes', icon: 'UserPlus', href: '/admin/therapeutes', orderIndex: 2, category: 'CONTENT' },
            { elementId: 'rendez-vous', label: 'Rendez-vous', icon: 'CalendarRange', href: '/admin/rendez-vous', orderIndex: 3, category: 'RESERVATION' },
            { elementId: 'planning', label: 'Planning', icon: 'BarChart3', href: '/admin/planning', orderIndex: 4, category: 'CONTENT' }
          ]
        }
      }
    });

    // 9. TEMPLATE PRESTATIONS PROFESSIONNELLES
    const servicesTemplate = await prisma.template.create({
      data: {
        name: 'services',
        displayName: 'Prestations Professionnelles',
        description: 'Template pour consultants, freelances et prestataires de services',
        category: 'SERVICES',
        configJson: {
          colors: { primary: '#4f46e5', secondary: '#6b7280' },
          layout: 'services',
          sections: ['hero', 'services', 'portfolio', 'contact']
        },
        isActive: true,
        pages: {
          create: [
            { slug: 'accueil', title: 'Accueil', description: 'Page d\'accueil services', component: 'ServicesHomePage', orderIndex: 1, isRequired: true },
            { slug: 'services', title: 'Services', description: 'Nos prestations', component: 'ServicesPage', orderIndex: 2, isRequired: true },
            { slug: 'portfolio', title: 'Portfolio', description: 'Nos réalisations', component: 'PortfolioPage', orderIndex: 3, isRequired: true },
            { slug: 'contact', title: 'Contact', description: 'Nous contacter', component: 'ContactPage', orderIndex: 4, isRequired: true }
          ]
        },
        sidebarConfigs: {
          create: [
            { elementId: 'projets', label: 'Projets', icon: 'FolderOpen', href: '/admin/projets', orderIndex: 1, category: 'CONTENT' },
            { elementId: 'clients', label: 'Clients', icon: 'Users', href: '/admin/clients', orderIndex: 2, category: 'CLIENT' },
            { elementId: 'devis', label: 'Devis', icon: 'FileText', href: '/admin/devis', orderIndex: 3, category: 'CONTENT' },
            { elementId: 'facturation', label: 'Facturation', icon: 'BarChart3', href: '/admin/facturation', orderIndex: 4, category: 'CONTENT' }
          ]
        }
      }
    });

    // Activer le template Corporate par défaut
    await prisma.siteTemplate.create({
      data: {
        siteId: 'main',
        templateId: corporateTemplate.id,
        isActive: true
      }
    });

    console.log('✅ 9 templates créés avec succès !');
    console.log('📊 Résumé :');
    console.log(`   - Corporate: ${corporateTemplate.id}`);
    console.log(`   - E-commerce: ${ecommerceTemplate.id}`);
    console.log(`   - Portfolio: ${portfolioTemplate.id}`);
    console.log(`   - Blog: ${blogTemplate.id}`);
    console.log(`   - Restaurant: ${restaurantTemplate.id}`);
    console.log(`   - Bien-être: ${wellnessTemplate.id}`);
    console.log(`   - Beauté: ${beautyTemplate.id}`);
    console.log(`   - Consultation: ${consultationTemplate.id}`);
    console.log(`   - Prestations Pro: ${servicesTemplate.id}`);
    console.log('🎯 Template Corporate activé par défaut');

  } catch (error) {
    console.error('❌ Erreur lors du seed des templates:', error);
    throw error;
  }
}

// Exécuter le seed
seedTemplates()
  .then(() => {
    console.log('🎉 Seed terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
