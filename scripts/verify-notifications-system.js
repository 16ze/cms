#!/usr/bin/env node

/**
 * Script de vérification du système de notifications
 * À lancer avant de démarrer Next.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verify() {
  console.log('\n🔍 VÉRIFICATION DU SYSTÈME DE NOTIFICATIONS\n');
  console.log('='.repeat(50));

  const checks = [];
  let hasErrors = false;

  try {
    // Check 1: Connexion Prisma
    console.log('\n📊 1. Connexion Prisma...');
    try {
      await prisma.$connect();
      console.log('   ✅ Connexion réussie');
      checks.push({ name: 'Connexion Prisma', status: 'OK' });
    } catch (error) {
      console.error('   ❌ Échec:', error.message);
      checks.push({ name: 'Connexion Prisma', status: 'ÉCHEC', error: error.message });
      hasErrors = true;
    }

    // Check 2: Modèle Notification
    console.log('\n📊 2. Modèle Notification...');
    try {
      if (prisma.notification) {
        const count = await prisma.notification.count();
        console.log(`   ✅ Modèle existe (${count} notifications)`);
        checks.push({ name: 'Modèle Notification', status: 'OK', count });
      } else {
        throw new Error('prisma.notification est undefined');
      }
    } catch (error) {
      console.error('   ❌ Échec:', error.message);
      checks.push({ name: 'Modèle Notification', status: 'ÉCHEC', error: error.message });
      hasErrors = true;
    }

    // Check 3: Modèle NotificationPreference
    console.log('\n📊 3. Modèle NotificationPreference...');
    try {
      if (prisma.notificationPreference) {
        const count = await prisma.notificationPreference.count();
        console.log(`   ✅ Modèle existe (${count} préférences)`);
        checks.push({ name: 'Modèle NotificationPreference', status: 'OK', count });
      } else {
        throw new Error('prisma.notificationPreference est undefined');
      }
    } catch (error) {
      console.error('   ❌ Échec:', error.message);
      checks.push({ name: 'Modèle NotificationPreference', status: 'ÉCHEC', error: error.message });
      hasErrors = true;
    }

    // Check 4: AdminUser
    console.log('\n📊 4. Utilisateurs Admin...');
    try {
      const users = await prisma.adminUser.findMany();
      if (users.length > 0) {
        console.log(`   ✅ ${users.length} utilisateur(s) trouvé(s)`);
        checks.push({ name: 'Utilisateurs Admin', status: 'OK', count: users.length });
      } else {
        console.log('   ⚠️  Aucun utilisateur admin');
        checks.push({ name: 'Utilisateurs Admin', status: 'ATTENTION', message: 'Aucun utilisateur' });
      }
    } catch (error) {
      console.error('   ❌ Échec:', error.message);
      checks.push({ name: 'Utilisateurs Admin', status: 'ÉCHEC', error: error.message });
      hasErrors = true;
    }

    // Check 5: Fichiers requis
    console.log('\n📊 5. Fichiers requis...');
    const requiredFiles = [
      'src/lib/notification-service.ts',
      'src/app/api/notifications/route.ts',
      'src/components/admin/NotificationBell.tsx',
      'src/hooks/use-notifications.ts',
    ];

    let missingFiles = 0;
    for (const file of requiredFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      if (exists) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} MANQUANT`);
        missingFiles++;
        hasErrors = true;
      }
    }

    if (missingFiles === 0) {
      checks.push({ name: 'Fichiers requis', status: 'OK' });
    } else {
      checks.push({ name: 'Fichiers requis', status: 'ÉCHEC', missing: missingFiles });
    }

    // Check 6: Test création notification
    console.log('\n📊 6. Test fonctionnel...');
    try {
      const users = await prisma.adminUser.findFirst();
      if (users) {
        const testNotif = await prisma.notification.create({
          data: {
            userId: users.id,
            type: 'INFO',
            category: 'SYSTEM',
            title: 'Test automatique',
            message: 'Vérification du système',
            priority: 'LOW',
          },
        });

        await prisma.notification.delete({
          where: { id: testNotif.id },
        });

        console.log('   ✅ Création/suppression fonctionnelle');
        checks.push({ name: 'Test fonctionnel', status: 'OK' });
      } else {
        console.log('   ⚠️  Pas d\'utilisateur pour tester');
        checks.push({ name: 'Test fonctionnel', status: 'IGNORÉ' });
      }
    } catch (error) {
      console.error('   ❌ Échec:', error.message);
      checks.push({ name: 'Test fonctionnel', status: 'ÉCHEC', error: error.message });
      hasErrors = true;
    }

    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 RÉSUMÉ DES VÉRIFICATIONS\n');

    checks.forEach((check, index) => {
      const status = check.status === 'OK' ? '✅' :
                    check.status === 'ATTENTION' ? '⚠️' :
                    check.status === 'IGNORÉ' ? '⏭️' : '❌';
      console.log(`${index + 1}. ${status} ${check.name}`);
      if (check.error) {
        console.log(`   └─ Erreur: ${check.error}`);
      }
      if (check.message) {
        console.log(`   └─ ${check.message}`);
      }
      if (check.count !== undefined) {
        console.log(`   └─ Nombre: ${check.count}`);
      }
    });

    console.log('\n' + '='.repeat(50));

    if (hasErrors) {
      console.log('\n❌ DES ERREURS ONT ÉTÉ DÉTECTÉES');
      console.log('\n🔧 ACTIONS REQUISES:');
      console.log('   1. npx prisma generate');
      console.log('   2. npx prisma db push');
      console.log('   3. Redémarrer Next.js (Ctrl+C puis npm run dev)');
      console.log('\n📚 Documentation: docs/TROUBLESHOOTING-NOTIFICATIONS.md\n');
      process.exit(1);
    } else {
      console.log('\n✅ SYSTÈME DE NOTIFICATIONS OPÉRATIONNEL');
      console.log('\n🚀 Vous pouvez démarrer Next.js:');
      console.log('   npm run dev\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error('\n📋 Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();

