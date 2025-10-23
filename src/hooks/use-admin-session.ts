/**
 * Hook pour récupérer les informations de l'utilisateur admin connecté
 * Remplace l'ancien hook use-temp-admin.ts
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAdminSession() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        // Vérifier la session en appelant l'API de vérification
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include", // Important pour inclure les cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser({
              id: data.user.id,
              name: data.user.name || data.user.email.split("@")[0],
              email: data.user.email,
              role: data.user.role,
            });
          } else {
            // Pas authentifié, rediriger vers login
            router.push("/login");
          }
        } else {
          // Erreur ou non authentifié, rediriger vers login
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la vérification de session:", error);
        // En cas d'erreur, rediriger vers login
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  return { user, loading };
}
