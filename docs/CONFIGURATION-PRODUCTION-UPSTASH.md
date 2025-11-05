# 🚀 Configuration Production - Upstash Redis

Ce guide explique comment configurer Upstash Redis pour le rate limiting en production.

## 📋 Prérequis

- Compte Upstash (gratuit jusqu'à 10K requêtes/jour)
- Variables d'environnement configurées dans votre plateforme de déploiement

## 🔧 Configuration Vercel

### 1. Créer la base Redis dans Upstash

1. Aller sur [https://console.upstash.com/redis](https://console.upstash.com/redis)
2. Cliquer sur "Create Database"
3. Choisir une région proche de votre serveur Vercel
4. Sélectionner le plan (gratuit jusqu'à 10K req/jour)
5. Nommer la base (ex: `kairo-cms-production`)

### 2. Récupérer les credentials

Sur la page de la base créée, vous verrez :
- **UPSTASH_REDIS_REST_URL** : URL de l'API REST
- **UPSTASH_REDIS_REST_TOKEN** : Token d'authentification

### 3. Configurer dans Vercel

#### Via Dashboard Vercel

1. Aller sur votre projet Vercel
2. Settings > Environment Variables
3. Ajouter :
   - `UPSTASH_REDIS_REST_URL` = `https://xxx.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `xxx`

#### Via CLI Vercel

```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

### 4. Redéployer

```bash
vercel --prod
```

## 🔧 Configuration Heroku

### 1. Créer la base Redis dans Upstash

(Même processus que pour Vercel)

### 2. Configurer dans Heroku

```bash
heroku config:set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
heroku config:set UPSTASH_REDIS_REST_TOKEN=xxx
```

### 3. Redéployer

```bash
git push heroku main
```

## 🔧 Configuration Railway / Render

### 1. Créer la base Redis dans Upstash

(Même processus que pour Vercel)

### 2. Configurer dans Railway / Render

**Railway :**
1. Ouvrir votre projet
2. Variables > New Variable
3. Ajouter `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

**Render :**
1. Ouvrir votre service
2. Environment > Add Environment Variable
3. Ajouter `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

## ✅ Vérification

### Test de connexion

```bash
curl -X GET "$UPSTASH_REDIS_REST_URL/ping" \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

Devrait retourner `PONG`.

### Vérifier dans les logs

Après déploiement, vérifier les logs :

```bash
# Vercel
vercel logs

# Heroku
heroku logs --tail

# Railway
railway logs
```

Chercher les messages :
- ✅ `Rate limiting active` = Configuration réussie
- ⚠️ `Rate limiting skipped - Redis not configured` = Configuration manquante

## 📊 Monitoring

### Dashboard Upstash

1. Aller sur [https://console.upstash.com](https://console.upstash.com)
2. Sélectionner votre base Redis
3. Voir les métriques :
   - Requêtes par jour
   - Latence
   - Utilisation mémoire

### Logs applicatifs

Les logs incluent automatiquement :
- Tentatives de rate limit dépassées
- Identifiant de la requête
- Limite atteinte

## 🔒 Sécurité

### Bonnes pratiques

1. ✅ Ne jamais commiter les tokens dans Git
2. ✅ Utiliser des tokens différents pour chaque environnement
3. ✅ Régénérer les tokens régulièrement (tous les 90 jours)
4. ✅ Limiter l'accès au dashboard Upstash avec 2FA

### Rotation des tokens

1. Aller sur le dashboard Upstash
2. Sélectionner votre base Redis
3. Settings > Regenerate Token
4. Mettre à jour les variables d'environnement
5. Redéployer

## ⚠️ Troubleshooting

### Rate limiting ne fonctionne pas

1. Vérifier les variables d'environnement :
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. Vérifier les logs pour les erreurs Redis

3. Tester la connexion :
   ```bash
   curl -X GET "$UPSTASH_REDIS_REST_URL/ping" \
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

