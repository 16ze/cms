# 🔒 Sécurité Avancée - Documentation

## Vue d'ensemble

Ce document décrit les améliorations de sécurité avancées implémentées dans le CMS KAIRO Digital.

## 1. Authentification & Sessions sécurisées

### Caractéristiques

- **HMAC SHA-512** : Les tokens de session sont signés avec HMAC SHA-512 (au lieu de SHA-256)
- **Expiration courte** : Les access tokens expirent après 30 minutes
- **Refresh tokens** : Système de refresh tokens chiffrés en base de données (AES-256-GCM)
- **Rotation automatique** : Les tokens sont automatiquement rotés après chaque login/logout
- **Cookies sécurisés** : `Secure`, `SameSite=Strict`, `httpOnly`

### Fichiers

- `src/lib/secure-session.ts` : Gestion des sessions sécurisées
- `src/lib/crypto-utils.ts` : Utilitaires de chiffrement (AES-256-GCM)

### Configuration

```env
ADMIN_SESSION_SECRET="votre-secret-de-au-moins-64-caracteres"
ENCRYPTION_KEY="optionnel-si-different-de-admin-session-secret"
```

## 2. Vérification renforcée côté API

### validateTenantContext()

Valide que les requêtes respectent l'isolation des tenants :

- Vérifie la présence du header `x-tenant-id`
- Compare avec la session utilisateur
- Bloque les accès croisés (tenant A → B)

### Vérification Origin/Referer

Protection contre CSRF et accès non autorisés.

### Rate Limiting

- **Routes API publiques** : 10 requêtes par seconde
- **Routes d'authentification** : 5 tentatives par minute
- **Routes admin** : 200 requêtes par minute
- **Routes super-admin** : 500 requêtes par minute

### Sanitisation des erreurs Prisma

Les erreurs Prisma sont automatiquement masquées en production pour éviter la fuite d'informations.

### Fichiers

- `src/lib/tenant-context-validator.ts` : Validation du contexte tenant
- `src/lib/prisma-error-sanitizer.ts` : Sanitisation des erreurs Prisma
- `src/lib/rate-limit.ts` : Rate limiting

## 3. Pare-feu applicatif Edge (WAF)

### Protection contre

- **XSS** : Détection de scripts, javascript:, eval(), etc.
- **SQL Injection** : Détection de patterns SQL malveillants
- **LFI/Path Traversal** : Blocage de `../`, `/etc/passwd`, etc.
- **Command Injection** : Détection de tentatives d'injection de commandes

### Limitations

- Payloads limités à 1 Mo maximum

### Logging

- Toutes les tentatives bloquées sont loggées
- Envoi automatique vers Sentry pour monitoring

### Header

Le header `X-Edge-Security: active` est ajouté à toutes les réponses API.

### Fichier

- `src/lib/waf.ts` : Implémentation du WAF
- `src/middleware.ts` : Intégration du WAF dans le middleware

## 4. Protection Super Admin

### 2FA TOTP

- Authentification à deux facteurs avec codes TOTP
- Génération de QR codes pour configuration
- Codes de secours chiffrés
- Secrets TOTP chiffrés avec AES-256-GCM

### Restrictions d'origine

L'accès Super Admin est limité aux origines définies dans `NEXT_PUBLIC_ADMIN_ALLOWED_ORIGINS`.

### Fichiers

- `src/lib/two-factor-auth.ts` : Implémentation 2FA
- `src/middleware.ts` : Vérification des origines

### Configuration

```env
NEXT_PUBLIC_ADMIN_ALLOWED_ORIGINS="https://admin.example.com,https://secure.example.com"
```

## 5. Sécurité réseau & CSP

### Headers de sécurité

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` : Politique stricte configurée

### Fichier

- `next.config.ts` : Configuration des headers

## 6. Monitoring & journalisation

### Caractéristiques

- **Format JSON** : Logs structurés en production
- **Masquage automatique** : Tokens, mots de passe, clés API masqués
- **IDs Prisma masqués** : Les UUIDs sont remplacés par `[ID_MASQUÉ]`
- **Intégration Sentry** : Les erreurs sont automatiquement envoyées à Sentry

### Rotation des logs

Gérée par Pino (via configuration système).

### Fichier

- `src/lib/logger.ts` : Logger amélioré avec masquage des données sensibles

## 7. Tests & validation

### Tests Playwright

- `tests/e2e/security-waf.spec.ts` : Tests du WAF
- `tests/e2e/security-isolation.spec.ts` : Tests d'isolation des tenants
- `tests/e2e/security-sessions.spec.ts` : Tests des sessions
- `tests/e2e/security-rate-limiting.spec.ts` : Tests du rate limiting

### Script de vérification

```bash
npm run test:security:advanced
```

### Fichier

- `scripts/test-security-advanced.ts` : Script de vérification automatique

## Migration Prisma

### Nouvelles tables

1. **RefreshToken** : Stockage des refresh tokens chiffrés
2. **SuperAdmin2FA** : Stockage des secrets 2FA chiffrés

### Migration

```bash
npx prisma migrate dev --name add_security_tables
```

## Configuration requise

### Variables d'environnement

```env
# Obligatoire (64 caractères minimum)
ADMIN_SESSION_SECRET="..."

# Optionnel (utilise ADMIN_SESSION_SECRET si non défini)
ENCRYPTION_KEY="..."

# Optionnel (pour restrictions Super Admin)
NEXT_PUBLIC_ADMIN_ALLOWED_ORIGINS="https://admin.example.com"

# Optionnel (pour rate limiting distribué)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Optionnel (pour monitoring)
NEXT_PUBLIC_SENTRY_DSN="..."
```

### Dépendances

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.0",
  "@upstash/ratelimit": "^2.0.7",
  "@upstash/redis": "^1.35.6"
}
```

## Vérification

### Vérifier la configuration

```bash
npm run test:security:advanced
```

### Exécuter les tests de sécurité

```bash
npm run test:security:e2e
```

## Notes importantes

1. **ADMIN_SESSION_SECRET** : Doit faire au moins 64 caractères pour HMAC SHA-512
2. **Production** : Toujours utiliser HTTPS en production
3. **Rate Limiting** : Nécessite Redis (Upstash) pour fonctionner en production
4. **2FA** : Optionnel mais fortement recommandé pour Super Admin
5. **Logs** : Les données sensibles sont automatiquement masquées

## Support

Pour toute question ou problème, consulter les logs Sentry ou les fichiers de log locaux.

