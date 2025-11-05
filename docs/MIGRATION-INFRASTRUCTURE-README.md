# 🚀 Migration Progressive & Configuration Infrastructure

Ce répertoire contient tous les outils et guides pour migrer progressivement les routes API vers `safeHandler` et configurer l'infrastructure de production.

## 📚 Documentation

### Guides disponibles

- **[Guide de Migration](./docs/GUIDE-MIGRATION-SAFE-HANDLER.md)** : Guide complet pour migrer les routes vers `safeHandler`
- **[Configuration Upstash Redis](./docs/CONFIGURATION-UPSTASH-REDIS.md)** : Guide de configuration Redis pour rate limiting
- **[Configuration Prometheus](./docs/CONFIGURATION-PROMETHEUS.md)** : Guide de configuration Prometheus pour monitoring

## 🛠️ Scripts disponibles

### Migration des routes

```bash
# Analyser un fichier spécifique
npm run migrate:routes -- --file src/app/api/admin/clients/route.ts

# Analyser tous les fichiers (dry-run)
npm run migrate:routes -- --all --dry-run

# Générer un template de migration
npm run migrate:routes -- --file src/app/api/admin/clients/route.ts --output src/app/api/admin/clients-migrated.ts
```

### Configuration Upstash Redis

```bash
# Configuration interactive
./scripts/setup-upstash-redis.sh

# Ou manuellement dans .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Configuration Prometheus

```bash
# Configuration interactive
./scripts/setup-prometheus.sh

# Démarrer Prometheus avec Docker
docker-compose -f docker-compose.prometheus.yml up -d

# Accéder à Prometheus UI
open http://localhost:9090
```

## 📊 Dashboard Grafana

Un dashboard pré-configuré est disponible dans `grafana/kairo-cms-dashboard.json`.

### Import dans Grafana

1. Ouvrir Grafana (http://localhost:3000)
2. Aller sur "Dashboards" > "Import"
3. Upload le fichier `grafana/kairo-cms-dashboard.json`
4. Sélectionner Prometheus comme source de données

### Métriques disponibles

- **HTTP Requests Total** : Nombre total de requêtes HTTP
- **HTTP Request Duration (p95)** : Latence des requêtes (percentile 95)
- **HTTP Requests by Status** : Répartition par code de statut
- **HTTP Requests by Tenant** : Requêtes par tenant
- **Database Queries Duration (p95)** : Durée des requêtes Prisma
- **API Errors Rate** : Taux d'erreurs par route
- **Slow Queries (> 200ms)** : Requêtes lentes détectées
- **Error Rate by Route** : Taux d'erreur par route

## 🎯 Plan de migration recommandé

### Phase 1 : Routes critiques (Semaine 1)

1. `/api/admin/clients/*` ✅ (exemple disponible)
2. `/api/admin/projets/*` ✅ (exemple disponible)
3. `/api/auth/*`
4. `/api/admin/users/*`
5. `/api/super-admin/tenants/*`

### Phase 2 : Routes importantes (Semaine 2-3)

1. `/api/admin/reservations/*`
2. `/api/admin/commandes/*`
3. `/api/admin/content/*`
4. `/api/admin/content/media/*`

### Phase 3 : Routes secondaires (Semaine 4+)

1. `/api/admin/stats/*`
2. `/api/admin/seo/*`
3. `/api/admin/design/*`
4. `/api/admin/themes/*`

## ✅ Checklist de migration

Pour chaque route migrée :

- [ ] Route refactorisée avec `safeHandler`
- [ ] Schémas Zod définis pour validation
- [ ] Tests existants passent toujours
- [ ] Tests d'isolation tenant ajoutés
- [ ] Logs structurés avec `requestId` vérifiés
- [ ] Erreurs capturées dans Sentry
- [ ] Rate limiting fonctionne
- [ ] Headers de sécurité présents

## 📝 Exemples de routes migrées

Consulter les exemples de référence :

- `src/app/api/admin/clients-refactored/route.ts`
- `src/app/api/admin/projets-refactored/route.ts`
- `src/app/api/admin/example-secure-route/route.ts`

## 🔧 Configuration Production

### Variables d'environnement requises

```env
# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Prometheus Metrics (monitoring)
ENABLE_METRICS=true
METRICS_AUTH_TOKEN=xxx

# Origines autorisées (CSRF)
ALLOWED_ORIGINS=https://votredomaine.com
```

### Vérification

```bash
# Vérifier la configuration
npm run check:env

# Tester le rate limiting
curl -X GET http://localhost:3000/api/admin/clients

# Tester les métriques
curl -H "Authorization: Bearer $METRICS_AUTH_TOKEN" \
  http://localhost:3000/api/metrics
```

## 🧪 Tests

Après chaque migration, exécuter les tests :

```bash
# Tests d'isolation tenant
npm run test:isolation

# Tests de sécurité
npm run test:security:e2e

# Tests complets
npm run test
```

## 📚 Ressources supplémentaires

- [Documentation safeHandler](../../src/lib/safe-handler.ts)
- [Documentation tenant-guard](../../src/lib/prisma/tenant-guard.ts)
- [Documentation rate-limit](../../src/lib/rate-limit.ts)
- [Documentation monitoring](../../src/lib/monitoring/metrics.ts)

