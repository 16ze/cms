// Script pour vérifier et créer l'utilisateur admin
const bcrypt = require("bcryptjs");

class AdminUser {
  constructor() {
    this.users = [];
    this.initializeDefaultAdmin();
  }

  async initializeDefaultAdmin() {
    console.log("🔧 Initialisation de l'utilisateur admin par défaut...");

    try {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const defaultAdmin = {
        id: "admin-1",
        name: "Administrateur Principal",
        email: "admin@kairodigital.com",
        password: hashedPassword,
        role: "super_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.users.push(defaultAdmin);
      console.log("✅ Utilisateur admin créé:", {
        id: defaultAdmin.id,
        email: defaultAdmin.email,
        name: defaultAdmin.name,
        role: defaultAdmin.role,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'admin:", error);
    }
  }

  async validatePassword(email, password) {
    console.log(`🔐 Tentative de validation pour: ${email}`);

    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return null;
    }

    console.log("✅ Utilisateur trouvé, vérification du mot de passe...");
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("❌ Mot de passe incorrect");
      return null;
    }

    console.log("✅ Authentification réussie!");
    return user;
  }

  getAll() {
    return this.users.map(({ password, ...user }) => user);
  }
}

async function testAuth() {
  console.log("🚀 Test du système d'authentification admin...\n");

  const adminStore = new AdminUser();

  // Attendre l'initialisation
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("\n📋 Utilisateurs disponibles:");
  const users = adminStore.getAll();
  users.forEach((user) => {
    console.log(`  - ${user.email} (${user.name}) - ${user.role}`);
  });

  console.log("\n🧪 Test de connexion...");
  const testCredentials = [
    { email: "admin@kairodigital.com", password: "admin123" },
    { email: "admin@kairodigital.com", password: "wrongpassword" },
    { email: "wrong@email.com", password: "admin123" },
  ];

  for (const creds of testCredentials) {
    console.log(`\n🔐 Test: ${creds.email} / ${creds.password}`);
    const result = await adminStore.validatePassword(
      creds.email,
      creds.password
    );
    if (result) {
      console.log(`✅ Succès: ${result.name} (${result.role})`);
    } else {
      console.log("❌ Échec de l'authentification");
    }
  }
}

// Test de création d'un hash
async function testHash() {
  console.log("\n🔐 Test de hashage du mot de passe...");
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash généré:", hash);

  const isValid = await bcrypt.compare(password, hash);
  console.log("Validation du hash:", isValid);
}

// Exécuter les tests
async function main() {
  await testHash();
  await testAuth();
}

main().catch(console.error);
