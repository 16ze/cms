# 🚦 Configuration Redis pour Rate Limiting

Ce guide explique comment configurer Redis (Upstash) pour le rate limiting distribué en production.

## 📋 Prérequis

1. Un compte [Upstash](https://upstash.com) (gratuit jusqu'à 10K requêtes/jour)
2. Une base de données Redis créée sur Upstash

## 🔑 Configuration

### Variables d'Environnement

Ajoutez ces variables dans votre `.env.local` (développement) ou dans les variables d'environnement de votre plateforme de déploiement (production) :

```env
# Redis Upstash Configuration
UPSTASH_REDIS_REST_URL=https://votre-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre-token-secret
```

### Où Trouver ces Informations ?

1. Connectez-vous à [Upstash Console](https://console.upstash.com)
2. Créez une nouvelle base de données Redis ou sélectionnez une existante
3. Dans l'onglet **Details**, copiez :
   - **REST URL** → `UPSTASH_REDIS_REST_URL`
   - **REST TOKEN** → `UPSTASH_REDIS_REST_TOKEN`

## 🎯 Rate Limiting Configuré

Le système utilise différents rate limiters selon le type de route :

| Route | Limite | Fenêtre |
|-------|--------|---------|
| **Routes API publiques** | 10 req/sec | 1 seconde |
| **Routes d'authentification** | 5 req/min | 1 minute |
| **Routes Admin** | 200 req/min | 1 minute |
| **Routes Super Admin** | 300 req/min | 1 minute |

## 🔧 Fonctionnement

### En Développement

Si Redis n'est **pas configuré**, le rate limiting est **automatiquement désactivé** en développement pour éviter de bloquer le développement local.

```typescript
// En développement sans Redis, le rate limiting est skippé
if (
  process.env.NODE_ENV === "development" &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
) {
  return null; // Pas de blocage
}
```

### En Production

En production, Redis est **requis** pour un rate limiting distribué efficace. Sans Redis, le système utilise un fallback en mémoire (LRU cache) qui n'est pas distribué.

## 📊 Monitoring

Le système de rate limiting envoie automatiquement des logs pour :
- Les requêtes bloquées (rate limit exceeded)
- Les erreurs Redis (avec fallback automatique)
- Les statistiques d'utilisation

### Headers de Réponse

Quand une requête est bloquée, les headers suivants sont retournés :

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
```

## 🧪 Tests

Les tests de rate limiting sont disponibles dans `tests/e2e/rate-limiting.spec.ts` :

```bash
# Exécuter les tests de rate limiting
npm run test:security:e2e
```

## ⚠️ Dépannage

### Redis Non Configuré

**Symptôme** : Les logs montrent "Rate limiting skipped - Redis not configured"

**Solution** :
1. Vérifier que `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont définis
2. Vérifier que les valeurs sont correctes
3. Redémarrer l'application

### Erreurs Redis

**Symptôme** : Erreurs "Rate limit error" dans les logs

**Solution** :
- Le système utilise automatiquement un fallback en mémoire
- Vérifier la connexion Redis sur Upstash Console
- Vérifier que le quota Upstash n'est pas dépassé

### Rate Limiting Trop Strict

**Symptôme** : Requêtes légitimes bloquées

**Solution** :
Modifier les limites dans `src/lib/rate-limit.ts` :

```typescript
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 s"), // Augmenter à 20 req/sec
  analytics: true,
  prefix: "@upstash/ratelimit/api-strict",
});
```

## 📚 Ressources

- [Documentation Upstash](https://docs.upstash.com/redis)
- [Documentation @upstash/ratelimit](https://github.com/upstash/ratelimit)
- [Rate Limiting Best Practices](https://upstash.com/blog/rate-limiting-best-practices)

## ✅ Checklist de Déploiement

- [ ] Compte Upstash créé
- [ ] Base Redis créée
- [ ] Variables d'environnement configurées
- [ ] Tests de rate limiting passés
- [ ] Monitoring configuré
- [ ] Documentation équipe à jour

