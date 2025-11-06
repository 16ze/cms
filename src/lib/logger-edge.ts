/**
 * 📝 LOGGER EDGE RUNTIME - Compatible Edge Runtime uniquement
 * ===========================================================
 * 
 * Logger simplifié pour Edge Runtime qui n'importe JAMAIS pino
 * Utilisé dans le middleware Next.js qui s'exécute dans Edge Runtime
 */

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
 * Logger simple pour Edge Runtime (utilise console uniquement)
 * Compatible avec le middleware Next.js Edge Runtime
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
            }
          : error,
    };
    
    console.error(this.formatMessage("error", String(error || message), errorContext));
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

// Export de l'instance Edge Logger (pas d'import de pino)
export const enhancedLogger = new EdgeLogger();

