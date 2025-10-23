const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedProjectsAndTeam() {
  console.log("🌱 Début du seed Projets & Équipe...");

  try {
    // Nettoyer les données existantes
    await prisma.project.deleteMany();
    await prisma.teamMember.deleteMany();

    console.log("🧹 Données existantes supprimées");

    // ==== PROJETS ====
    const projects = [
      {
        title: "Refonte Site E-commerce",
        slug: "refonte-site-ecommerce",
        description:
          "Refonte complète d'un site e-commerce avec Next.js et Stripe",
        content:
          "Projet de refonte d'un site e-commerce existant avec migration vers une architecture moderne.",
        category: "E-commerce",
        client: "TechStore France",
        technologies: JSON.stringify([
          "Next.js",
          "TypeScript",
          "Stripe",
          "Tailwind CSS",
        ]),
        imageUrl: "/images/projects/ecommerce.jpg",
        projectUrl: "https://example.com/ecommerce",
        status: "COMPLETED",
        featured: true,
        orderIndex: 1,
      },
      {
        title: "Application Mobile Fitness",
        slug: "application-mobile-fitness",
        description: "Développement d'une application mobile de suivi fitness",
        content:
          "Application React Native pour le suivi d'activités sportives et nutrition.",
        category: "Mobile",
        client: "FitLife App",
        technologies: JSON.stringify([
          "React Native",
          "Firebase",
          "TypeScript",
        ]),
        imageUrl: "/images/projects/fitness-app.jpg",
        status: "IN_PROGRESS",
        featured: true,
        orderIndex: 2,
      },
      {
        title: "Plateforme SaaS B2B",
        slug: "plateforme-saas-b2b",
        description:
          "Développement d'une plateforme SaaS pour la gestion d'entreprise",
        content:
          "Solution complète de gestion avec dashboard avancé et API REST.",
        category: "SaaS",
        client: "BusinessHub",
        technologies: JSON.stringify([
          "React",
          "Node.js",
          "PostgreSQL",
          "Docker",
        ]),
        imageUrl: "/images/projects/saas-platform.jpg",
        projectUrl: "https://example.com/saas",
        status: "COMPLETED",
        featured: false,
        orderIndex: 3,
      },
      {
        title: "Site Vitrine Restaurant",
        slug: "site-vitrine-restaurant",
        description:
          "Création d'un site vitrine élégant pour un restaurant gastronomique",
        content: "Site vitrine avec réservation en ligne et menu interactif.",
        category: "Vitrine",
        client: "Le Gourmet Paris",
        technologies: JSON.stringify(["Next.js", "Sanity CMS", "Tailwind CSS"]),
        imageUrl: "/images/projects/restaurant.jpg",
        projectUrl: "https://example.com/restaurant",
        status: "COMPLETED",
        featured: false,
        orderIndex: 4,
      },
    ];

    for (const project of projects) {
      await prisma.project.create({ data: project });
    }

    console.log(`✅ ${projects.length} projets créés`);

    // ==== ÉQUIPE ====
    const teamMembers = [
      {
        firstName: "Marie",
        lastName: "Dupont",
        slug: "marie-dupont",
        position: "Directrice Technique",
        department: "Direction",
        bio: "Passionnée par les nouvelles technologies, Marie dirige l'équipe technique avec 15 ans d'expérience.",
        photoUrl: "/images/team/marie-dupont.jpg",
        email: "marie.dupont@example.com",
        phone: "+33 6 12 34 56 78",
        linkedin: "https://linkedin.com/in/marie-dupont",
        skills: JSON.stringify([
          "Leadership",
          "Architecture",
          "React",
          "Node.js",
        ]),
        isActive: true,
        orderIndex: 1,
      },
      {
        firstName: "Thomas",
        lastName: "Martin",
        slug: "thomas-martin",
        position: "Lead Developer",
        department: "Développement",
        bio: "Expert en développement full-stack avec une spécialisation en React et TypeScript.",
        photoUrl: "/images/team/thomas-martin.jpg",
        email: "thomas.martin@example.com",
        linkedin: "https://linkedin.com/in/thomas-martin",
        github: "https://github.com/tmartin",
        skills: JSON.stringify(["React", "TypeScript", "Next.js", "Node.js"]),
        isActive: true,
        orderIndex: 2,
      },
      {
        firstName: "Sophie",
        lastName: "Bernard",
        slug: "sophie-bernard",
        position: "UI/UX Designer",
        department: "Design",
        bio: "Designer créative spécialisée dans l'expérience utilisateur et le design d'interfaces modernes.",
        photoUrl: "/images/team/sophie-bernard.jpg",
        email: "sophie.bernard@example.com",
        linkedin: "https://linkedin.com/in/sophie-bernard",
        website: "https://sophie-design.com",
        skills: JSON.stringify([
          "Figma",
          "Adobe XD",
          "UI Design",
          "UX Research",
        ]),
        isActive: true,
        orderIndex: 3,
      },
      {
        firstName: "Lucas",
        lastName: "Petit",
        slug: "lucas-petit",
        position: "Backend Developer",
        department: "Développement",
        bio: "Spécialiste backend avec expertise en architecture microservices et bases de données.",
        photoUrl: "/images/team/lucas-petit.jpg",
        email: "lucas.petit@example.com",
        github: "https://github.com/lpetit",
        skills: JSON.stringify(["Node.js", "PostgreSQL", "MongoDB", "Docker"]),
        isActive: true,
        orderIndex: 4,
      },
      {
        firstName: "Emma",
        lastName: "Leroy",
        slug: "emma-leroy",
        position: "Chef de Projet",
        department: "Management",
        bio: "Gestion de projets agile et coordination d'équipes techniques.",
        photoUrl: "/images/team/emma-leroy.jpg",
        email: "emma.leroy@example.com",
        phone: "+33 6 98 76 54 32",
        linkedin: "https://linkedin.com/in/emma-leroy",
        skills: JSON.stringify(["Agile", "Scrum", "JIRA", "Management"]),
        isActive: true,
        orderIndex: 5,
      },
    ];

    for (const member of teamMembers) {
      await prisma.teamMember.create({ data: member });
    }

    console.log(`✅ ${teamMembers.length} membres d'équipe créés`);

    console.log("🎉 Seed Projets & Équipe terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

// Exécuter le seed
seedProjectsAndTeam()
  .then(() => {
    console.log("✅ Seed terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
