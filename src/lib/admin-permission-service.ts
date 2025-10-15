import { prisma } from "@/lib/prisma";

export type Permission = {
  id: string;
  userId: string;
  page: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type PermissionInput = {
  page: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export class AdminPermissionService {
  /**
   * Récupérer toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const permissions = await prisma.adminPermission.findMany({
      where: { userId },
    });
    return permissions;
  }

  /**
   * Définir les permissions pour un utilisateur
   * Remplace toutes les permissions existantes
   */
  async setUserPermissions(
    userId: string,
    permissions: PermissionInput[]
  ): Promise<Permission[]> {
    // Supprimer toutes les permissions existantes
    await prisma.adminPermission.deleteMany({
      where: { userId },
    });

    // Créer les nouvelles permissions
    const created = await prisma.adminPermission.createMany({
      data: permissions.map((p) => ({
        ...p,
        userId,
      })),
    });

    // Retourner les permissions créées
    return this.getUserPermissions(userId);
  }

  /**
   * Vérifier si un utilisateur a accès à une page
   */
  async hasPageAccess(
    userId: string,
    userRole: string,
    page: string
  ): Promise<boolean> {
    // Super admin a toujours accès
    if (userRole === "SUPER_ADMIN") {
      return true;
    }

    // Pour les admins, vérifier les permissions spécifiques
    const permission = await prisma.adminPermission.findUnique({
      where: {
        userId_page: {
          userId,
          page,
        },
      },
    });

    return permission?.canView ?? false;
  }

  /**
   * Vérifier si un utilisateur peut éditer une page
   */
  async canEdit(
    userId: string,
    userRole: string,
    page: string
  ): Promise<boolean> {
    if (userRole === "SUPER_ADMIN") {
      return true;
    }

    const permission = await prisma.adminPermission.findUnique({
      where: {
        userId_page: {
          userId,
          page,
        },
      },
    });

    return permission?.canEdit ?? false;
  }

  /**
   * Vérifier si un utilisateur peut supprimer sur une page
   */
  async canDelete(
    userId: string,
    userRole: string,
    page: string
  ): Promise<boolean> {
    if (userRole === "SUPER_ADMIN") {
      return true;
    }

    const permission = await prisma.adminPermission.findUnique({
      where: {
        userId_page: {
          userId,
          page,
        },
      },
    });

    return permission?.canDelete ?? false;
  }

  /**
   * Pages disponibles pour la configuration des permissions
   */
  getAvailablePages() {
    return [
      {
        id: "dashboard",
        name: "Dashboard",
        description: "Tableau de bord et statistiques",
      },
      {
        id: "reservations",
        name: "Réservations",
        description: "Gestion des rendez-vous",
      },
      {
        id: "clients",
        name: "Clients",
        description: "Base de données clients",
      },
      {
        id: "content",
        name: "Contenu",
        description: "Gestion du contenu du site",
      },
      {
        id: "site",
        name: "Site",
        description: "Configuration du site",
      },
      {
        id: "settings",
        name: "Paramètres",
        description: "Paramètres généraux",
      },
    ];
  }
}

export const adminPermissionService = new AdminPermissionService();

