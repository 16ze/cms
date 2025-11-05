/**
 * 📝 LOGGER CENTRALISÉ
 * ====================
 * 
 * Logger structuré pour l'application CMS KAIRO Digital
 * Utilise console pour la simplicité (peut être remplacé par pino/winston en production)
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.level =
      (process.env.LOG_LEVEL as LogLevel) ||
      (this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context
      ? ` ${JSON.stringify(context)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
              }
            : error,
      };
      console.error(
        this.formatMessage(LogLevel.ERROR, message, errorContext)
      );
    }
  }

  /**
   * Logger spécifique pour les opérations multi-tenant
   */
  tenant(
    level: LogLevel,
    message: string,
    tenantId: string,
    context?: Omit<LogContext, "tenantId">
  ): void {
    this[level](message, { ...context, tenantId });
  }

  /**
   * Logger spécifique pour les opérations API
   */
  api(
    level: LogLevel,
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
    });
  }
}

// Export d'une instance singleton
export const logger = new Logger();

