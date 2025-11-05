# 🧪 Tests de Sécurité - Documentation

Ce document décrit les tests de sécurité automatisés pour le CMS KAIRO Digital.

## 📋 Tests Disponibles

### 1. Tests de Rate Limiting (`rate-limiting.spec.ts`)

Vérifie que le rate limiting fonctionne correctement :

- ✅ **Rate limiting standard** : 100 requêtes/min sur routes API
- ✅ **Rate limiting strict** : 5 requêtes/min sur routes d'authentification
- ✅ **Headers de rate limiting** : Présence de `Retry-After`, `X-RateLimit-Limit`, etc.
- ✅ **Réinitialisation** : Le rate limiting se réinitialise après la fenêtre de temps

**Commandes** :
```bash
npm run test:security:e2e -- rate-limiting
# ou
playwright test tests/e2e/rate-limiting.spec.ts
```

### 2. Tests de Validation Zod (`validation-zod.spec.ts`)

Vérifie que la validation Zod fonctionne correctement :

- ✅ **Validation email** : Rejette les emails invalides
- ✅ **Validation UUID** : Rejette les UUIDs invalides
- ✅ **Validation dates/heures** : Rejette les formats invalides
- ✅ **Champs requis** : Rejette les requêtes incomplètes
- ✅ **Sanitization XSS** : Supprime les scripts malveillants
- ✅ **Validation enum** : Rejette les valeurs non autorisées

**Commandes** :
```bash
npm run test:security:e2e -- validation-zod
# ou
playwright test tests/e2e/validation-zod.spec.ts
```

### 3. Tests des Headers de Sécurité (`security-headers.spec.ts`)

Vérifie que tous les headers de sécurité HTTP sont présents :

- ✅ **X-Frame-Options** : `DENY` pour prévenir le clickjacking
- ✅ **X-Content-Type-Options** : `nosniff` pour prévenir MIME sniffing
- ✅ **X-XSS-Protection** : Protection contre les attaques XSS
- ✅ **Strict-Transport-Security** : Force HTTPS en production
- ✅ **Content-Security-Policy** : Protection contre les injections
- ✅ **Referrer-Policy** : Contrôle de l'envoi du referrer
- ✅ **Permissions-Policy** : Désactive les permissions sensibles

**Commandes** :
```bash
npm run test:security:e2e -- security-headers
# ou
playwright test tests/e2e/security-headers.spec.ts
```

### 4. Tests d'Isolation Multi-Tenant (`isolation.spec.ts`)

Vérifie que chaque tenant est complètement isolé :

- ✅ **Isolation lecture** : Tenant A ne voit pas les ressources de Tenant B
- ✅ **Isolation écriture** : Création automatique avec le bon tenantId
- ✅ **Isolation modification** : Tenant B ne peut pas modifier les ressources de Tenant A
- ✅ **Super Admin** : Peut voir toutes les ressources

**Commandes** :
```bash
npm run test:isolation
# ou
playwright test tests/e2e/isolation.spec.ts
```

## 🚀 Exécution des Tests

### Tous les Tests de Sécurité

```bash
npm run test:security:all
```

Cette commande exécute :
1. Tests statiques (`test:security`)
2. Tests E2E de sécurité (`test:security:e2e`)

### Tests E2E de Sécurité Uniquement

```bash
npm run test:security:e2e
```

### Tests Individuels

```bash
# Rate limiting
playwright test tests/e2e/rate-limiting.spec.ts

# Validation Zod
playwright test tests/e2e/validation-zod.spec.ts

# Headers de sécurité
playwright test tests/e2e/security-headers.spec.ts

# Isolation multi-tenant
playwright test tests/e2e/isolation.spec.ts
```

### Mode Débogage

```bash
# Mode UI interactif
playwright test tests/e2e/rate-limiting.spec.ts --ui

# Mode headed (affiche le navigateur)
playwright test tests/e2e/rate-limiting.spec.ts --headed

# Mode debug
playwright test tests/e2e/rate-limiting.spec.ts --debug
```

## ⚙️ Configuration

Les tests utilisent la configuration définie dans `playwright.config.ts` :

- **Base URL** : `http://localhost:3000`
- **Mode headless** : Activé en CI, désactivé en local
- **Retry** : 2 tentatives en CI, 0 en local
- **Screenshots** : Capturés uniquement en cas d'échec
- **Vidéo** : Conservée uniquement en cas d'échec

## 📊 Rapports

Les rapports sont générés automatiquement :

- **HTML** : Ouvrir avec `npm run test:report`
- **JUnit XML** : `tests-logs/ci-report/playwright-results.xml`
- **JSON** : `tests-logs/ci-report/playwright-results.json`

## 🔧 Prérequis

Avant d'exécuter les tests :

1. **Serveur de développement** : Doit être lancé sur `http://localhost:3000`
   ```bash
   npm run dev
   ```

2. **Base de données** : Doit être configurée et migrée
   ```bash
   npx prisma migrate dev
   ```

3. **Variables d'environnement** : `.env.local` doit être configuré

## 📝 Notes

- Les tests de rate limiting peuvent nécessiter plusieurs secondes pour déclencher la limite
- Certains tests nécessitent une authentification valide (cookies)
- Les tests d'isolation utilisent une base de données de test (`test.db`)
- Les tests sont conçus pour être idempotents (peuvent être exécutés plusieurs fois)

## 🐛 Dépannage

### Erreur : "Cannot connect to http://localhost:3000"

Vérifiez que le serveur de développement est lancé :
```bash
npm run dev
```

### Erreur : "Database not found"

Vérifiez que la base de données existe :
```bash
npx prisma migrate dev
```

### Tests de rate limiting échouent

Les tests de rate limiting peuvent être sensibles au timing. Essayez :
- D'exécuter les tests individuellement
- D'augmenter les délais dans les tests
- De vérifier que le cache de rate limiting est vide avant les tests

## 🔗 Voir Aussi

- [Documentation Playwright](https://playwright.dev/docs/intro)
- [Tests E2E existants](./tests/e2e/)
- [Audit de sécurité](../../AUDIT-SECURITE.md)

