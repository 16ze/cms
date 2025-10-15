import bcrypt from "bcryptjs";

const password = "KairoAdmin2024!";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Erreur lors du hashage du mot de passe:", err);
    return;
  }
  console.log("Mot de passe hashé:", hash);
  console.log(
    "\nCopiez cette valeur dans votre fichier .env comme ADMIN_PASSWORD"
  );
});
