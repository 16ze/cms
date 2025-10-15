import fs from "node:fs";
import path from "node:path";

const examplePath = path.resolve(process.cwd(), ".env.example");
const envPath = path.resolve(process.cwd(), ".env");

if (!fs.existsSync(examplePath)) {
  console.error("❌ .env.example introuvable");
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  console.error(
    "❌ .env introuvable. Copiez .env.example vers .env avant de lancer le script."
  );
  process.exit(1);
}

const parseEnvFile = (filePath: string) =>
  fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]);

const exampleKeys = new Set(parseEnvFile(examplePath));
const envKeys = new Set(parseEnvFile(envPath));

const missing = Array.from(exampleKeys).filter((key) => !envKeys.has(key));

if (missing.length > 0) {
  console.error("❌ Variables manquantes dans .env :", missing.join(", "));
  process.exit(1);
}

console.log("✅ .env contient toutes les variables de .env.example");
