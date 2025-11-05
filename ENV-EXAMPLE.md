# 📋 Variables d'Environnement Requises

Ce fichier liste toutes les variables d'environnement nécessaires pour le fonctionnement complet de l'application.

Copier ce fichier vers `.env.local` et remplir les valeurs :

```bash
cp ENV-EXAMPLE.md .env.local
```

## 🔐 Variables Requises (Minimum)

```env
# Secret pour les sessions admin (générer avec: openssl rand -hex 32)
ADMIN_SESSION_SECRET=your-secret-key-here

# URL de connexion Prisma
DATABASE_URL="file:./dev.db"

# Environnement
NODE_ENV=development
```

## 🔒 Variables Recommandées (Sécurité)

```env
# Upstash Redis pour rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Prometheus Metrics
ENABLE_METRICS=true
METRICS_AUTH_TOKEN=your-metrics-token-here

# Origines autorisées pour CSRF
ALLOWED_ORIGINS=https://votredomaine.com
```

## 📊 Variables Optionnelles (Monitoring)

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_ORG=xxx
SENTRY_PROJECT=xxx
```

## 🚀 Configuration Rapide

```bash
# Utiliser les scripts de configuration
./scripts/setup-upstash-redis.sh
./scripts/setup-prometheus.sh

# Vérifier la configuration
npm run check:env:complete
```

