-- PostgreSQL
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

CREATE TABLE "AdminUser" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "hashedPassword" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- SQLite (development)
-- Comment out the block above and uncomment the one below if you use SQLite locally.
--
-- CREATE TABLE "AdminUser" (
--   "id" TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
--   "email" TEXT NOT NULL UNIQUE,
--   "hashedPassword" TEXT NOT NULL,
--   "role" TEXT NOT NULL DEFAULT 'ADMIN',
--   "lastLogin" DATETIME,
--   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );
--
-- CREATE TRIGGER set_AdminUser_updated_at
-- AFTER UPDATE ON "AdminUser"
-- FOR EACH ROW
-- BEGIN
--   UPDATE "AdminUser" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = NEW."id";
-- END;
