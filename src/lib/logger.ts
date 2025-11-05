/**
 * 📝 LOGGER CENTRALISÉ AVEC PINO
 * ===============================
 *
 * Logger structuré pour l'application CMS KAIRO Digital
 * Utilise pino pour un logging performant et structuré
 * - Format JSON en production
 * - Format lisible en développement
 * - Rotation automatique des logs
 */

import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";
const logLevel = (process.env.LOG_LEVEL as string) || (isDevelopment ? "debug" : "info");

// Configuration du transport (pretty en dev, JSON en prod)
const transport =
  isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

// Instance principale du logger
export const logger = pino(
  {
    level: logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    // Ajouter contexte par défaut
    base: {
      env: process.env.NODE_ENV || "development",
      service: "kairo-cms",
    },
  },
  transport ? pino.transport({ target: transport.target, options: transport.options }) : undefined
);

// Types pour le contexte de log
export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Logger enrichi avec méthodes spécifiques
 */
class EnhancedLogger {
  private pinoLogger: pino.Logger;

  constructor(pinoLogger: pino.Logger) {
    this.pinoLogger = pinoLogger;
  }

  debug(message: string, context?: LogContext): void {
    this.pinoLogger.debug(context || {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.pinoLogger.info(context || {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.pinoLogger.warn(context || {}, message);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: isDevelopment ? error.stack : undefined,
            }
          : error,
    };
    this.pinoLogger.error(errorContext, message);
  }

  /**
   * Logger spécifique pour les opérations multi-tenant
   */
  tenant(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    tenantId: string,
    context?: Omit<LogContext, "tenantId">
  ): void {
    this.pinoLogger[level]({ ...context, tenantId }, message);
  }

  /**
   * Logger spécifique pour les opérations API
   */
  api(
    level: "debug" | "info" | "warn" | "error",
    method: string,
    path: string,
    statusCode?: number,
    context?: LogContext
  ): void {
    this.pinoLogger[level](
      {
        ...context,
        method,
        path,
        statusCode,
        endpoint: `${method} ${path}`,
      },
      `API ${method} ${path}`
    );
  }

  /**
   * Logger pour les erreurs Prisma
   */
  prisma(
    level: "debug" | "info" | "warn" | "error",
    operation: string,
    model: string,
    context?: LogContext
  ): void {
    this.pinoLogger[level](
      {
        ...context,
        operation,
        model,
        source: "prisma",
      },
      `Prisma ${operation} on ${model}`
    );
  }
}

// Export d'une instance enrichie
export const enhancedLogger = new EnhancedLogger(logger);

// Export par défaut pour compatibilité
export default enhancedLogger;
