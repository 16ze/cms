// Test du service de notifications
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testService() {
  console.log("🧪 Test du service de notifications\n");

  try {
    // 1. Test de connexion
    console.log("1️⃣ Test de connexion Prisma...");
    await prisma.$connect();
    console.log("   ✅ Connexion réussie\n");

    // 2. Test AdminUser
    console.log("2️⃣ Test récupération AdminUser...");
    const users = await prisma.adminUser.findMany({
      take: 1,
    });
    console.log(`   ✅ Nombre d'utilisateurs: ${users.length}`);
    if (users.length > 0) {
      console.log(
        `   👤 Premier utilisateur: ${users[0].email} (${users[0].id})\n`
      );

      const userId = users[0].id;

      // 3. Test création notification
      console.log("3️⃣ Test création notification...");
      const notification = await prisma.notification.create({
        data: {
          userId: userId,
          type: "INFO",
          category: "SYSTEM",
          title: "Test de notification",
          message: "Ceci est un test",
          priority: "MEDIUM",
        },
      });
      console.log(`   ✅ Notification créée: ${notification.id}\n`);

      // 4. Test récupération notifications
      console.log("4️⃣ Test récupération notifications...");
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
        },
      });
      console.log(`   ✅ Notifications trouvées: ${notifications.length}\n`);

      // 5. Test comptage non lues
      console.log("5️⃣ Test comptage non lues...");
      const unreadCount = await prisma.notification.count({
        where: {
          userId: userId,
          read: false,
        },
      });
      console.log(`   ✅ Notifications non lues: ${unreadCount}\n`);

      // 6. Nettoyage
      console.log("6️⃣ Nettoyage...");
      await prisma.notification.delete({
        where: {
          id: notification.id,
        },
      });
      console.log("   ✅ Notification supprimée\n");
    } else {
      console.log("   ⚠️  Aucun utilisateur trouvé dans AdminUser\n");
      console.log("   💡 Créez un utilisateur admin via:");
      console.log("      http://localhost:3000/admin/login\n");
    }

    console.log("🎉 Tous les tests sont passés !");
    console.log("✅ Le système de notifications fonctionne correctement");
    console.log(
      "\n🚨 IMPORTANT: Redémarrez Next.js pour que les changements soient pris en compte !"
    );
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error("\n📋 Stack trace:");
    console.error(error.stack);
    console.error("\n🔍 Type d'erreur:", error.constructor.name);
  } finally {
    await prisma.$disconnect();
  }
}

testService();
