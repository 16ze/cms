/**
 * 🛡️ CLIENT ERROR HANDLING
 * ========================
 *
 * Gestion centralisée des erreurs côté client avec intégration Sentry
 * - Capture automatique des erreurs React
 * - Gestion des erreurs API
 * - Logging structuré
 */

'use client'

import * as Sentry from '@sentry/nextjs'

// Intercepter les erreurs IMMÉDIATEMENT au chargement du module (avant React)
// Ceci s'exécute avant setupGlobalErrorHandler() pour capturer les erreurs très tôt
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  // Note: Le navigateur affiche automatiquement les erreurs HTTP dans la console
  // Nous ne pouvons pas empêcher cela complètement, mais nous filtrons console.error

  // Remplacer console.error immédiatement
  console.error = (...args: any[]) => {
    const errorMessage = args
      .map(arg => (typeof arg === 'string' ? arg : arg?.message || arg?.toString() || ''))
      .join(' ')

    const ignoredPatterns = [
      /insertBefore/i,
      /removeChild/i,
      /not a child/i,
      /Suspense boundary/i,
      /server rendering/i,
      /Switched to client rendering/i,
      /Could not finish this Suspense boundary/i,
      /The server could not finish this Suspense boundary/i,
      /Hydration failed/i,
      /Hydration mismatch/i,
      /Hydration/i,
      /Minified React error/i,
      /React.*error/i,
      // Filtrer les erreurs 401/403 sur /api/auth/me (attendues sur les pages de login)
      /401.*Unauthorized.*api\/auth\/me/i,
      /403.*Forbidden.*api\/auth\/me/i,
      /GET.*api\/auth\/me.*401/i,
      /GET.*api\/auth\/me.*403/i,
      /►.*GET.*api\/auth\/me.*401/i,
      /►.*GET.*api\/auth\/me.*403/i,
    ]

    if (ignoredPatterns.some(pattern => pattern.test(errorMessage))) {
      return // Ignorer silencieusement
    }

    originalConsoleError.apply(console, args)
  }

  // Remplacer console.warn immédiatement
  console.warn = (...args: any[]) => {
    const warnMessage = args
      .map(arg => (typeof arg === 'string' ? arg : arg?.message || arg?.toString() || ''))
      .join(' ')

    const ignoredPatterns = [
      /Suspense boundary/i,
      /server rendering/i,
      /Switched to client rendering/i,
      /Hydration/i,
    ]

    if (ignoredPatterns.some(pattern => pattern.test(warnMessage))) {
      return // Ignorer silencieusement
    }

    originalConsoleWarn.apply(console, args)
  }
}

export interface ErrorContext {
  userId?: string
  tenantId?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

/**
 * Capture une erreur client avec contexte
 */
export function captureClientError(error: Error | unknown, context?: ErrorContext): void {
  // Ne pas capturer les erreurs avec un contexte complètement vide en développement
  // (sauf si c'est vraiment une erreur critique)
  const hasContext = context && Object.keys(context).length > 0
  const isDevelopment = process.env.NODE_ENV === 'development'

  // En développement, logger dans la console uniquement si on a un contexte ou si c'est une vraie erreur
  if (isDevelopment) {
    if (error instanceof Error || hasContext) {
      console.error('🚨 Client Error:', error)
      // Ne logger le contexte que s'il contient réellement des informations
      if (hasContext) {
        console.error('📋 Context:', context)
      }
    }
  }

  // Capturer dans Sentry avec contexte enrichi seulement si on a un contexte ou une vraie erreur
  if (!hasContext && !(error instanceof Error)) {
    // Ignorer les erreurs sans contexte et sans objet Error en développement
    if (isDevelopment) {
      return
    }
  }

  // Capturer dans Sentry avec contexte enrichi
  if (error instanceof Error) {
    try {
      Sentry.captureException(error, {
        tags: {
          source: 'client',
          component: context?.component || 'unknown',
          action: context?.action || 'unknown',
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
        level: 'error',
      })
    } catch (sentryError) {
      // Ignorer les erreurs Sentry pour éviter les boucles infinies
      if (isDevelopment) {
        console.warn('Erreur lors de la capture Sentry:', sentryError)
      }
    }
  } else {
    // Erreur non-standard (string, objet, etc.)
    try {
      Sentry.captureMessage(String(error), {
        level: 'error',
        tags: {
          source: 'client',
          component: context?.component || 'unknown',
        },
        contexts: {
          custom: {
            ...context,
            errorType: typeof error,
          },
        },
      })
    } catch (sentryError) {
      // Ignorer les erreurs Sentry
      if (isDevelopment) {
        console.warn('Erreur lors de la capture Sentry:', sentryError)
      }
    }
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
  })
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
      return await fn(...args)
    } catch (error) {
      captureClientError(error, {
        ...context,
        action: fn.name || 'unknown-function',
        metadata: {
          ...context?.metadata,
          args: JSON.stringify(args),
        },
      })
      throw error // Re-throw pour permettre la gestion locale
    }
  }) as T
}

/**
 * Gestionnaire d'erreur globale pour window.onerror
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return

  // Intercepter les erreurs AVANT qu'elles ne soient loggées dans la console
  // Remplacer console.error pour filtrer les erreurs DOM/Suspense
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.error = (...args: any[]) => {
    const errorMessage = args
      .map(arg => (typeof arg === 'string' ? arg : arg?.message || arg?.toString() || ''))
      .join(' ')

    // Filtrer les erreurs DOM et Suspense avant qu'elles n'apparaissent
    const ignoredPatterns = [
      /insertBefore/i,
      /removeChild/i,
      /not a child/i,
      /Suspense boundary/i,
      /server rendering/i,
      /Switched to client rendering/i,
      /Could not finish this Suspense boundary/i,
      /The server could not finish this Suspense boundary/i,
      /Hydration failed/i,
      /Hydration mismatch/i,
      /Hydration/i,
      /Minified React error/i,
      /React.*error/i,
      // Filtrer les erreurs 401/403 sur /api/auth/me (attendues sur les pages de login)
      /401.*Unauthorized.*api\/auth\/me/i,
      /403.*Forbidden.*api\/auth\/me/i,
      /GET.*api\/auth\/me.*401/i,
      /GET.*api\/auth\/me.*403/i,
      /►.*GET.*api\/auth\/me.*401/i,
      /►.*GET.*api\/auth\/me.*403/i,
    ]

    const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(errorMessage))

    if (shouldIgnore) {
      // Ne pas logger ces erreurs - elles sont non critiques et causent du spam
      return
    }

    // Logger les autres erreurs normalement
    originalConsoleError.apply(console, args)
  }

  console.warn = (...args: any[]) => {
    const warnMessage = args
      .map(arg => (typeof arg === 'string' ? arg : arg?.message || arg?.toString() || ''))
      .join(' ')

    // Filtrer les warnings Suspense aussi
    const ignoredPatterns = [
      /Suspense boundary/i,
      /server rendering/i,
      /Switched to client rendering/i,
      /Hydration/i,
    ]

    const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(warnMessage))

    if (shouldIgnore) {
      return
    }

    originalConsoleWarn.apply(console, args)
  }

  window.addEventListener('error', event => {
    // Filtrer les erreurs DOM non critiques de React/Next.js
    const errorMessage = event.error?.message || event.message || ''
    const errorName = event.error?.name || ''
    const errorSource = event.filename || ''

    // Ignorer les erreurs DOM communes de React/Next.js qui ne sont pas critiques
    const ignoredErrors = [
      'insertBefore',
      'removeChild',
      "Failed to execute 'insertBefore'",
      "Failed to execute 'removeChild'",
      'The node before which the new node is to be inserted is not a child',
      'The node to be removed is not a child',
      'not a child',
      'not a child of this node',
      'Suspense boundary',
      'server rendering',
      'Switched to client rendering',
      'Could not finish this Suspense boundary',
      'The server could not finish this Suspense boundary',
      'Hydration failed',
      'Hydration',
      'Hydration mismatch',
      'Minified React error',
    ]

    // Filtrer les erreurs réseau 401/403 sur /api/auth/me (attendues sur les pages de login)
    const isAuthMeError =
      (errorMessage.includes('api/auth/me') &&
        (errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('Forbidden'))) ||
      (errorSource.includes('api/auth/me') &&
        (errorMessage.includes('401') || errorMessage.includes('403')))

    const shouldIgnore =
      ignoredErrors.some(
        ignored => errorMessage.includes(ignored) || errorName.includes(ignored)
      ) || isAuthMeError

    if (shouldIgnore) {
      // Ces erreurs sont généralement causées par React/Next.js pendant le hot-reload
      // ou sont des erreurs attendues (401/403 sur pages de login)
      // Empêcher la propagation pour éviter qu'elles apparaissent dans la console
      event.preventDefault()
      event.stopPropagation()
      return
    }

    // S'assurer d'avoir un contexte valide avant de capturer
    const hasValidContext =
      event.filename || event.lineno || event.colno || errorName || errorMessage

    if (!hasValidContext) {
      // Ignorer les erreurs sans contexte valide en développement
      if (process.env.NODE_ENV === 'development') {
        return
      }
    }

    captureClientError(event.error || event.message, {
      component: 'global-error-handler',
      action: 'window-error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorName: errorName,
        errorMessage: errorMessage.substring(0, 200),
      },
    })
  })

  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason?.message || String(event.reason || '')

    // Filtrer les erreurs DOM non critiques et Suspense
    const ignoredErrors = [
      'insertBefore',
      'removeChild',
      "Failed to execute 'insertBefore'",
      "Failed to execute 'removeChild'",
      'not a child',
      'not a child of this node',
      'Suspense boundary',
      'server rendering',
      'Switched to client rendering',
      'Could not finish this Suspense boundary',
      'The server could not finish this Suspense boundary',
      'Hydration failed',
      'Hydration',
      'Hydration mismatch',
      'Minified React error',
    ]

    // Filtrer les erreurs réseau 401/403 sur /api/auth/me
    const isAuthMeError =
      reason.includes('api/auth/me') &&
      (reason.includes('401') ||
        reason.includes('403') ||
        reason.includes('Unauthorized') ||
        reason.includes('Forbidden'))

    const shouldIgnore = ignoredErrors.some(ignored => reason.includes(ignored)) || isAuthMeError

    if (shouldIgnore) {
      // Empêcher la propagation pour éviter qu'elles apparaissent dans la console
      event.preventDefault()
      return
    }

    // S'assurer d'avoir un contexte valide avant de capturer
    if (!reason || reason.length === 0) {
      // Ignorer les erreurs sans contexte valide en développement
      if (process.env.NODE_ENV === 'development') {
        return
      }
    }

    captureClientError(event.reason, {
      component: 'global-error-handler',
      action: 'unhandled-promise-rejection',
      metadata: {
        reason: reason.substring(0, 200),
      },
    })
  })
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Unknown error' }
      }

      // Construire un message d'erreur plus informatif
      const errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`

      // Ne pas capturer les erreurs 401/403 lors des tentatives de login (attendues)
      const isLoginEndpoint = endpoint.includes('/auth/login')
      const isAuthError = response.status === 401 || response.status === 403

      // Capturer l'erreur seulement si :
      // - Ce n'est pas une erreur d'authentification lors d'un login (401/403 sur /auth/login)
      // - ET (on a un contexte valide OU c'est une erreur serveur 500+)
      const hasValidContext = context && Object.keys(context).length > 0
      const shouldCapture =
        !(isLoginEndpoint && isAuthError) &&
        (hasValidContext || (response.status >= 500 && response.status < 600))

      if (shouldCapture) {
        captureApiError(
          new Error(errorMessage),
          endpoint,
          options?.method || 'GET',
          response.status,
          context
        )
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    // Si c'est déjà une erreur que nous avons créée, ne pas la capturer à nouveau
    if (error instanceof Error && error.message.includes('API Error')) {
      throw error // Déjà capturé
    }

    // Capturer les erreurs réseau uniquement si on a un contexte valide
    const hasValidContext = context && Object.keys(context).length > 0
    if (hasValidContext) {
      captureApiError(
        error instanceof Error ? error : new Error(String(error)),
        endpoint,
        options?.method || 'GET',
        undefined,
        context
      )
    }

    throw error
  }
}
