# CMS KAIRO Digital

[![CI](https://github.com/16ze/cms/workflows/CI/badge.svg)](https://github.com/16ze/cms/actions)
[![Quality](https://github.com/16ze/cms/workflows/Quality%20%26%20Security/badge.svg)](https://github.com/16ze/cms/actions)

CMS modulaire multi-tenant développé par KAIRO Digital.

## 🚀 Stack Technique

- **Framework:** Next.js 15.2+ (React 19)
- **Base de données:** Prisma ORM avec SQLite (dev) / PostgreSQL (production)
- **Styling:** TailwindCSS
- **Langage:** TypeScript
- **Tests:** Playwright
- **Build:** Turbopack

## 📋 Prérequis

- Node.js 18+ 
- npm ou pnpm
- SQLite (pour le développement)

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Base de données
DATABASE_URL="file:./prisma/prisma/dev.db"

# Session admin (minimum 32 caractères)
ADMIN_SESSION_SECRET="votre-secret-super-securise-minimum-32-caracteres"

# URL du site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Google OAuth (pour Search Console et Analytics)
GOOGLE_OAUTH_CLIENT_ID="votre-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="votre-client-secret"
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Google Analytics
GOOGLE_ANALYTICS_PROPERTY_ID="G-XXXXXXXXXX"

# Google Search Console (optionnel)
GOOGLE_SEARCH_CONSOLE_SITE_URL="sc-domain:votre-domaine.com"

# Google Custom Search (optionnel)
GOOGLE_CUSTOM_SEARCH_API_KEY="votre-api-key"
GOOGLE_CUSTOM_SEARCH_ENGINE_ID="votre-engine-id"

# Google PageSpeed Insights (optionnel)
GOOGLE_PAGESPEED_API_KEY="votre-api-key"

# Email (optionnel)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASSWORD="votre-mot-de-passe"
EMAIL_FROM="noreply@votre-domaine.com"
```

## 🚀 Commandes disponibles

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run typecheck

# Vérifier les types en mode strict
npm run typecheck:strict

# Vérifier la configuration
npm run check:env
```

### Base de données

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Réinitialiser les utilisateurs et créer le super admin
npx tsx prisma/seeds/reset-users.ts
```

### Build et Production

```bash
# Construire l'application
npm run build

# Démarrer en mode production
npm start

# Build pour Heroku
npm run heroku-postbuild
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests avec interface graphique
npm run test:ui

# Tests en mode debug
npm run test:debug

# Tests d'accessibilité
npm run test:accessibility

# Tests de performance
npm run test:performance

# Tests de sécurité
npm run test:security
```

### Scripts utilitaires

```bash
# Initialiser le projet
npm run init

# Configurer le contenu
npm run configure

# Nettoyer les fallbacks
npm run clean

# Seed propre
npm run seed:clean
```

## 📁 Structure du projet

```
cms/
├── prisma/              # Schéma Prisma et migrations
│   ├── schema.prisma    # Schéma principal
│   ├── migrations/      # Migrations de base de données
│   └── seeds/           # Scripts de seed
│
├── src/                 # Code source de l'application
│   ├── app/             # Routes Next.js (App Router)
│   │   ├── api/         # Routes API
│   │   ├── admin/       # Pages admin
│   │   └── super-admin/ # Pages super admin
│   │
│   ├── components/      # Composants React réutilisables
│   ├── lib/              # Utilitaires et services
│   └── hooks/            # Hooks React personnalisés
│
├── public/              # Assets statiques (images, fonts, etc.)
├── scripts/              # Scripts Node.js utilitaires
├── tests/                # Tests Playwright
├── docs/                 # Documentation
│   └── archive/         # Documentation historique archivée
│
├── next.config.ts       # Configuration Next.js
├── tailwind.config.js    # Configuration TailwindCSS
├── tsconfig.json        # Configuration TypeScript
└── package.json          # Dépendances et scripts
```

## 🔐 Authentification

### Super Admin

- **URL:** `/super-admin/login`
- **Email:** `contact-sa@kairodigital.fr`
- **Mot de passe:** Défini lors de la réinitialisation des utilisateurs

### Tenant Users

- **URL:** `/login`
- Les identifiants sont créés lors de la création d'un tenant

## 🌐 Architecture Multi-Tenant

Le système supporte plusieurs tenants (clients) avec :

- **Isolation des données** par tenant
- **Templates personnalisables** par tenant
- **Gestion des utilisateurs** par tenant
- **Super Admin** avec accès global

## 📚 Documentation

La documentation historique et les rapports sont archivés dans `docs/archive/`.

Pour plus d'informations sur :
- L'architecture multi-tenant : voir `docs/archive/IMPLEMENTATION-MULTI-TENANT-COMPLETE.md`
- La configuration SEO : voir `docs/archive/GUIDE-CONFIGURATION-GOOGLE-OAUTH-SEO.md`
- La sécurité : voir `docs/archive/RAPPORT-SECURISATION.md`

## 🔒 Sécurité

- Headers de sécurité HTTP configurés (X-Frame-Options, CSP, etc.)
- Variables sensibles dans `.env.local` (non versionnées)
- Authentification sécurisée avec sessions httpOnly
- Isolation des données par tenant

## 📝 Contribution

1. Créer une branche depuis `main`
2. Faire les modifications
3. Tester localement
4. Créer une Pull Request

## 📞 Support

Pour toute question, contactez l'équipe KAIRO Digital.

---

**Développé par KAIRO Digital** 🚀

