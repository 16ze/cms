#!/usr/bin/env node

/**
 * Script pour supprimer toutes les données simulées du CRM
 * Garde seulement les stages de pipeline par défaut
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanCrmData() {
  console.log("🧹 NETTOYAGE DES DONNÉES SIMULÉES CRM");
  console.log("=====================================");

  try {
    // 1. Supprimer toutes les activités
    console.log("1. Suppression des activités...");
    const deletedActivities = await prisma.crmActivity.deleteMany();
    console.log(`✅ ${deletedActivities.count} activités supprimées`);

    // 2. Supprimer toutes les tâches
    console.log("2. Suppression des tâches...");
    const deletedTasks = await prisma.crmTask.deleteMany();
    console.log(`✅ ${deletedTasks.count} tâches supprimées`);

    // 3. Supprimer toutes les opportunités
    console.log("3. Suppression des opportunités...");
    const deletedOpportunities = await prisma.crmOpportunity.deleteMany();
    console.log(`✅ ${deletedOpportunities.count} opportunités supprimées`);

    // 4. Supprimer tous les contacts
    console.log("4. Suppression des contacts...");
    const deletedContacts = await prisma.crmContact.deleteMany();
    console.log(`✅ ${deletedContacts.count} contacts supprimés`);

    // 5. Supprimer tous les stages de pipeline (pour les recréer propres)
    console.log("5. Suppression des stages de pipeline...");
    const deletedStages = await prisma.crmPipelineStage.deleteMany();
    console.log(`✅ ${deletedStages.count} stages supprimés`);

    // 6. Supprimer toutes les métriques
    console.log("6. Suppression des métriques...");
    const deletedMetrics = await prisma.crmMetrics.deleteMany();
    console.log(`✅ ${deletedMetrics.count} métriques supprimées`);

    // 7. Supprimer toutes les campagnes email
    console.log("7. Suppression des campagnes email...");
    const deletedCampaigns = await prisma.crmEmailCampaign.deleteMany();
    console.log(`✅ ${deletedCampaigns.count} campagnes supprimées`);

    // 8. Supprimer tous les devis
    console.log("8. Suppression des devis...");
    const deletedQuotes = await prisma.crmQuote.deleteMany();
    console.log(`✅ ${deletedQuotes.count} devis supprimés`);

    // 9. Supprimer toutes les règles d'automatisation
    console.log("9. Suppression des règles d'automatisation...");
    const deletedRules = await prisma.crmAutomationRule.deleteMany();
    console.log(`✅ ${deletedRules.count} règles supprimées`);

    // 10. Supprimer toutes les prédictions de churn
    console.log("10. Suppression des prédictions de churn...");
    const deletedPredictions = await prisma.crmChurnPrediction.deleteMany();
    console.log(`✅ ${deletedPredictions.count} prédictions supprimées`);

    // 11. Recréer les stages de pipeline par défaut (vides)
    console.log("\n11. Création des stages de pipeline par défaut...");

    const defaultStages = [
      {
        name: "Qualification",
        orderIndex: 1,
        probability: 10,
        color: "#FF6B6B",
        isActive: true,
      },
      {
        name: "Proposition",
        orderIndex: 2,
        probability: 25,
        color: "#4ECDC4",
        isActive: true,
      },
      {
        name: "Négociation",
        orderIndex: 3,
        probability: 50,
        color: "#45B7D1",
        isActive: true,
      },
      {
        name: "Fermeture",
        orderIndex: 4,
        probability: 75,
        color: "#96CEB4",
        isActive: true,
      },
      {
        name: "Gagné",
        orderIndex: 5,
        probability: 100,
        color: "#FFEAA7",
        isActive: true,
      },
    ];

    for (const stage of defaultStages) {
      await prisma.crmPipelineStage.create({
        data: stage,
      });
    }
    console.log(`✅ ${defaultStages.length} stages de pipeline créés`);

    // 12. Vérification finale
    console.log("\n12. Vérification finale...");

    const finalCounts = {
      contacts: await prisma.crmContact.count(),
      opportunities: await prisma.crmOpportunity.count(),
      activities: await prisma.crmActivity.count(),
      tasks: await prisma.crmTask.count(),
      stages: await prisma.crmPipelineStage.count(),
      quotes: await prisma.crmQuote.count(),
      campaigns: await prisma.crmEmailCampaign.count(),
      metrics: await prisma.crmMetrics.count(),
      rules: await prisma.crmAutomationRule.count(),
      predictions: await prisma.crmChurnPrediction.count(),
    };

    console.log("\n📊 ÉTAT FINAL DU CRM:");
    console.log("======================");
    console.log(`👥 Contacts: ${finalCounts.contacts}`);
    console.log(`🎯 Opportunités: ${finalCounts.opportunities}`);
    console.log(`📞 Activités: ${finalCounts.activities}`);
    console.log(`✅ Tâches: ${finalCounts.tasks}`);
    console.log(`📈 Stages pipeline: ${finalCounts.stages}`);
    console.log(`💰 Devis: ${finalCounts.quotes}`);
    console.log(`📧 Campagnes: ${finalCounts.campaigns}`);
    console.log(`📊 Métriques: ${finalCounts.metrics}`);
    console.log(`🤖 Règles automation: ${finalCounts.rules}`);
    console.log(`🔮 Prédictions churn: ${finalCounts.predictions}`);

    console.log("\n🎉 NETTOYAGE TERMINÉ!");
    console.log("=====================");
    console.log("✅ Toutes les données simulées ont été supprimées");
    console.log(
      "✅ Le CRM est maintenant vide et prêt pour vos vraies données"
    );
    console.log("✅ Les stages de pipeline par défaut sont configurés");
    console.log("\n💡 Vous pouvez maintenant:");
    console.log("   - Ajouter vos vrais contacts clients");
    console.log("   - Créer vos opportunités commerciales");
    console.log("   - Suivre vos activités réelles");
    console.log("   - Utiliser le pipeline commercial");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

cleanCrmData();
