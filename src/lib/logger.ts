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
const isEdgeRuntime =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

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
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };
    console.error(this.formatMessage("error", message, errorContext));
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
 */
class EnhancedLogger {
  private logger: any;

  constructor(logger: any) {
    this.logger = logger;
  }

  debug(message: string, context?: LogContext): void {
    if (this.logger?.debug) {
      this.logger.debug(context || {}, message);
    } else {
      console.debug(`[DEBUG] ${message}`, context || {});
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.logger?.info) {
      this.logger.info(context || {}, message);
    } else {
      console.info(`[INFO] ${message}`, context || {});
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.logger?.warn) {
      this.logger.warn(context || {}, message);
    } else {
      console.warn(`[WARN] ${message}`, context || {});
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: typeof process !== "undefined" && process.env.NODE_ENV !== "production" ? error.stack : undefined,
            }
          : error,
    };

    if (this.logger?.error) {
      this.logger.error(errorContext, message);
    } else {
      console.error(`[ERROR] ${message}`, errorContext);
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

if (isEdgeRuntime) {
  // Edge Runtime : utiliser console logger
  loggerInstance = new EdgeLogger();
} else {
  // Node.js Runtime : utiliser pino avec import conditionnel
  try {
    // Import conditionnel seulement en Node.js
    const pino = require("pino");
    const isDevelopment = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
    const logLevel = (typeof process !== "undefined" && process.env.LOG_LEVEL) || (isDevelopment ? "debug" : "info");

    // Configuration du transport (pretty en dev, JSON en prod)
    const transport =
      isDevelopment && typeof pino.transport !== "undefined"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          }
        : undefined;

    // Créer l'instance pino
    pinoLogger = transport
      ? pino(
          {
            level: logLevel,
            formatters: {
              level: (label: string) => {
                return { level: label };
              },
            },
            base: {
              env: typeof process !== "undefined" ? process.env.NODE_ENV || "development" : "development",
              service: "kairo-cms",
            },
          },
          pino.transport({ target: transport.target, options: transport.options })
        )
      : pino({
          level: logLevel,
          formatters: {
            level: (label: string) => {
              return { level: label };
            },
          },
          base: {
            env: typeof process !== "undefined" ? process.env.NODE_ENV || "development" : "development",
            service: "kairo-cms",
          },
        });

    loggerInstance = new EnhancedLogger(pinoLogger);
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


