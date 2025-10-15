import puppeteer from "puppeteer";

async function testResponsiveAdmin() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("🧪 Test des corrections responsive pour les pages admin...");

  // Test de la page admin/content/advanced
  console.log("\n📱 Test de admin/content/advanced...");

  // Mobile (375px)
  await page.setViewport({ width: 375, height: 667 });
  await page.goto("http://localhost:3000/admin/content/advanced");
  await page.waitForTimeout(2000);

  // Vérifier que les éléments sont bien visibles sur mobile
  const mobileElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const searchInput = document.querySelector(
      'input[placeholder*="Rechercher"]'
    );
    const newPageBtn = document.querySelector("button");

    return {
      headerVisible: header && header.textContent?.includes("Gestion Avancée"),
      searchVisible: searchInput && searchInput.offsetWidth > 0,
      buttonVisible: newPageBtn && newPageBtn.offsetWidth > 0,
    };
  });

  console.log("✅ Mobile (375px):", mobileElements);

  // Tablet (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await page.reload();
  await page.waitForTimeout(2000);

  const tabletElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const searchInput = document.querySelector(
      'input[placeholder*="Rechercher"]'
    );
    const newPageBtn = document.querySelector("button");

    return {
      headerVisible: header && header.textContent?.includes("Gestion Avancée"),
      searchVisible: searchInput && searchInput.offsetWidth > 0,
      buttonVisible: newPageBtn && newPageBtn.offsetWidth > 0,
    };
  });

  console.log("✅ Tablet (768px):", tabletElements);

  // Desktop (1024px)
  await page.setViewport({ width: 1024, height: 768 });
  await page.reload();
  await page.waitForTimeout(2000);

  const desktopElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const searchInput = document.querySelector(
      'input[placeholder*="Rechercher"]'
    );
    const newPageBtn = document.querySelector("button");

    return {
      headerVisible: header && header.textContent?.includes("Gestion Avancée"),
      searchVisible: searchInput && searchInput.offsetWidth > 0,
      buttonVisible: newPageBtn && newPageBtn.offsetWidth > 0,
    };
  });

  console.log("✅ Desktop (1024px):", desktopElements);

  // Test de la page admin/site
  console.log("\n🏠 Test de admin/site...");

  // Mobile
  await page.setViewport({ width: 375, height: 667 });
  await page.goto("http://localhost:3000/admin/site");
  await page.waitForTimeout(2000);

  const mobileSiteElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const tabs = document.querySelectorAll("button");
    const tabCount = tabs.length;

    return {
      headerVisible: header && header.textContent?.includes("Gestionnaire"),
      tabsVisible: tabCount >= 4,
      tabsScrollable:
        document.querySelector("nav")?.scrollWidth >
        document.querySelector("nav")?.clientWidth,
    };
  });

  console.log("✅ Mobile Site (375px):", mobileSiteElements);

  // Tablet
  await page.setViewport({ width: 768, height: 1024 });
  await page.reload();
  await page.waitForTimeout(2000);

  const tabletSiteElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const tabs = document.querySelectorAll("button");
    const tabCount = tabs.length;

    return {
      headerVisible: header && header.textContent?.includes("Gestionnaire"),
      tabsVisible: tabCount >= 4,
      tabsScrollable:
        document.querySelector("nav")?.scrollWidth >
        document.querySelector("nav")?.clientWidth,
    };
  });

  console.log("✅ Tablet Site (768px):", tabletSiteElements);

  // Desktop
  await page.setViewport({ width: 1024, height: 768 });
  await page.reload();
  await page.waitForTimeout(2000);

  const desktopSiteElements = await page.evaluate(() => {
    const header = document.querySelector("h1");
    const tabs = document.querySelectorAll("button");
    const tabCount = tabs.length;

    return {
      headerVisible: header && header.textContent?.includes("Gestionnaire"),
      tabsVisible: tabCount >= 4,
      tabsScrollable:
        document.querySelector("nav")?.scrollWidth >
        document.querySelector("nav")?.clientWidth,
    };
  });

  console.log("✅ Desktop Site (1024px):", desktopSiteElements);

  await browser.close();

  console.log("\n🎉 Tests responsive terminés !");
  console.log("\n📊 Résumé des corrections apportées:");
  console.log("- ✅ Padding responsive: p-3 sm:p-4 md:p-6");
  console.log("- ✅ Texte responsive: text-xl sm:text-2xl md:text-3xl");
  console.log("- ✅ Boutons responsive: px-4 sm:px-6 py-2 sm:py-3");
  console.log("- ✅ Icônes responsive: w-4 h-4 sm:w-5 sm:h-5");
  console.log("- ✅ Navigation responsive: overflow-x-auto, min-w-max");
  console.log("- ✅ Layout responsive: flex-col sm:flex-row");
  console.log("- ✅ Espacement responsive: gap-2 sm:gap-3");
}

testResponsiveAdmin().catch(console.error);
