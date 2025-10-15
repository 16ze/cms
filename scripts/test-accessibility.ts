import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer from "puppeteer";
import { Result } from "axe-core";

async function testAccessibility() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Naviguer vers la page à tester
  await page.goto("http://localhost:3000");

  // Analyser l'accessibilité
  const results = await new AxePuppeteer(page).analyze();

  // Afficher les résultats
  console.log("Résultats des tests d'accessibilité:");
  results.violations.forEach((violation: Result) => {
    console.log(`\nViolation: ${violation.id}`);
    console.log(`Description: ${violation.description}`);
    console.log(`Impact: ${violation.impact || "Non spécifié"}`);
    console.log(`Éléments concernés: ${violation.nodes.length}`);
  });

  await browser.close();
}

testAccessibility().catch(console.error);
