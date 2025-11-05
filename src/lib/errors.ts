/**
 * 🛡️ CLIENT ERROR HANDLING
 * ========================
 *
 * Gestion centralisée des erreurs côté client avec intégration Sentry
 * - Capture automatique des erreurs React
 * - Gestion des erreurs API
 * - Logging structuré
 */

"use client";

import * as Sentry from "@sentry/nextjs";

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Capture une erreur client avec contexte
 */
export function captureClientError(
  error: Error | unknown,
  context?: ErrorContext
): void {
  // En développement, logger dans la console
  if (process.env.NODE_ENV === "development") {
    console.error("🚨 Client Error:", error);
    if (context) {
      console.error("📋 Context:", context);
    }
  }

  // Capturer dans Sentry avec contexte enrichi
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        source: "client",
        component: context?.component || "unknown",
        action: context?.action || "unknown",
      },
      contexts: {
        user: context?.userId
          ? {
              id: context.userId,
            }
          : undefined,
        custom: {
          tenantId: context?.tenantId,
          ...context?.metadata,
        },
      },
      level: "error",
    });
  } else {
    // Erreur non-standard (string, objet, etc.)
    Sentry.captureMessage(String(error), {
      level: "error",
      tags: {
        source: "client",
        component: context?.component || "unknown",
      },
      contexts: {
        custom: {
          ...context,
          errorType: typeof error,
        },
      },
    });
  }
}

/**
 * Capture une erreur API avec détails de la requête
 */
export function captureApiError(
  error: Error | unknown,
  endpoint: string,
  method: string,
  statusCode?: number,
  context?: ErrorContext
): void {
  captureClientError(error, {
    ...context,
    action: `api-${method.toLowerCase()}`,
    metadata: {
      ...context?.metadata,
      endpoint,
      method,
      statusCode,
    },
  });
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur automatique
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureClientError(error, {
        ...context,
        action: fn.name || "unknown-function",
        metadata: {
          ...context?.metadata,
          args: JSON.stringify(args),
        },
      });
      throw error; // Re-throw pour permettre la gestion locale
    }
  }) as T;
}

/**
 * Gestionnaire d'erreur globale pour window.onerror
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureClientError(event.error || event.message, {
      component: "global-error-handler",
      action: "window-error",
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureClientError(event.reason, {
      component: "global-error-handler",
      action: "unhandled-promise-rejection",
      metadata: {
        reason: String(event.reason),
      },
    });
  });
}

/**
 * Valider une réponse API et capturer les erreurs
 */
export async function safeApiCall<T>(
  endpoint: string,
  options?: RequestInit,
  context?: ErrorContext
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      captureApiError(
        new Error(errorData.error || errorData.message || "API Error"),
        endpoint,
        options?.method || "GET",
        response.status,
        context
      );

      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("API Error")) {
      throw error; // Déjà capturé
    }

    captureApiError(
      error instanceof Error ? error : new Error(String(error)),
      endpoint,
      options?.method || "GET",
      undefined,
      context
    );

    throw error;
  }
}

