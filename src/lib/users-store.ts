// Store temporaire pour les statistiques utilisateurs
// TODO: Remplacer par une vraie base de données

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

class UsersStore {
  private users: AdminUser[] = [];

  constructor() {
    // Initialiser avec un utilisateur admin par défaut pour les stats
    this.initializeDefaultAdmin();
  }

  private initializeDefaultAdmin() {
    const defaultAdmin: AdminUser = {
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: "SUPER_ADMIN",
      lastLogin: new Date().toISOString(),
    };

    this.users.push(defaultAdmin);
  }

  async getAll(): Promise<AdminUser[]> {
    return this.users;
  }

  async getById(id: string): Promise<AdminUser | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async getByEmail(email: string): Promise<AdminUser | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async getStats() {
    return {
      total: this.users.length,
      admins: this.users.filter(u => u.role === "ADMIN").length,
      superAdmins: this.users.filter(u => u.role === "SUPER_ADMIN").length,
    };
  }
}

// Instance singleton
export const usersStore = new UsersStore();

