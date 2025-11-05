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
    // Initialiser le gestionnaire d'erreurs global
    setupGlobalErrorHandler();
  }, []);

  return null;
}

