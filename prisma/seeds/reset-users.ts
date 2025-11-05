/**
 * Script de réinitialisation complète des utilisateurs
 * - Supprime tous les SuperAdmin, TenantUser et AdminUser
 * - Recrée le super admin avec les identifiants fournis
 *
 * Usage: npx tsx prisma/seeds/reset-users.ts
 *
 * Note: Si DATABASE_URL n'est pas définie, le script essaiera d'utiliser
 * le chemin par défaut pour SQLite: file:./prisma/prisma/dev.db
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

// Si DATABASE_URL n'est pas définie, utiliser le chemin par défaut pour SQLite
if (!process.env.DATABASE_URL) {
  // Calculer le chemin depuis le répertoire du projet (racine)
  const projectRoot = path.resolve(process.cwd());
  const dbPath = path.join(projectRoot, "prisma", "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log(
    `ℹ️  DATABASE_URL non définie, utilisation du chemin par défaut: ${process.env.DATABASE_URL}\n`
  );
}

const prisma = new PrismaClient();

// Identifiants du super admin à créer
const SUPER_ADMIN_EMAIL = "contact-sa@kairodigital.fr";
const SUPER_ADMIN_PASSWORD = "Bryan25200@";
const SUPER_ADMIN_FIRST_NAME = "Super";
const SUPER_ADMIN_LAST_NAME = "Admin";

async function resetAllUsers() {
  console.log("🚀 Début de la réinitialisation des utilisateurs...\n");

  try {
    // ===== 1. SUPPRIMER TOUS LES UTILISATEURS =====
    console.log("🧹 Suppression de tous les utilisateurs existants...");

    // Supprimer les TenantUser (dépendances doivent être gérées par les relations)
    const deletedTenantUsers = await prisma.tenantUser.deleteMany();
    console.log(`   ✅ ${deletedTenantUsers.count} TenantUser supprimé(s)`);

    // Supprimer les SuperAdmin
    const deletedSuperAdmins = await prisma.superAdmin.deleteMany();
    console.log(`   ✅ ${deletedSuperAdmins.count} SuperAdmin supprimé(s)`);

    // Supprimer les AdminUser (ancien système)
    const deletedAdminUsers = await prisma.adminUser.deleteMany();
    console.log(`   ✅ ${deletedAdminUsers.count} AdminUser supprimé(s)`);

    console.log("✅ Tous les utilisateurs ont été supprimés\n");

    // ===== 2. CRÉER LE NOUVEAU SUPER ADMIN =====
    console.log("👨‍💻 Création du nouveau Super Admin...");

    // Vérifier que l'email n'existe pas déjà (normalement non, mais sécurité)
    const existingSuperAdmin = await prisma.superAdmin.findUnique({
      where: { email: SUPER_ADMIN_EMAIL.toLowerCase().trim() },
    });

    if (existingSuperAdmin) {
      console.log(
        `⚠️  Un Super Admin avec l'email ${SUPER_ADMIN_EMAIL} existe déjà.`
      );
      console.log("   Suppression de l'ancien compte...");
      await prisma.superAdmin.delete({
        where: { email: SUPER_ADMIN_EMAIL.toLowerCase().trim() },
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    // Créer le nouveau Super Admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: SUPER_ADMIN_EMAIL.toLowerCase().trim(),
        password: hashedPassword,
        firstName: SUPER_ADMIN_FIRST_NAME,
        lastName: SUPER_ADMIN_LAST_NAME,
        isActive: true,
      },
    });

    console.log(`✅ Super Admin créé avec succès !`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Prénom: ${superAdmin.firstName}`);
    console.log(`   Nom: ${superAdmin.lastName}`);
    console.log(`   Actif: ${superAdmin.isActive ? "Oui" : "Non"}\n`);

    // ===== 3. VÉRIFICATION FINALE =====
    console.log("🔍 Vérification finale...");

    const totalSuperAdmins = await prisma.superAdmin.count();
    const totalTenantUsers = await prisma.tenantUser.count();
    const totalAdminUsers = await prisma.adminUser.count();

    console.log(`   • SuperAdmin: ${totalSuperAdmins}`);
    console.log(`   • TenantUser: ${totalTenantUsers}`);
    console.log(`   • AdminUser: ${totalAdminUsers}\n`);

    // ===== 4. RÉCAPITULATIF =====
    console.log("═".repeat(70));
    console.log("✨ RÉINITIALISATION TERMINÉE AVEC SUCCÈS !\n");
    console.log("📊 RÉSUMÉ:");
    console.log(`   • ${deletedSuperAdmins.count} SuperAdmin supprimé(s)`);
    console.log(`   • ${deletedTenantUsers.count} TenantUser supprimé(s)`);
    console.log(`   • ${deletedAdminUsers.count} AdminUser supprimé(s)`);
    console.log(`   • 1 nouveau Super Admin créé\n`);
    console.log("🔐 IDENTIFIANTS DU SUPER ADMIN:");
    console.log(
      "   ┌───────────────────────────────────────────────────────────"
    );
    console.log(`   │ Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   │ Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`   │ Prénom: ${SUPER_ADMIN_FIRST_NAME}`);
    console.log(`   │ Nom: ${SUPER_ADMIN_LAST_NAME}`);
    console.log(
      "   └───────────────────────────────────────────────────────────"
    );
    console.log("\n🎯 PROCHAINE ÉTAPE:");
    console.log("   Connectez-vous avec ces identifiants sur:");
    console.log("   http://localhost:3000/super-admin/login");
    console.log("═".repeat(70));
  } catch (error) {
    console.error("\n❌ ERREUR lors de la réinitialisation:", error);

    if (error instanceof Error) {
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
resetAllUsers();
