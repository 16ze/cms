# E2E – Authentification administrateur

1. Ouvrir `/admin/login`.
2. Saisir `ADMIN_DEFAULT_EMAIL` et `ADMIN_DEFAULT_PASSWORD`.
3. Soumettre → la page doit rediriger vers `/admin/dashboard`.
4. Vérifier la présence du cookie `admin_session` (httpOnly, SameSite=Strict, path=/admin).
5. Naviguer dans le dashboard (tableau de bord visible).
6. Modifier manuellement le cookie `admin_session` (altérer la signature).
7. Recharger `/admin/dashboard` → redirection immédiate vers `/admin/login`.
8. Lancer la déconnexion → le cookie est supprimé (maxAge 0).
