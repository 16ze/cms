// Hook temporaire pour bypasser l'authentification en développement
// TODO: Supprimer ce fichier et réactiver l'authentification complète

import { useState, useEffect } from "react";

export interface TempAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useTempAdmin() {
  const [user, setUser] = useState<TempAdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SOLUTION TEMPORAIRE : Utilisateur hardcodé
    // Pas d'appel API, pas de vérification
    setUser({
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
      role: "SUPER_ADMIN"
    });
    setLoading(false);
  }, []);

  return { user, loading };
}

