import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@prisma/client";

const HASH_ROUNDS = 12;

interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}

interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
}

export class AdminUserService {
  private normaliseEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async validateCredentials(email: string, password: string) {
    const user = await prisma.adminUser.findUnique({
      where: { email: this.normaliseEmail(email) },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) return null;

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.email.split("@")[0],
      role: user.role,
    };
  }

  async list() {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map(({ hashedPassword, ...rest }) => rest);
  }

  async findById(id: string) {
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) return null;
    const { hashedPassword, ...rest } = user;
    return rest;
  }

  async create(input: CreateAdminUserInput) {
    const email = this.normaliseEmail(input.email);
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

    const hashedPassword = await bcrypt.hash(input.password, HASH_ROUNDS);

    const user = await prisma.adminUser.create({
      data: {
        name: input.name,
        email,
        hashedPassword,
        role: input.role ?? "ADMIN",
      },
    });

    const { hashedPassword: _hashed, ...rest } = user;
    return rest;
  }

  async update(id: string, input: UpdateAdminUserInput) {
    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.email) {
      const email = this.normaliseEmail(input.email);
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
      data.email = email;
    }

    if (input.password) {
      data.hashedPassword = await bcrypt.hash(input.password, HASH_ROUNDS);
    }

    if (input.role) {
      data.role = input.role;
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data,
    });

    const { hashedPassword, ...rest } = user;
    return rest;
  }

  async delete(id: string) {
    await prisma.adminUser.delete({ where: { id } });
  }

  async roleCounts() {
    const [total, admins, superAdmins] = await Promise.all([
      prisma.adminUser.count(),
      prisma.adminUser.count({ where: { role: "ADMIN" } }),
      prisma.adminUser.count({ where: { role: "SUPER_ADMIN" } }),
    ]);

    return { total, admins, superAdmins };
  }
}

export const adminUserService = new AdminUserService();
