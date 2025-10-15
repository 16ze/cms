/**
 * 🌱 Clean Seed - Base de données vierge pour nouveau projet
 *
 * Ce script supprime toutes les données KAIRO Digital et crée
 * un environnement propre pour un nouveau client.
 *
 * ⚠️  ATTENTION: Ce script SUPPRIME TOUTES LES DONNÉES !
 *
 * Usage: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du clean seed...\n");

  // ========================================
  // 1. SUPPRESSION DES DONNÉES EXISTANTES
  // ========================================

  console.log("🗑️  Suppression des données existantes...");

  try {
    // Supprimer dans l'ordre pour respecter les contraintes FK

    // CRM
    await prisma.crmEmailHistory.deleteMany({});
    await prisma.crmActivityReminder.deleteMany({});
    await prisma.crmActivityAttachment.deleteMany({});
    await prisma.crmActivityParticipant.deleteMany({});
    await prisma.crmActivity.deleteMany({});
    await prisma.crmTask.deleteMany({});
    await prisma.crmQuoteItem.deleteMany({});
    await prisma.crmQuote.deleteMany({});
    await prisma.crmOpportunityItem.deleteMany({});
    await prisma.crmOpportunity.deleteMany({});
    await prisma.crmContact.deleteMany({});
    await prisma.crmPipelineStage.deleteMany({});
    await prisma.crmEmailCampaign.deleteMany({});
    await prisma.crmAutomationLog.deleteMany({});
    await prisma.crmAutomationRule.deleteMany({});
    await prisma.crmChurnPrediction.deleteMany({});
    await prisma.crmMetrics.deleteMany({});
    await prisma.crmMetricsHistory.deleteMany({});
    await prisma.crmMetricsDaily.deleteMany({});
    await prisma.crmPerformanceSnapshot.deleteMany({});
    await prisma.crmReportExport.deleteMany({});
    await prisma.crmCustomReport.deleteMany({});
    await prisma.crmProduct.deleteMany({});
    console.log("   ✅ Données CRM supprimées");

    // Chatbot
    await prisma.chatbotMessage.deleteMany({});
    await prisma.chatbotConversation.deleteMany({});
    await prisma.chatbotKnowledgeBase.deleteMany({});
    await prisma.chatbotAnalytics.deleteMany({});
    console.log("   ✅ Données Chatbot supprimées");

    // Clients (ancien système)
    await prisma.clientInteraction.deleteMany({});
    await prisma.clientProject.deleteMany({});
    await prisma.clientDocument.deleteMany({});
    await prisma.client.deleteMany({});
    console.log("   ✅ Données Clients supprimées");

    // Réservations
    await prisma.reservation.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.exclusion.deleteMany({});
    await prisma.reservationSettings.deleteMany({});
    console.log("   ✅ Données Réservations supprimées");

    // Contenu
    await prisma.contentVersion.deleteMany({});
    await prisma.designSectionStyles.deleteMany({});
    await prisma.contentSection.deleteMany({});
    await prisma.designPageSettings.deleteMany({});
    await prisma.contentPage.deleteMany({});
    await prisma.contentMedia.deleteMany({});
    console.log("   ✅ Données Contenu supprimées");

    // Design & Site
    await prisma.designHistory.deleteMany({});
    await prisma.designGlobalSettings.deleteMany({});
    await prisma.designTheme.deleteMany({});
    await prisma.siteHeader.deleteMany({});
    await prisma.siteFooter.deleteMany({});
    await prisma.siteTheme.deleteMany({});
    await prisma.siteSettings.deleteMany({});
    await prisma.buttonStyles.deleteMany({});
    console.log("   ✅ Données Design/Site supprimées");

    // Users (ne pas supprimer AdminUser pour garder l'accès admin)
    await prisma.user.deleteMany({});
    console.log("   ✅ Données Utilisateurs supprimées");

    console.log("\n✅ Toutes les données ont été supprimées\n");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    throw error;
  }

  // ========================================
  // 2. CRÉATION DE L'ADMIN PAR DÉFAUT
  // ========================================

  console.log("👤 Création de l'utilisateur admin...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@exemple.fr";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`   ℹ️  Admin existe déjà: ${adminEmail}`);
      console.log(
        "   💡 Pour réinitialiser le mot de passe, supprimez manuellement l'admin dans la BDD"
      );
    } else {
      await prisma.adminUser.create({
        data: {
          email: adminEmail,
          hashedPassword: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });
      console.log(`   ✅ Admin créé: ${adminEmail}`);
      console.log(`   🔑 Mot de passe: ${adminPassword}`);
      console.log("   ⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:", error);
    throw error;
  }

  // ========================================
  // 3. CONFIGURATION DES PIPELINES CRM
  // ========================================

  console.log("\n📊 Création des étapes de pipeline CRM...");

  const pipelineStages = [
    {
      name: "Nouveau Contact",
      orderIndex: 1,
      probability: 10,
      color: "#94a3b8",
    },
    { name: "Qualifié", orderIndex: 2, probability: 25, color: "#60a5fa" },
    { name: "Proposition", orderIndex: 3, probability: 50, color: "#fbbf24" },
    { name: "Négociation", orderIndex: 4, probability: 75, color: "#fb923c" },
    { name: "Gagné", orderIndex: 5, probability: 100, color: "#34d399" },
    { name: "Perdu", orderIndex: 6, probability: 0, color: "#ef4444" },
  ];

  for (const stage of pipelineStages) {
    await prisma.crmPipelineStage.create({
      data: stage,
    });
  }

  console.log("   ✅ Étapes de pipeline créées");

  // ========================================
  // 4. PARAMÈTRES DE RÉSERVATION PAR DÉFAUT
  // ========================================

  console.log("\n📅 Création des paramètres de réservation...");

  await prisma.reservationSettings.create({
    data: {
      minNoticeTime: 24,
      maxAdvanceBookingDays: 60,
      defaultSessionDuration: 60,
      reminderHoursBeforeEvent: 24,
      discoverySessionDuration: 30,
      consultationSessionDuration: 60,
      presentationSessionDuration: 45,
      followupSessionDuration: 30,
    },
  });

  console.log("   ✅ Paramètres de réservation créés");

  // ========================================
  // 5. THÈME PAR DÉFAUT
  // ========================================

  console.log("\n🎨 Création du thème par défaut...");

  await prisma.siteTheme.create({
    data: {
      name: "default",
      displayName: "Thème par défaut",
      isActive: true,
      isDefault: true,
      configJson: {
        primaryColor: "#007aff",
        secondaryColor: "#8b5cf6",
        accentColor: "#f59e0b",
      },
    },
  });

  console.log("   ✅ Thème par défaut créé");

  // ========================================
  // RÉSUMÉ
  // ========================================

  console.log("\n" + "=".repeat(50));
  console.log("✅ Clean seed terminé avec succès !");
  console.log("=".repeat(50));
  console.log("\n📋 Résumé:");
  console.log(`   👤 Admin: ${adminEmail}`);
  console.log(`   🔑 Mot de passe: ${adminPassword}`);
  console.log(`   📊 ${pipelineStages.length} étapes de pipeline CRM`);
  console.log("   📅 Paramètres de réservation configurés");
  console.log("   🎨 Thème par défaut créé");

  console.log("\n🚀 Prochaines étapes:");
  console.log("   1. Connectez-vous à /admin avec les identifiants ci-dessus");
  console.log("   2. Changez immédiatement le mot de passe admin");
  console.log("   3. Configurez les paramètres du site dans l'interface admin");
  console.log("   4. Ajoutez votre contenu via le CMS");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




