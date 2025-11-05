"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureClientError } from "@/lib/errors";

/**
 * 🛡️ ERROR BOUNDARY POUR L'ESPACE ADMIN
 * 
 * Protège l'application contre :
 * - ✅ Erreurs de rendu React
 * - ✅ Erreurs de validation JSON
 * - ✅ Erreurs d'accès aux données
 * - ✅ Erreurs inattendues
 * 
 * Fonctionnalités :
 * - 🎨 UI professionnelle et moderne
 * - 🔄 Bouton de réinitialisation
 * - 🏠 Retour au dashboard
 * - 📋 Log détaillé des erreurs
 * - 💡 Messages d'aide contextuel
 * 
 * @author KAIRO Digital - Senior Developer Team
 * @version 1.0.0
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  timestamp?: Date;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return {
      hasError: true,
      error,
      timestamp: new Date(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // En développement, logger dans la console
    if (process.env.NODE_ENV === "development") {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ ERROR BOUNDARY : Une erreur a été interceptée");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("⏰ Timestamp:", new Date().toISOString());
      console.error("📋 Erreur:", error);
      console.error("🔍 Stack:", error.stack);
      console.error("🌳 Component Stack:", errorInfo.componentStack);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    // Mettre à jour l'état avec les infos d'erreur
    this.setState({ errorInfo });

    // Callback personnalisé (si fourni)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Capturer dans Sentry avec contexte React
    captureClientError(error, {
      component: "AdminErrorBoundary",
      action: "react-error-boundary",
      metadata: {
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      },
    });
  }

  handleReset = () => {
    // Réinitialiser l'état pour retenter le rendu
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      timestamp: undefined,
    });
  };

  handleGoHome = () => {
    // Rediriger vers le dashboard
    window.location.href = "/admin/dashboard";
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, afficher l'UI d'erreur par défaut
      const isDev = process.env.NODE_ENV === "development";
      const { error, errorInfo, timestamp } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    Une erreur est survenue
                  </h1>
                  <p className="text-red-100 text-sm">
                    L'application a rencontré un problème inattendu
                  </p>
                </div>
              </div>
              {timestamp && (
                <p className="text-red-100 text-xs">
                  {timestamp.toLocaleString("fr-FR")}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">
                    Message d'erreur :
                  </h3>
                  <p className="text-sm text-red-700 font-mono break-words">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Détails techniques (dev only) */}
              {isDev && error?.stack && (
                <details className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <summary className="text-sm font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">
                    🔍 Détails techniques (mode développement)
                  </summary>
                  <pre className="mt-4 text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                  {errorInfo?.componentStack && (
                    <pre className="mt-4 text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap border-t border-slate-200 pt-4">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              {/* Actions suggérées */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">
                  💡 Actions suggérées :
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Essayez de rafraîchir la page en cliquant sur "Réessayer"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Si le problème persiste, revenez au dashboard
                    </span>
                  </li>
                  {isDev && (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        Vérifiez le fichier <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">admin-content.json</code> pour les erreurs de configuration
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Consultez la console du navigateur pour plus de détails
                    </span>
                  </li>
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition-all duration-200 hover:scale-[1.02]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-300 hover:bg-slate-50 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour au dashboard
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Si le problème persiste, contactez le support technique
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Pas d'erreur, afficher les enfants normalement
    return this.props.children;
  }
}

/**
 * 🎯 HOC (Higher Order Component) pour wrapper facilement une page
 * 
 * @example
 * ```tsx
 * export default withAdminErrorBoundary(DashboardPage);
 * ```
 */
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AdminErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };
}

