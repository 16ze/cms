# 🔧 Guide de Configuration Sentry

Ce guide vous explique comment configurer Sentry pour le monitoring des erreurs en production.

## 📋 Prérequis

1. Un compte Sentry ([https://sentry.io](https://sentry.io))
2. Un projet Sentry créé pour votre application Next.js
3. Votre DSN (Data Source Name) Sentry

## 🔑 Configuration des Variables d'Environnement

### Variables Requises

Ajoutez ces variables dans votre fichier `.env.local` (développement) ou dans les variables d'environnement de votre plateforme de déploiement (production) :

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://votre-dsn@sentry.io/votre-projet-id
SENTRY_ENVIRONMENT=production  # ou "development", "staging"
SENTRY_SAMPLE_RATE=1.0  # 0.0 à 1.0 (1.0 = 100% des erreurs capturées)
SENTRY_ORG=votre-org-name
SENTRY_PROJECT=votre-projet-name
SENTRY_AUTH_TOKEN=votre-auth-token  # Optionnel, pour upload source maps
```

### Où Trouver votre DSN ?

1. Connectez-vous à [Sentry.io](https://sentry.io)
2. Allez dans **Settings** → **Projects** → Sélectionnez votre projet
3. Dans **Client Keys (DSN)**, copiez votre DSN
4. Collez-le dans `NEXT_PUBLIC_SENTRY_DSN`

### Où Trouver votre Auth Token ?

1. Dans Sentry, allez dans **Settings** → **Account** → **Auth Tokens**
2. Créez un nouveau token avec les permissions :
   - `project:read`
   - `project:releases`
   - `org:read`
3. Collez-le dans `SENTRY_AUTH_TOKEN` (optionnel, pour source maps)

## 🚀 Configuration Automatique

Les fichiers de configuration Sentry sont déjà créés :

- `sentry.client.config.ts` - Configuration côté client
- `sentry.server.config.ts` - Configuration côté serveur
- `next.config.ts` - Intégration avec Next.js

## ✅ Vérification de la Configuration

### 1. Utiliser le script de vérification automatique

Un script de vérification automatique est disponible :

```bash
npm run check:sentry
```

Ce script vérifie :
- ✅ Présence des variables d'environnement
- ✅ Format du DSN
- ✅ Présence des fichiers de configuration
- ✅ Intégration dans `next.config.ts`
- ✅ Configuration du sample rate

Il affiche un rapport détaillé avec les erreurs et avertissements.

### 2. Tester la capture d'erreurs

Créez une route de test temporaire pour vérifier que Sentry fonctionne :

```typescript
// src/app/api/test-sentry/route.ts
export async function GET() {
  throw new Error("Test Sentry - Cette erreur devrait être capturée");
}
```

Puis visitez `/api/test-sentry` dans votre navigateur. Vous devriez voir l'erreur apparaître dans votre dashboard Sentry dans les 30 secondes.

### 3. Vérifier les logs

Dans votre console de développement, vous devriez voir :

```
Sentry initialized
```

Si vous voyez des erreurs, vérifiez :
- Que `NEXT_PUBLIC_SENTRY_DSN` est correctement défini
- Que le DSN commence bien par `https://`
- Que votre projet Sentry est actif

## 📊 Utilisation en Production

### Environnements Recommandés

```env
# Développement
SENTRY_ENVIRONMENT=development
SENTRY_SAMPLE_RATE=1.0  # Capturer toutes les erreurs en dev

# Staging
SENTRY_ENVIRONMENT=staging
SENTRY_SAMPLE_RATE=0.5  # Capturer 50% des erreurs

# Production
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=0.1  # Capturer 10% des erreurs pour éviter la surcharge
```

### Source Maps (Optionnel)

Pour avoir des stack traces lisibles en production, configurez l'upload des source maps :

1. Installez le plugin Sentry CLI :
```bash
npm install --save-dev @sentry/cli
```

2. Le plugin est déjà configuré dans `next.config.ts` avec `withSentryConfig`

3. Lors du build, les source maps seront automatiquement uploadées si `SENTRY_AUTH_TOKEN` est défini

## 🎯 Bonnes Pratiques

### 1. Niveaux d'Erreur

Sentry capture automatiquement :
- ✅ Erreurs non gérées (unhandled errors)
- ✅ Rejections de promesses (unhandled promise rejections)
- ✅ Erreurs dans les routes API

### 2. Contexte Personnalisé

Vous pouvez ajouter du contexte personnalisé dans vos routes :

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.setUser({
  id: user.id,
  email: user.email,
  tenantId: user.tenantId,
});

Sentry.setContext("request", {
  url: request.url,
  method: request.method,
});
```

### 3. Ignorer Certaines Erreurs

Pour ignorer certaines erreurs (ex: erreurs de validation connues), ajoutez dans `sentry.server.config.ts` ou `sentry.client.config.ts` :

```typescript
beforeSend(event, hint) {
  // Ignorer les erreurs de validation Zod
  if (event.exception?.values?.[0]?.value?.includes("ZodError")) {
    return null;
  }
  return event;
},
```

## 🔍 Monitoring et Alertes

### Alertes Email

1. Dans Sentry, allez dans **Alerts** → **Create Alert**
2. Configurez les conditions (ex: plus de 10 erreurs en 5 minutes)
3. Ajoutez vos emails de notification

### Intégrations

Sentry supporte de nombreuses intégrations :
- Slack
- Discord
- Microsoft Teams
- PagerDuty
- etc.

Configurez-les dans **Settings** → **Integrations**

## 📚 Documentation

- [Documentation Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Configuration Sentry](https://docs.sentry.io/product/sentry-basics/configuration/)
- [Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)

## ❓ Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur
2. Vérifiez que les variables d'environnement sont bien définies
3. Consultez la [documentation Sentry](https://docs.sentry.io/)
4. Vérifiez le dashboard Sentry pour les erreurs de configuration

---

**Note** : Les fichiers de configuration Sentry sont déjà créés et prêts à l'emploi. Il vous suffit d'ajouter vos variables d'environnement pour activer le monitoring.

