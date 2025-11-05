import { PrismaClient } from "@prisma/client";
import { initializePrismaMiddleware } from "./prisma-middleware";

// PrismaClient est attaché au scope global en développement pour éviter
// d'épuiser les connexions pendant les hot-reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Initialiser le middleware d'isolation tenant
if (typeof window === "undefined") {
  try {
    initializePrismaMiddleware();
  } catch (error) {
    // Éviter les erreurs si le middleware est déjà initialisé
    console.warn("Prisma middleware initialization skipped:", error);
  }
}
