"use client";

import { useState, useEffect } from "react";

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

const DEFAULT_COLORS: Colors = {
  primary: "#3B82F6", // Blue-500
  secondary: "#6366F1", // Indigo-500
  accent: "#F59E0B", // Amber-500
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#1F2937",
  textSecondary: "#6B7280",
};

export function useColors() {
  const [colors, setColors] = useState<Colors>(DEFAULT_COLORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/colors");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des couleurs");
        }

        const data = await response.json();
        if (data.success && data.colors) {
          setColors({
            primary: data.colors.primary || DEFAULT_COLORS.primary,
            secondary: data.colors.secondary || DEFAULT_COLORS.secondary,
            accent: data.colors.accent || DEFAULT_COLORS.accent,
            background: data.colors.background || DEFAULT_COLORS.background,
            surface: data.colors.surface || DEFAULT_COLORS.surface,
            text: data.colors.text || DEFAULT_COLORS.text,
            textSecondary:
              data.colors.textSecondary || DEFAULT_COLORS.textSecondary,
          });
        }
      } catch (err) {
        console.warn(
          "⚠️ Erreur lors de la récupération des couleurs, utilisation des couleurs par défaut:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        // Garder les couleurs par défaut en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  return { colors, loading, error };
}


