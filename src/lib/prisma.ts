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

// Initialiser les middlewares Prisma
if (typeof window === "undefined") {
  try {
    // Middleware d'isolation tenant
    initializePrismaMiddleware();
    
    // Middleware de monitoring (si activé et pas en Edge Runtime)
    // Utiliser un import dynamique pour éviter le chargement de prom-client en Edge Runtime
    const isEdgeRuntime = typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge";
    
    if (process.env.ENABLE_METRICS === "true" && !isEdgeRuntime) {
      // Import dynamique pour éviter le chargement de prom-client en Edge Runtime
      import("./monitoring/metrics")
        .then(({ createPrismaMonitoringMiddleware }) => {
          prisma.$use(createPrismaMonitoringMiddleware());
        })
        .catch((error) => {
          console.warn("Failed to load monitoring middleware:", error);
        });
    }
  } catch (error) {
    // Éviter les erreurs si les middlewares sont déjà initialisés
    console.warn("Prisma middleware initialization skipped:", error);
  }
}
