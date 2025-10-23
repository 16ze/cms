const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedAllTemplates() {
  console.log("🌱 Début du seed complet de tous les templates...\n");

  try {
    // ===== CORPORATE (déjà fait via seed-projects-team.ts) =====
    console.log("✅ Corporate: Projets & Équipe (déjà seedé)");

    // ===== E-COMMERCE =====
    console.log("\n🛒 E-commerce: Création des produits...");

    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "MacBook Pro 16",
          slug: "macbook-pro-16",
          description:
            "Ordinateur portable haute performance pour professionnels",
          price: 2499.99,
          comparePrice: 2799.99,
          category: "Ordinateurs",
          brand: "Apple",
          sku: "MBP16-2024",
          quantity: 15,
          featured: true,
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "iPhone 15 Pro",
          slug: "iphone-15-pro",
          description: "Smartphone premium avec appareil photo professionnel",
          price: 1199.99,
          category: "Smartphones",
          brand: "Apple",
          sku: "IP15P-2024",
          quantity: 50,
          featured: true,
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "AirPods Pro",
          slug: "airpods-pro",
          description: "Écouteurs sans fil avec réduction de bruit active",
          price: 279.99,
          category: "Audio",
          brand: "Apple",
          sku: "APP-2024",
          quantity: 100,
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ ${products.length} produits créés`);

    // ===== BLOG =====
    console.log("\n📝 Blog: Création des auteurs et articles...");

    const author = await prisma.author.create({
      data: {
        firstName: "Jean",
        lastName: "Dupont",
        slug: "jean-dupont",
        bio: "Journaliste tech passionné par l'innovation",
        email: "jean.dupont@blog.com",
        isActive: true,
      },
    });

    const category = await prisma.articleCategory.create({
      data: {
        name: "Technologie",
        slug: "technologie",
        description: "Articles sur les dernières technologies",
        color: "#3B82F6",
        orderIndex: 1,
      },
    });

    const articles = await Promise.all([
      prisma.article.create({
        data: {
          title: "L'avenir de l'Intelligence Artificielle",
          slug: "avenir-intelligence-artificielle",
          excerpt: "Découvrez comment l'IA transforme notre quotidien",
          content: "Article complet sur l'IA et ses applications...",
          authorId: author.id,
          categoryId: category.id,
          status: "PUBLISHED",
          featured: true,
          publishedAt: new Date(),
        },
      }),
      prisma.article.create({
        data: {
          title: "Les tendances du développement web en 2024",
          slug: "tendances-dev-web-2024",
          excerpt: "Les frameworks et technologies à surveiller",
          content: "Article sur React, Next.js, et plus encore...",
          authorId: author.id,
          categoryId: category.id,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ]);
    console.log(`✅ 1 auteur, 1 catégorie, ${articles.length} articles créés`);

    // ===== RESTAURANT =====
    console.log("\n🍽️ Restaurant: Création du menu et tables...");

    const menuItems = await Promise.all([
      prisma.menuItem.create({
        data: {
          name: "Burger Gourmet",
          slug: "burger-gourmet",
          description: "Pain artisanal, bœuf Angus, fromage affiné",
          category: "MAIN_COURSE",
          price: 18.5,
          isAvailable: true,
          isFeatured: true,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Salade César",
          slug: "salade-cesar",
          description: "Laitue romaine, poulet grillé, parmesan",
          category: "APPETIZER",
          price: 12.0,
          isAvailable: true,
        },
      }),
      prisma.menuItem.create({
        data: {
          name: "Tiramisu Maison",
          slug: "tiramisu-maison",
          description: "Dessert italien traditionnel",
          category: "DESSERT",
          price: 8.5,
          isAvailable: true,
        },
      }),
    ]);

    const tables = await Promise.all([
      prisma.restaurantTable.create({
        data: {
          number: "1",
          capacity: 2,
          location: "INDOOR",
          isAvailable: true,
        },
      }),
      prisma.restaurantTable.create({
        data: {
          number: "2",
          capacity: 4,
          location: "TERRACE",
          isAvailable: true,
        },
      }),
      prisma.restaurantTable.create({
        data: {
          number: "3",
          capacity: 6,
          location: "INDOOR",
          isAvailable: true,
        },
      }),
    ]);
    console.log(`✅ ${menuItems.length} plats, ${tables.length} tables créés`);

    // ===== BIEN-ÊTRE =====
    console.log("\n🧘 Bien-être: Création des coaches et cours...");

    const coach = await prisma.wellnessCoach.create({
      data: {
        firstName: "Marie",
        lastName: "Leblanc",
        slug: "marie-leblanc",
        specialty: "Yoga & Pilates",
        bio: "Instructrice certifiée avec 10 ans d'expérience",
        isActive: true,
      },
    });

    const courses = await Promise.all([
      prisma.wellnessCourse.create({
        data: {
          name: "Yoga Matinal",
          slug: "yoga-matinal",
          description: "Commencez la journée en douceur",
          category: "Yoga",
          duration: 60,
          capacity: 15,
          price: 25.0,
          coachId: coach.id,
          isActive: true,
        },
      }),
      prisma.wellnessCourse.create({
        data: {
          name: "Pilates Intensif",
          slug: "pilates-intensif",
          description: "Renforcement musculaire profond",
          category: "Pilates",
          duration: 45,
          capacity: 10,
          price: 30.0,
          coachId: coach.id,
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ 1 coach, ${courses.length} cours créés`);

    // ===== BEAUTÉ =====
    console.log("\n💄 Beauté: Création des soins...");

    const treatments = await Promise.all([
      prisma.beautyTreatment.create({
        data: {
          name: "Soin Visage Hydratant",
          slug: "soin-visage-hydratant",
          description: "Soin en profondeur pour peau déshydratée",
          category: "Visage",
          duration: 60,
          price: 75.0,
          isActive: true,
        },
      }),
      prisma.beautyTreatment.create({
        data: {
          name: "Manucure Complète",
          slug: "manucure-complete",
          description: "Soin des mains et pose de vernis",
          category: "Mains",
          duration: 45,
          price: 35.0,
          isActive: true,
        },
      }),
      prisma.beautyTreatment.create({
        data: {
          name: "Massage Relaxant",
          slug: "massage-relaxant",
          description: "Massage corps entier aux huiles essentielles",
          category: "Massage",
          duration: 90,
          price: 95.0,
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ ${treatments.length} soins créés`);

    // ===== CONSULTATION =====
    console.log("\n🩺 Consultation: Création des thérapeutes et patients...");

    const therapist = await prisma.therapist.create({
      data: {
        firstName: "Dr. Sophie",
        lastName: "Martin",
        slug: "dr-sophie-martin",
        specialty: "Psychologie Clinique",
        bio: "Psychologue spécialisée en thérapies cognitives",
        isActive: true,
      },
    });

    const patients = await Promise.all([
      prisma.patient.create({
        data: {
          firstName: "Pierre",
          lastName: "Dubois",
          email: "pierre.dubois@email.com",
          phone: "+33612345678",
          isActive: true,
        },
      }),
      prisma.patient.create({
        data: {
          firstName: "Claire",
          lastName: "Lefebvre",
          email: "claire.lefebvre@email.com",
          phone: "+33623456789",
          isActive: true,
        },
      }),
    ]);
    console.log(`✅ 1 thérapeute, ${patients.length} patients créés`);

    // ===== PRESTATIONS PRO =====
    console.log("\n💼 Prestations Pro: Création des clients et devis...");

    const serviceClient = await prisma.serviceClient.create({
      data: {
        companyName: "Tech Innovations SAS",
        contactName: "Marc Durand",
        email: "contact@techinnovations.fr",
        phone: "+33687654321",
        isActive: true,
      },
    });

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `QT-${Date.now()}`,
        clientId: serviceClient.id,
        title: "Développement Site Web",
        description: "Site vitrine moderne et responsive",
        items: JSON.stringify([
          { description: "Design UI/UX", quantity: 1, price: 2000 },
          { description: "Développement", quantity: 1, price: 5000 },
        ]),
        subtotal: 7000,
        tax: 1400,
        total: 8400,
        status: "SENT",
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        clientId: serviceClient.id,
        title: "Site Web Tech Innovations",
        description: "Paiement première phase",
        items: JSON.stringify([
          { description: "Acompte 50%", quantity: 1, price: 4200 },
        ]),
        subtotal: 4200,
        tax: 840,
        total: 5040,
        status: "SENT",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✅ 1 client, 1 devis, 1 facture créés`);

    // ===== PORTFOLIO =====
    console.log("\n🎨 Portfolio: Création de la galerie...");

    const galleryItems = await Promise.all([
      prisma.galleryItem.create({
        data: {
          title: "Design Moderne",
          slug: "design-moderne",
          description: "Interface utilisateur épurée",
          imageUrl: "/images/gallery/design1.jpg",
          category: "UI/UX",
          featured: true,
        },
      }),
      prisma.galleryItem.create({
        data: {
          title: "Photographie Corporate",
          slug: "photo-corporate",
          description: "Shooting professionnel entreprise",
          imageUrl: "/images/gallery/photo1.jpg",
          category: "Photographie",
        },
      }),
    ]);
    console.log(`✅ ${galleryItems.length} éléments de galerie créés`);

    console.log("\n🎉 Seed complet terminé avec succès !");
    console.log("\n📊 RÉSUMÉ GLOBAL:");
    console.log("  ✅ Corporate: Projets & Équipe (déjà seedé)");
    console.log(`  ✅ E-commerce: ${products.length} produits`);
    console.log(
      `  ✅ Blog: 1 auteur, 1 catégorie, ${articles.length} articles`
    );
    console.log(
      `  ✅ Restaurant: ${menuItems.length} plats, ${tables.length} tables`
    );
    console.log(`  ✅ Bien-être: 1 coach, ${courses.length} cours`);
    console.log(`  ✅ Beauté: ${treatments.length} soins`);
    console.log(`  ✅ Consultation: 1 thérapeute, ${patients.length} patients`);
    console.log(`  ✅ Prestations Pro: 1 client, 1 devis, 1 facture`);
    console.log(`  ✅ Portfolio: ${galleryItems.length} éléments galerie`);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

seedAllTemplates()
  .then(() => {
    console.log("\n✅ Seed terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erreur fatale:", error);
    process.exit(1);
  });
