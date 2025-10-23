/**
 * Hook pour récupérer l'utilisateur connecté (Tenant ou Super Admin)
 * Compatible avec le nouveau système multi-tenant
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface TempAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  type?: "SUPER_ADMIN" | "TENANT_USER";
  tenantId?: string;
  tenantSlug?: string;
}

export function useTempAdmin() {
  const [user, setUser] = useState<TempAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Pas d'utilisateur connecté, rediriger vers login
          console.warn("Pas d'utilisateur connecté, redirection vers /login");
          router.push("/login");
          setLoading(false);
          return;
        }

        // Transformer les données de l'API en format TempAdminUser
        const apiUser = data.user;
        
        setUser({
          id: apiUser.id,
          name: apiUser.email.split('@')[0], // Utiliser le début de l'email comme nom
          email: apiUser.email,
          role: apiUser.type === "SUPER_ADMIN" ? "SUPER_ADMIN" : "TENANT_ADMIN",
          type: apiUser.type,
          tenantId: apiUser.tenantId,
          tenantSlug: apiUser.tenantSlug,
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        // En cas d'erreur, rediriger vers login
        router.push("/login");
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return { user, loading };
}

