/**
 * 🛡️ SECURITY SETUP COMPONENT
 * ============================
 *
 * Composant client pour initialiser le Client Shield et la surveillance
 * Doit être utilisé uniquement côté client
 */

"use client";

import { useEffect } from "react";
import { initClientShield } from "@/lib/clientShield";
import { useSecurityWatchdog } from "@/hooks/useSecurityWatchdog";

/**
 * Composant SecuritySetup - Initialise toutes les protections client-side
 */
export function SecuritySetup() {
  // Initialiser le Client Shield (WAF)
  useEffect(() => {
    if (typeof window !== "undefined") {
      initClientShield();
    }
  }, []);

  // Activer le watchdog de sécurité
  useSecurityWatchdog({
    checkInterval: 5000,
    checkBundleIntegrity: true,
    checkBrowserExtensions: true,
    forceLogoutOnTampering: true,
    onThreatDetected: (threat) => {
      console.warn("🚨 Threat detected:", threat);
    },
  });

  // Ce composant ne rend rien
  return null;
}

