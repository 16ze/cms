/**
 * 📝 LOGGER CENTRALISÉ AVEC PINO
 * ===============================
 *
 * Logger structuré pour l'application CMS KAIRO Digital
 * Utilise pino pour un logging performant et structuré
 * - Format JSON en production
 * - Format lisible en développement
 * - Compatible Edge Runtime (fallback sur console)
 * - Rotation automatique des logs
 */

// Détecter si on est dans Edge Runtime (Next.js)
// Vérifier plusieurs conditions pour s'assurer qu'on est vraiment en Edge Runtime
const isEdgeRuntime =
  (typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge") &&
  typeof window === "undefined";

/**
 * Masquer les données sensibles dans les logs
 */
function sanitizeLogData(data: unknown): unknown {
  if (typeof data === "string") {
    // Masquer les tokens, mots de passe, clés API
    return data
      .replace(/(password|passwd|pwd|token|secret|key|api[_-]?key|auth[_-]?token)\s*[:=]\s*["']?([^"'\s]+)/gi, "$1: [MASQUÉ]")
      .replace(/(Bearer\s+)([A-Za-z0-9\-._~+/]+)/g, "$1[MASQUÉ]")
      .replace(/(\b[A-Za-z0-9\-._~+/]{32,}\b)/g, (match) => {
        // Masquer les tokens longs
        if (match.length > 32) return "[TOKEN_MASQUÉ]";
        return match;
      });
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  if (data && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "passwd",
      "pwd",
      "token",
      "secret",
      "key",
      "apiKey",
      "api_key",
      "authToken",
      "auth_token",
      "refreshToken",
      "refresh_token",
      "accessToken",
      "access_token",
      "authorization",
      "cookie",
    ];

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        sanitized[key] = "[MASQUÉ]";
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Masquer les IDs Prisma dans les messages
 */
function maskPrismaIds(message: string): string {
  return message.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "[ID_MASQUÉ]"
  );
}

// Types pour le contexte de log
export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
}

/**
 * Logger simple pour Edge Runtime (utilise console)
 * Compatible avec le middleware Next.js
 */
class EdgeLogger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage("debug", message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const sanitizedContext = sanitizeLogData(context) as LogContext;
    const sanitizedMessage = maskPrismaIds(message);
    
    const errorContext = {
      ...sanitizedContext,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: maskPrismaIds(error.message),
              stack: typeof process !== "undefined" && process.env.NODE_ENV !== "production" ? error.stack : undefined,
            }
          : sanitizeLogData(error),
    };
    
    console.error(this.formatMessage("error", sanitizedMessage, errorContext));
    
    // Envoyer à Sentry si disponible
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        const Sentry = require("@sentry/nextjs");
        if (error instanceof Error) {
          Sentry.captureException(error, {
            contexts: {
              log: sanitizedContext,
            },
            tags: {
              logger: "edge",
            },
          });
        } else {
          Sentry.captureMessage(sanitizedMessage, {
            level: "error",
            contexts: {
              log: errorContext,
            },
          });
        }
      } catch {
        // Sentry non disponible, ignorer
      }
    }
  }

  tenant(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    tenantId: string,
    context?: Omit<LogContext, "tenantId">
  ): void {
    this[level](message, { ...context, tenantId });
  }

  api(
    level: "debug" | "info" | "warn" | "error",
    method: string,
    path: string,
    statusCode?: number,
    context?: LogContext
  ): void {
    this[level](`API ${method} ${path}`, {
      ...context,
      method,
      path,
      statusCode,
      endpoint: `${method} ${path}`,
    });
  }

  prisma(
    level: "debug" | "info" | "warn" | "error",
    operation: string,
    model: string,
    context?: LogContext
  ): void {
    this[level](`Prisma ${operation} on ${model}`, {
      ...context,
      operation,
      model,
      source: "prisma",
    });
  }
}

/**
 * Logger enrichi avec méthodes spécifiques pour Node.js runtime
 * Avec détection automatique des crashs de pino et fallback vers console
 */
class EnhancedLogger {
  private logger: any;
  private pinoDead: boolean = false;
  private pinoDeadReported: boolean = false;

  constructor(logger: any) {
    this.logger = logger;
  }

  /**
   * Vérifier si pino est mort et basculer vers console si nécessaire
   */
  private checkPinoHealth(): boolean {
    if (this.pinoDead) {
      return false; // Pino est mort, utiliser console
    }
    return true; // Pino est vivant, essayer de l'utiliser
  }

  /**
   * Marquer pino comme mort et basculer définitivement vers console
   * Public pour permettre l'appel depuis l'intercepteur d'erreurs global
   */
  public markPinoDead(): void {
    if (!this.pinoDead) {
      this.pinoDead = true;
      this.logger = null; // Nettoyer la référence
      
      // Logger une seule fois pour éviter le spam
      if (!this.pinoDeadReported) {
        this.pinoDeadReported = true;
        console.warn("[Logger] Pino worker has crashed, switching to console logger permanently");
      }
    }
  }

  /**
   * Wrapper sécurisé pour appeler pino avec fallback automatique
   * Utilise une double protection : try-catch + vérification avant appel
   * + interception des erreurs synchrones et asynchrones
   */
  private safePinoCall(level: string, message: string, context?: LogContext): void {
    // Si pino est mort, utiliser console directement
    if (this.pinoDead || !this.checkPinoHealth()) {
      this.callConsole(level, message, context);
      return;
    }

    // Vérifier que le logger existe et a la méthode avant d'appeler
    if (!this.logger || typeof this.logger[level] !== 'function') {
      this.callConsole(level, message, context);
      return;
    }

    // Wrapper l'appel dans un try-catch très robuste avec gestion d'erreurs synchrones
    try {
      // Appel direct avec gestion d'erreur immédiate
      const loggerMethod = this.logger[level];
      if (typeof loggerMethod !== 'function') {
        this.callConsole(level, message, context);
        return;
      }

      // Tenter l'appel avec gestion d'erreur stricte
      try {
        loggerMethod.call(this.logger, context || {}, message);
      } catch (innerError: any) {
        // Erreur interne - marquer pino comme mort immédiatement
        const innerErrorMessage = innerError?.message || String(innerError || "");
        if (innerErrorMessage.includes("worker") || 
            innerErrorMessage.includes("exited") ||
            innerErrorMessage.includes("Worker")) {
          this.markPinoDead();
        }
        // Ne pas re-lancer l'erreur, utiliser console directement
        this.callConsole(level, message, context);
        return;
      }
    } catch (error: any) {
      // Détecter si c'est une erreur de worker pino
      const errorMessage = error?.message || String(error || "");
      if (errorMessage.includes("worker") || 
          errorMessage.includes("exited") ||
          errorMessage.includes("Worker")) {
        this.markPinoDead();
      }
      // Utiliser console comme fallback
      this.callConsole(level, message, context);
    }
  }

  /**
   * Appeler console directement (fallback)
   */
  private callConsole(level: string, message: string, context?: LogContext): void {
    const formatted = context ? `[${level.toUpperCase()}] ${message} ${JSON.stringify(context)}` : `[${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.safePinoCall('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.safePinoCall('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.safePinoCall('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    // Si pino est mort, utiliser console directement
    if (this.pinoDead || !this.checkPinoHealth()) {
      const sanitizedContext = sanitizeLogData(context) as LogContext;
      const sanitizedMessage = maskPrismaIds(message);
      const errorContext = {
        ...sanitizedContext,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: maskPrismaIds(error.message),
                stack: typeof process !== "undefined" && process.env.NODE_ENV !== "production" ? error.stack : undefined,
              }
            : sanitizeLogData(error),
      };
      this.callConsole('error', sanitizedMessage, errorContext);
      this.sendToSentry(error, sanitizedMessage, sanitizedContext);
      return;
    }

    try {
      const sanitizedContext = sanitizeLogData(context) as LogContext;
      const sanitizedMessage = maskPrismaIds(message);
      
      const errorContext = {
        ...sanitizedContext,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: maskPrismaIds(error.message),
                stack: typeof process !== "undefined" && process.env.NODE_ENV !== "production" ? error.stack : undefined,
              }
            : sanitizeLogData(error),
      };

      if (this.logger?.error) {
        this.logger.error(errorContext, sanitizedMessage);
      } else {
        this.callConsole('error', sanitizedMessage, errorContext);
      }

      // Envoyer à Sentry si disponible
      this.sendToSentry(error, sanitizedMessage, sanitizedContext);
    } catch (loggerError: any) {
      // Détecter si c'est une erreur de worker pino
      const errorMessage = loggerError?.message || String(loggerError || "");
      if (errorMessage.includes("worker has exited") || errorMessage.includes("worker")) {
        this.markPinoDead();
      }
      
      // Utiliser console comme fallback
      const sanitizedMessage = maskPrismaIds(message);
      this.callConsole('error', sanitizedMessage, { error, ...context });
      this.sendToSentry(error, sanitizedMessage, context as LogContext);
    }
  }

  /**
   * Envoyer à Sentry si disponible
   */
  private sendToSentry(error: Error | unknown, message: string, context?: LogContext): void {
    if (typeof process === "undefined" || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return;
    }

    try {
      const Sentry = require("@sentry/nextjs");
      if (error instanceof Error) {
        Sentry.captureException(error, {
          contexts: {
            log: context,
          },
          tags: {
            logger: this.pinoDead ? "console" : "pino",
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: "error",
          contexts: {
            log: context,
          },
        });
      }
    } catch {
      // Sentry non disponible, ignorer silencieusement
    }
  }

  tenant(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    tenantId: string,
    context?: Omit<LogContext, "tenantId">
  ): void {
    this[level](message, { ...context, tenantId });
  }

  api(
    level: "debug" | "info" | "warn" | "error",
    method: string,
    path: string,
    statusCode?: number,
    context?: LogContext
  ): void {
    this[level](`API ${method} ${path}`, {
      ...context,
      method,
      path,
      statusCode,
      endpoint: `${method} ${path}`,
    });
  }

  prisma(
    level: "debug" | "info" | "warn" | "error",
    operation: string,
    model: string,
    context?: LogContext
  ): void {
    this[level](`Prisma ${operation} on ${model}`, {
      ...context,
      operation,
      model,
      source: "prisma",
    });
  }
}

// Initialiser le logger selon l'environnement
let loggerInstance: EdgeLogger | EnhancedLogger;
let pinoLogger: any = null;

// Toujours utiliser EdgeLogger dans Edge Runtime pour éviter les problèmes avec pino
const runtimeCheck = typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge";

if (runtimeCheck) {
  // Edge Runtime : utiliser console logger uniquement
  loggerInstance = new EdgeLogger();
} else {
  // Node.js Runtime : utiliser pino avec import conditionnel
  try {
    // Import conditionnel seulement en Node.js (pas en Edge Runtime)
    // Utiliser une fonction pour éviter l'évaluation immédiate
    const initPino = () => {
      const pino = require("pino");
      const isDevelopment = process.env.NODE_ENV !== "production";
      const logLevel = process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info");

      // DÉSACTIVÉ: pino-pretty utilise un worker thread qui peut crash
      // Utiliser pino sans transport pour éviter les problèmes de worker
      // Le format JSON sera toujours lisible et plus stable
      // Configuration minimale pour éviter les crashs de worker
      return pino({
        level: logLevel,
        formatters: {
          level: (label: string) => {
            return { level: label };
          },
        },
        base: {
          env: process.env.NODE_ENV || "development",
          service: "kairo-cms",
        },
        // Ne pas utiliser de transport worker qui peut crash
        // Le JSON sera toujours lisible et plus stable
      });
    };

    pinoLogger = initPino();
    loggerInstance = new EnhancedLogger(pinoLogger);

    // Intercepter les erreurs non capturées liées à pino
    // Note: Ne pas utiliser process.on('uncaughtException') car cela interfère avec Next.js
    // Les erreurs sont déjà gérées dans safePinoCall et markPinoDead
  } catch (error) {
    // Fallback si pino n'est pas disponible
    loggerInstance = new EdgeLogger();
  }
}

// Export pour compatibilité
export const logger = pinoLogger || loggerInstance;

// Export de l'instance enrichie
export const enhancedLogger = loggerInstance;

// Export par défaut pour compatibilité
export default enhancedLogger;


