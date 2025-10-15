const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const newFaqContent = {
  title: "Questions Fréquentes",
  items: [
    {
      question: "Combien de temps faut-il pour créer un site web ?",
      answer:
        "Le délai varie selon la complexité du projet : 2-3 semaines pour un site vitrine simple, 4-6 semaines pour un site e-commerce, et 6-8 semaines pour une application web complexe. Nous respectons toujours les délais convenus et vous tenons informés de l'avancement.",
    },
    {
      question: "Proposez-vous la maintenance et l'hébergement ?",
      answer:
        "Oui, nous proposons des forfaits de maintenance complète incluant l'hébergement, les mises à jour de sécurité, les sauvegardes automatiques, et le support technique. Nos forfaits sont adaptés à tous les budgets et besoins.",
    },
    {
      question: "Quels sont vos tarifs pour un site web ?",
      answer:
        "Nos tarifs varient selon la complexité et les fonctionnalités demandées. Un site vitrine démarre à 500€, un site e-commerce à partir de 3000€, et une application web sur mesure à partir de 5000€. Nous proposons des devis personnalisés gratuits.",
    },
    {
      question: "Travaillez-vous uniquement à Belfort ou partout en France ?",
      answer:
        "Bien que basés à Belfort, nous travaillons avec des clients partout en France. La majorité de notre travail se fait à distance, et nous nous déplaçons si nécessaire pour les réunions importantes ou la formation.",
    },
    {
      question: "Mes données seront-elles sécurisées ?",
      answer:
        "Absolument. Nous utilisons les dernières technologies de sécurité, des certificats SSL, des sauvegardes régulières, et respectons le RGPD. Vos données sont protégées et nous vous accompagnons dans la conformité légale.",
    },
    {
      question:
        "Pouvez-vous optimiser mon site pour les moteurs de recherche ?",
      answer:
        "Oui, le SEO est notre spécialité. Nous optimisons votre site pour Google et autres moteurs de recherche, améliorons votre visibilité en ligne, et vous accompagnons dans votre stratégie de référencement naturel.",
    },
    {
      question: "Proposez-vous une formation pour gérer mon site ?",
      answer:
        "Oui, nous formons vos équipes à l'utilisation de votre site web. Nous fournissons également des guides d'utilisation détaillés et restons disponibles pour le support technique après la livraison.",
    },
    {
      question: "Quelles technologies utilisez-vous ?",
      answer:
        "Nous utilisons les technologies modernes : Next.js, React, TypeScript, Tailwind CSS, et des bases de données performantes. Ces technologies garantissent des sites rapides, sécurisés et évolutifs.",
    },
  ],
};

async function updateFaqContent() {
  try {
    console.log("🔄 Mise à jour du contenu FAQ en base de données...");

    // Trouver la page d'accueil
    const homePage = await prisma.contentPage.findFirst({
      where: { slug: "home" },
    });

    if (!homePage) {
      console.log("❌ Page d'accueil non trouvée");
      return;
    }

    // Trouver la section FAQ
    const faqSection = await prisma.contentSection.findFirst({
      where: {
        pageId: homePage.id,
        sectionName: "faq",
      },
    });

    if (!faqSection) {
      console.log("❌ Section FAQ non trouvée");
      return;
    }

    // Mettre à jour le contenu de la FAQ
    await prisma.contentSection.update({
      where: { id: faqSection.id },
      data: {
        contentJson: newFaqContent,
      },
    });

    console.log("✅ Contenu FAQ mis à jour avec succès !");
    console.log(`📝 ${newFaqContent.items.length} questions ajoutées`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFaqContent();
