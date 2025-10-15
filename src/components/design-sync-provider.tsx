"use client";

import { useClientDesignSync } from "@/hooks/use-client-design-sync";
import { useEffect } from "react";

interface DesignSyncProviderProps {
 children: React.ReactNode;
}

export function DesignSyncProvider({ children }: DesignSyncProviderProps) {
 const { designSettings, loading, error, refreshDesignSettings } = useClientDesignSync();

 // Appliquer les paramètres de design au chargement
 useEffect(() => {
 if (designSettings && !loading) {
 // Les couleurs sont automatiquement appliquées par le hook
 console.log("✅ Paramètres de design synchronisés:", designSettings);
 }
 }, [designSettings, loading]);

 // Gérer les erreurs de synchronisation
 useEffect(() => {
 if (error) {
 console.warn("⚠️ Erreur de synchronisation design:", error);
 }
 }, [error]);

 return <>{children}</>;
}
