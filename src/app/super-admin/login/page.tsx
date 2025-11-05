"use client";

/**
 * PAGE LOGIN SUPER ADMIN (KAIRO DIGITAL)
 * =======================================
 * Accès réservé au développeur KAIRO
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { validateEmail, validatePassword } from "@/lib/validation-client";
import { safeApiCall, captureClientError } from "@/lib/errors";
import { toast } from "sonner";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    // Validation côté client stricte
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || "");
      return;
    }

    setLoading(true);

    try {
      const data = await safeApiCall<{ success: boolean; error?: string }>(
        "/api/auth/login/super-admin",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        {
          component: "SuperAdminLoginPage",
          action: "super-admin-login-attempt",
        }
      );

      if (!data.success) {
        const errorMessage = data.error || "Échec de la connexion";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Redirection sécurisée vers le dashboard
      toast.success("Connexion réussie");
      const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/admin/dashboard";
      router.push(redirectTo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion. Veuillez réessayer.";
      setError(errorMessage);
      toast.error(errorMessage);
      captureClientError(error, {
        component: "SuperAdminLoginPage",
        action: "super-admin-login-error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Super Admin
            </h1>
            <p className="text-purple-200 text-sm">
              Accès réservé KAIRO Digital
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-100 text-sm font-medium">
                  Erreur de connexion
                </p>
                <p className="text-red-200 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-purple-200 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => {
                    if (email) {
                      const validation = validateEmail(email);
                      if (!validation.valid) {
                        setEmailError(validation.error || "");
                      }
                    }
                  }}
                  required
                  placeholder="admin@kairodigital.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    emailError
                      ? "border-red-400/50 focus:ring-red-500"
                      : "border-white/20 focus:ring-purple-500"
                  }`}
                />
              </div>
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-300" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-purple-200 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => {
                    if (password) {
                      const validation = validatePassword(password);
                      if (!validation.valid) {
                        setPasswordError(validation.error || "");
                      }
                    }
                  }}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    passwordError
                      ? "border-red-400/50 focus:ring-red-500"
                      : "border-white/20 focus:ring-purple-500"
                  }`}
                />
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1 text-sm text-red-300" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-purple-300">
              Accès strictement réservé aux développeurs KAIRO
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-purple-300">
            © 2025 KAIRO Digital. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

