import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Nombre maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30 secondes
  connectionTimeoutMillis: 2000, // Timeout de connexion de 2 secondes
});

// Gestion des erreurs de connexion
pool.on("error", (err: Error) => {
  console.error("Erreur inattendue sur le client PostgreSQL", err);
  process.exit(-1);
});

export default pool;
