# 🔧 Configuration Upstash Redis pour Rate Limiting

Ce guide explique comment configurer Upstash Redis pour le rate limiting en production.

## 📋 Prérequis

- Compte Upstash (gratuit jusqu'à 10K requêtes/jour)
- Variables d'environnement configurées dans votre plateforme de déploiement

## 🚀 Étapes de configuration

### 1. Créer un compte Upstash

1. Aller sur [https://upstash.com](https://upstash.com)
2. Créer un compte (gratuit)
3. Sélectionner "Redis" dans le dashboard

### 2. Créer une base de données Redis

1. Cliquer sur "Create Database"
2. Choisir une région proche de votre serveur (ex: `eu-west-1` pour l'Europe)
3. Sélectionner le plan (gratuit jusqu'à 10K requêtes/jour)
4. Nommer la base de données (ex: `kairo-cms-ratelimit`)

### 3. Récupérer les credentials

Une fois la base créée, vous verrez :
- **UPSTASH_REDIS_REST_URL** : URL de l'API REST (ex: `https://xxx.upstash.io`)
- **UPSTASH_REDIS_REST_TOKEN** : Token d'authentification

### 4. Configurer les variables d'environnement

#### En développement local (.env.local)

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

#### En production (Vercel, Heroku, etc.)

**Vercel :**
```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

**Heroku :**
```bash
heroku config:set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
heroku config:set UPSTASH_REDIS_REST_TOKEN=xxx
```

**Railway / Render :**
- Ajouter les variables dans le dashboard sous "Environment Variables"

### 5. Vérifier la configuration

Le rate limiting fonctionne automatiquement si les variables sont configurées. En développement, si Redis n'est pas configuré, le rate limiting est désactivé avec un avertissement dans les logs.

## 📊 Monitoring du rate limiting

### Dashboard Upstash

1. Aller sur le dashboard Upstash
2. Sélectionner votre base Redis
3. Voir les métriques :
   - Nombre de requêtes
   - Latence
   - Utilisation de la mémoire

### Logs applicatifs

Les logs incluent automatiquement :
- Tentatives de rate limit dépassées
- Identifiant de la requête
- Limite atteinte

Exemple de log :
```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "identifier": "192.168.1.1",
  "limit": 100,
  "remaining": 0,
  "path": "/api/admin/clients"
}
```

## 🔧 Ajuster les limites

Les limites sont définies dans `src/lib/rate-limit.ts` :

```typescript
// Routes API générales
globalApiRateLimiter: 100 req/min

// Routes d'authentification
authRateLimiter: 5 req/min

// Routes admin
adminRateLimiter: 200 req/min

// Routes super-admin
superAdminRateLimiter: 500 req/min
```

Pour modifier ces limites, éditer `src/lib/rate-limit.ts` et redéployer.

## 🧪 Tester le rate limiting

### Test manuel

```bash
# Tester avec curl (100 requêtes rapides)
for i in {1..101}; do
  curl -X GET http://localhost:3000/api/admin/clients
done

# La 101ème requête devrait retourner 429 Too Many Requests
```

### Test avec Playwright

Voir `tests/e2e/rate-limiting.spec.ts` pour des tests automatisés.

## ⚠️ Troubleshooting

### Rate limiting ne fonctionne pas

1. Vérifier les variables d'environnement :
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. Vérifier les logs pour les erreurs Redis :
   ```json
   {
     "level": "error",
     "message": "Rate limit error",
     "error": "..."
   }
   ```

3. Tester la connexion Redis :
   ```bash
   curl -X GET "$UPSTASH_REDIS_REDIS_REST_URL/ping" \
     -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
   ```

### Limites trop strictes

Si vous recevez trop de 429 :
1. Augmenter les limites dans `src/lib/rate-limit.ts`
2. Vérifier qu'il n'y a pas d'attaque DDoS
3. Ajuster selon vos besoins métier

### Coûts Upstash

Le plan gratuit inclut :
- 10K requêtes/jour
- 256 MB de stockage
- Pas de limite de temps

Pour plus de requêtes, voir les plans payants sur [upstash.com/pricing](https://upstash.com/pricing).

## 📚 Ressources

- [Documentation Upstash Redis](https://docs.upstash.com/redis)
- [Documentation @upstash/ratelimit](https://github.com/upstash/ratelimit)
- [Code source rate-limit.ts](../../src/lib/rate-limit.ts)

