import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "fs";

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info" as const,
    output: "html" as const,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse("http://localhost:3000", options);
  if (!runnerResult) {
    throw new Error("Lighthouse n'a pas pu générer de rapport");
  }

  // Sauvegarder le rapport
  const reportHtml = runnerResult.report as string;
  fs.writeFileSync("lighthouse-report.html", reportHtml);

  // Afficher les scores
  console.log("Résultats Lighthouse:");
  const performanceScore = runnerResult.lhr.categories.performance?.score;
  const accessibilityScore = runnerResult.lhr.categories.accessibility?.score;
  const bestPracticesScore =
    runnerResult.lhr.categories["best-practices"]?.score;
  const seoScore = runnerResult.lhr.categories.seo?.score;

  console.log(
    "Performance:",
    performanceScore ? performanceScore * 100 : "N/A"
  );
  console.log(
    "Accessibilité:",
    accessibilityScore ? accessibilityScore * 100 : "N/A"
  );
  console.log(
    "Bonnes pratiques:",
    bestPracticesScore ? bestPracticesScore * 100 : "N/A"
  );
  console.log("SEO:", seoScore ? seoScore * 100 : "N/A");

  await chrome.kill();
}

runLighthouse().catch(console.error);
