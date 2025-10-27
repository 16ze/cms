import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const main = async () => {
  const email =
    process.env.ADMIN_DEFAULT_EMAIL?.trim().toLowerCase() ||
    "admin@example.com";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "ChangeMe123!";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log("[seed-admin] Admin user already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      email,
      name: "Administrateur",
      hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`[seed-admin] Admin user created for ${email}`);
};

main()
  .catch((error) => {
    console.error("[seed-admin] Failed to seed admin user", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
