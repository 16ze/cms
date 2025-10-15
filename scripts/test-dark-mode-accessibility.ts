#!/usr/bin/env tsx

/**
 * Script de test automatisé pour l'accessibilité du mode sombre
 * Vérifie la conformité WCAG 2.1 AA pour les contrastes de couleurs
 */

interface ColorTest {
  name: string;
  foreground: string;
  background: string;
  expectedLevel: "AA" | "AAA";
  context: string;
}

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: string;
}

// Fonction pour convertir HSL en RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Fonction pour calculer la luminance relative
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Fonction pour calculer le ratio de contraste
function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Fonction pour parser les couleurs HSL
function parseHslColor(hslString: string): [number, number, number] {
  const match = hslString.match(
    /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/
  );
  if (!match) {
    throw new Error(`Format HSL invalide: ${hslString}`);
  }

  return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
}

// Tests de contraste pour le mode sombre
const darkModeTests: ColorTest[] = [
  // Texte principal sur fond sombre
  {
    name: "Texte principal (mode sombre)",
    foreground: "0 0% 98%", // --foreground dark
    background: "240 10% 3.9%", // --background dark
    expectedLevel: "AA",
    context: "Texte principal sur fond sombre",
  },

  // Texte sur cards
  {
    name: "Texte sur cartes (mode sombre)",
    foreground: "0 0% 98%", // --card-foreground dark
    background: "240 10% 3.9%", // --card dark
    expectedLevel: "AA",
    context: "Texte sur composants card",
  },

  // Bouton primaire
  {
    name: "Bouton primaire (mode sombre)",
    foreground: "0 0% 98%", // --primary-foreground dark
    background: "217 91% 50%", // --primary dark (updated)
    expectedLevel: "AA",
    context: "Texte sur boutons primaires",
  },

  // Texte secondaire
  {
    name: "Texte secondaire (mode sombre)",
    foreground: "0 0% 98%", // --secondary-foreground dark
    background: "240 3.7% 15.9%", // --secondary dark
    expectedLevel: "AA",
    context: "Texte sur fond secondaire",
  },

  // Texte muted
  {
    name: "Texte atténué (mode sombre)",
    foreground: "240 5% 64.9%", // --muted-foreground dark
    background: "240 10% 3.9%", // --background dark
    expectedLevel: "AA",
    context: "Texte atténué sur fond principal",
  },

  // Bordures et inputs
  {
    name: "Bordures (mode sombre)",
    foreground: "240 3.7% 50%", // --border dark (final)
    background: "240 10% 3.9%", // --background dark
    expectedLevel: "AA",
    context: "Contraste des bordures",
  },
];

// Fonction principale de test
function testContrastRatio(
  foregroundHsl: string,
  backgroundHsl: string
): ContrastResult {
  try {
    const [fH, fS, fL] = parseHslColor(foregroundHsl);
    const [bH, bS, bL] = parseHslColor(backgroundHsl);

    const foregroundRgb = hslToRgb(fH, fS, fL);
    const backgroundRgb = hslToRgb(bH, bS, bL);

    const ratio = getContrastRatio(foregroundRgb, backgroundRgb);
    const passesAA = ratio >= 4.5;
    const passesAAA = ratio >= 7;

    let level = "Échec";
    if (passesAAA) level = "AAA";
    else if (passesAA) level = "AA";

    return {
      ratio: Math.round(ratio * 100) / 100,
      passesAA,
      passesAAA,
      level,
    };
  } catch (error) {
    console.error(`Erreur lors du test de contraste: ${error}`);
    return {
      ratio: 0,
      passesAA: false,
      passesAAA: false,
      level: "Erreur",
    };
  }
}

// Exécution des tests
function runAccessibilityTests(): void {
  console.log("\n🌙 TESTS D'ACCESSIBILITÉ - MODE SOMBRE");
  console.log("=====================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests: string[] = [];

  darkModeTests.forEach((test) => {
    totalTests++;
    const result = testContrastRatio(test.foreground, test.background);

    const status = result.passesAA ? "✅ PASS" : "❌ FAIL";
    const meetsExpectation =
      test.expectedLevel === "AA" ? result.passesAA : result.passesAAA;

    console.log(`${status} ${test.name}`);
    console.log(`   Contexte: ${test.context}`);
    console.log(`   Ratio: ${result.ratio}:1 (${result.level})`);
    console.log(
      `   Exigence: ${test.expectedLevel} ${meetsExpectation ? "✅" : "❌"}`
    );
    console.log("");

    if (meetsExpectation) {
      passedTests++;
    } else {
      failedTests.push(`${test.name} - Ratio: ${result.ratio}:1`);
    }
  });

  // Résumé
  console.log("🎯 RÉSUMÉ DES TESTS");
  console.log("==================");
  console.log(`Total: ${totalTests} tests`);
  console.log(`Réussis: ${passedTests} tests ✅`);
  console.log(`Échoués: ${totalTests - passedTests} tests ❌`);
  console.log(
    `Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%\n`
  );

  if (failedTests.length > 0) {
    console.log("⚠️  TESTS ÉCHOUÉS:");
    failedTests.forEach((test) => console.log(`   • ${test}`));
    console.log("");
  }

  // Recommandations
  console.log("💡 RECOMMANDATIONS WCAG 2.1:");
  console.log("• Ratio minimum 4.5:1 pour le niveau AA (texte normal)");
  console.log("• Ratio minimum 3:1 pour le niveau AA (texte large)");
  console.log("• Ratio minimum 7:1 pour le niveau AAA");
  console.log(
    "• Testez avec de vrais utilisateurs ayant des déficiences visuelles"
  );
  console.log("• Vérifiez sur différents appareils et conditions d'éclairage");

  if (passedTests === totalTests) {
    console.log(
      "\n🎉 Félicitations ! Tous les tests d'accessibilité sont réussis !"
    );
  } else {
    console.log(
      "\n⚠️ Certains tests ont échoué. Veuillez ajuster les couleurs."
    );
  }
}

// Exécution du script
if (require.main === module) {
  runAccessibilityTests();
}
