import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function testSecurity() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Naviguer vers la page à tester
  await page.goto("http://localhost:3000");

  // Vérifier les en-têtes de sécurité
  const response = await page.goto("http://localhost:3000");
  const headers = response?.headers();

  console.log("Vérification des en-têtes de sécurité:");
  console.log("X-Frame-Options:", headers?.["x-frame-options"] || "Manquant");
  console.log(
    "X-Content-Type-Options:",
    headers?.["x-content-type-options"] || "Manquant"
  );
  console.log("X-XSS-Protection:", headers?.["x-xss-protection"] || "Manquant");
  console.log(
    "Content-Security-Policy:",
    headers?.["content-security-policy"] || "Manquant"
  );
  console.log(
    "Strict-Transport-Security:",
    headers?.["strict-transport-security"] || "Manquant"
  );

  // Vérifier les dépendances avec npm audit
  try {
    const { stdout } = await execAsync("npm audit");
    console.log("\nRésultats de npm audit:");
    console.log(stdout);
  } catch (error) {
    console.error("Erreur lors de l'exécution de npm audit:", error);
  }

  await browser.close();
}

testSecurity().catch(console.error);
