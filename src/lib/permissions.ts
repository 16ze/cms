export type UserRole = "admin" | "super_admin";

export interface Permission {
  page: string;
  roles: UserRole[];
  description: string;
}

// Définition des permissions par page
export const PERMISSIONS: Permission[] = [
  {
    page: "dashboard",
    roles: ["admin", "super_admin"],
    description: "Tableau de bord - Accès aux statistiques générales",
  },
  {
    page: "reservations",
    roles: ["admin", "super_admin"],
    description: "Gestion des réservations - Confirmer/refuser les RDV",
  },
  {
    page: "clients",
    roles: ["admin", "super_admin"],
    description:
      "Base de données clients - Gérer les informations clients et historique",
  },
  {
    page: "content-advanced",
    roles: ["super_admin"],
    description:
      "Gestion du contenu - Interface complète d'édition des pages et sections",
  },
  {
    page: "site",
    roles: ["super_admin"],
    description: "Gestion du site - Configuration du header, footer et boutons",
  },
  {
    page: "users",
    roles: ["super_admin"],
    description:
      "Gestion des utilisateurs - Créer/modifier/supprimer les comptes admin",
  },
  {
    page: "settings",
    roles: ["super_admin"],
    description: "Paramètres - Configuration générale du site",
  },
];

// Vérifier si un utilisateur a accès à une page
export function hasPageAccess(userRole: UserRole, page: string): boolean {
  const permission = PERMISSIONS.find((p) => p.page === page);
  if (!permission) {
    // Par défaut, seul le super admin a accès aux pages non définies
    return userRole === "super_admin";
  }

  return permission.roles.includes(userRole);
}

// Obtenir toutes les pages accessibles pour un rôle
export function getAccessiblePages(userRole: UserRole): string[] {
  return PERMISSIONS.filter((permission) =>
    permission.roles.includes(userRole)
  ).map((permission) => permission.page);
}

// Vérifier si un utilisateur est le super admin principal
export function isSuperAdmin(userRole: UserRole, userEmail: string): boolean {
  return (
    userRole === "super_admin" && userEmail === "contact.kairodigital@gmail.com"
  );
}

// Obtenir les restrictions d'accès pour un utilisateur
export function getUserRestrictions(
  userRole: UserRole,
  userEmail: string
): {
  isRestricted: boolean;
  accessiblePages: string[];
  restrictedPages: string[];
  message: string;
} {
  const isMainAdmin = isSuperAdmin(userRole, userEmail);
  const accessiblePages = getAccessiblePages(userRole);
  const allPages = PERMISSIONS.map((p) => p.page);
  const restrictedPages = allPages.filter(
    (page) => !accessiblePages.includes(page)
  );

  return {
    isRestricted: !isMainAdmin,
    accessiblePages,
    restrictedPages,
    message: isMainAdmin
      ? "Accès complet - Administrateur principal"
      : `Accès limité - Rôle: ${
          userRole === "admin" ? "Administrateur" : "Super Administrateur"
        }`,
  };
}
