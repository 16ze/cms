/**
 * 🔧 SETUP GLOBAL ERROR HANDLER
 * =============================
 *
 * Composant client pour initialiser le gestionnaire d'erreurs global
 * Doit être chargé côté client uniquement
 */

"use client";

import { useEffect } from "react";
import { setupGlobalErrorHandler } from "@/lib/errors";

export function ErrorHandlerSetup() {
  useEffect(() => {
    // Initialiser le gestionnaire d'erreurs global IMMÉDIATEMENT
    // Doit être appelé avant tout autre code pour intercepter les erreurs dès le début
    setupGlobalErrorHandler();
  }, []);

  return null;
}

