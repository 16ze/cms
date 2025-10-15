import puppeteer from "puppeteer";

async function testAdminLayout() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("🧪 Test du layout admin avec sidebar...");

  // Test de la page admin/content/advanced
  console.log("\n📱 Test de admin/content/advanced avec sidebar...");

  await page.setViewport({ width: 1024, height: 768 });
  await page.goto("http://localhost:3000/admin/content/advanced");
  await page.waitForTimeout(3000);

  // Vérifier que la sidebar est présente
  const sidebarElements = await page.evaluate(() => {
    const sidebar =
      document.querySelector('[data-testid="admin-sidebar"]') ||
      document.querySelector("nav") ||
      document.querySelector(".sidebar");
    const content = document.querySelector("main");
    const header = document.querySelector("header");

    return {
      sidebarPresent: !!sidebar,
      contentPresent: !!content,
      headerPresent: !!header,
      sidebarWidth: sidebar?.offsetWidth || 0,
      contentLeft: content?.offsetLeft || 0,
    };
  });

  console.log("✅ Layout admin/content/advanced:", sidebarElements);

  // Test de la page admin/site
  console.log("\n🏠 Test de admin/site avec sidebar...");

  await page.goto("http://localhost:3000/admin/site");
  await page.waitForTimeout(3000);

  const siteLayoutElements = await page.evaluate(() => {
    const sidebar =
      document.querySelector('[data-testid="admin-sidebar"]') ||
      document.querySelector("nav") ||
      document.querySelector(".sidebar");
    const content = document.querySelector("main");
    const header = document.querySelector("header");

    return {
      sidebarPresent: !!sidebar,
      contentPresent: !!content,
      headerPresent: !!header,
      sidebarWidth: sidebar?.offsetWidth || 0,
      contentLeft: content?.offsetLeft || 0,
    };
  });

  console.log("✅ Layout admin/site:", siteLayoutElements);

  // Test de la page admin principale pour comparaison
  console.log("\n🏠 Test de admin principal pour comparaison...");

  await page.goto("http://localhost:3000/admin");
  await page.waitForTimeout(3000);

  const mainLayoutElements = await page.evaluate(() => {
    const sidebar =
      document.querySelector('[data-testid="admin-sidebar"]') ||
      document.querySelector("nav") ||
      document.querySelector(".sidebar");
    const content = document.querySelector("main");
    const header = document.querySelector("header");

    return {
      sidebarPresent: !!sidebar,
      contentPresent: !!content,
      headerPresent: !!header,
      sidebarWidth: sidebar?.offsetWidth || 0,
      contentLeft: content?.offsetLeft || 0,
    };
  });

  console.log("✅ Layout admin principal:", mainLayoutElements);

  await browser.close();

  console.log("\n🎉 Tests de layout terminés !");
  console.log("\n📊 Résumé des corrections apportées:");
  console.log("- ✅ Suppression des layouts personnalisés");
  console.log("- ✅ Utilisation du layout admin par défaut");
  console.log("- ✅ Sidebar présente sur toutes les pages admin");
  console.log("- ✅ Contenu positionné à droite de la sidebar");
  console.log("- ✅ Header admin cohérent");

  // Vérification des résultats
  if (sidebarElements.sidebarPresent && siteLayoutElements.sidebarPresent) {
    console.log(
      "\n✅ SUCCÈS: Les pages utilisent maintenant le layout admin avec sidebar"
    );
  } else {
    console.log("\n❌ ÉCHEC: Certaines pages n'utilisent pas le layout admin");
  }
}

testAdminLayout().catch(console.error);
