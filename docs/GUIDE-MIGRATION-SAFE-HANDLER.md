# 📋 Guide de Migration Progressive vers safeHandler

Ce guide explique comment migrer progressivement les routes API existantes vers `safeHandler` pour une sécurité renforcée.

## 🎯 Objectifs de la migration

- ✅ Sécurité renforcée (rate limiting, validation automatique)
- ✅ Isolation tenant garantie automatiquement
- ✅ Logs structurés avec corrélation complète
- ✅ Gestion d'erreurs centralisée
- ✅ Capture Sentry automatique

## 📝 Checklist de migration

### Avant de commencer

- [ ] Comprendre la structure de `safeHandler` (voir `src/lib/safe-handler.ts`)
- [ ] Consulter les exemples refactorisés :
  - `src/app/api/admin/clients-refactored/route.ts`
  - `src/app/api/admin/projets-refactored/route.ts`
  - `src/app/api/admin/example-secure-route/route.ts`

### Étapes de migration

#### 1. Analyser la route existante

```typescript
// ❌ AVANT - Route classique
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { tenantFilter } = await getTenantFilter(request);
    // ... logique métier
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

#### 2. Définir les schémas Zod

```typescript
// Schémas de validation
const createResourceSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
```

#### 3. Refactoriser avec safeHandler

```typescript
// ✅ APRÈS - Route sécurisée
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse } from "@/lib/secure-headers";
import { getTenantContext } from "@/lib/prisma-middleware";
import { validateQueryParams } from "@/lib/validation";

export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    // Logique métier (isolation tenant automatique)
    const resources = await prisma.resource.findMany({
      where: { tenantId },
    });

    return secureResponse(
      { success: true, data: resources },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["GET"],
  }
);

export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createResourceSchema>>(request);

    const resource = await prisma.resource.create({
      data: {
        ...data,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      { success: true, data: resource },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createResourceSchema,
  }
);
```

## 🔄 Mapping des changements

### Authentification

**Avant :**
```typescript
const authResult = await ensureAuthenticated(request);
if (authResult instanceof NextResponse) return authResult;
```

**Après :**
```typescript
// Géré automatiquement par safeHandler avec requireAuth: true
```

### Isolation tenant

**Avant :**
```typescript
const { tenantFilter, tenantId } = await getTenantFilter(request);
const where: any = { ...tenantFilter };
```

**Après :**
```typescript
const tenantId = getTenantContext(); // Déjà défini par le middleware
const where: any = { tenantId }; // Plus simple et explicite
```

### Validation

**Avant :**
```typescript
const validation = await validateRequest(request, schema);
if (!validation.success) {
  return validation.response;
}
const data = validation.data;
```

**Après :**
```typescript
// Défini dans options.schema
const data = getValidatedBody<T>(request); // Déjà validé
```

### Gestion d'erreurs

**Avant :**
```typescript
try {
  // ...
} catch (error) {
  console.error("Erreur:", error);
  return NextResponse.json({ error: "..." }, { status: 500 });
}
```

**Après :**
```typescript
// Géré automatiquement par safeHandler
// Capture Sentry automatique
// Logs structurés avec requestId
```

### Réponses

**Avant :**
```typescript
return NextResponse.json({ success: true, data });
```

**Après :**
```typescript
return secureResponse({ success: true, data }, { status: 200 });
```

## 🎯 Priorités de migration

### Niveau 1 - Routes critiques (priorité haute)

Ces routes manipulent des données sensibles et doivent être migrées en premier :

1. **Authentification** : `/api/auth/*`
2. **Clients** : `/api/admin/clients/*`
3. **Utilisateurs** : `/api/admin/users/*`
4. **Tenants** : `/api/super-admin/tenants/*`
5. **Paiements** : `/api/admin/payments/*`

### Niveau 2 - Routes importantes (priorité moyenne)

Ces routes sont fréquemment utilisées :

1. **Projets** : `/api/admin/projets/*`
2. **Réservations** : `/api/admin/reservations/*`
3. **Commandes** : `/api/admin/commandes/*`
4. **Contenu** : `/api/admin/content/*`
5. **Médias** : `/api/admin/content/media/*`

### Niveau 3 - Routes secondaires (priorité basse)

Ces routes peuvent être migrées progressivement :

1. **Statistiques** : `/api/admin/stats/*`
2. **SEO** : `/api/admin/seo/*`
3. **Design** : `/api/admin/design/*`
4. **Thèmes** : `/api/admin/themes/*`

## 🧪 Tests après migration

Après chaque migration, vérifier :

1. **Tests unitaires** : Les tests existants passent toujours
2. **Tests d'isolation** : Vérifier l'isolation tenant
3. **Tests manuels** : Tester les endpoints dans l'application
4. **Logs** : Vérifier que les logs sont bien structurés avec `requestId`

## 📊 Statut de migration

### Routes migrées ✅

- `src/app/api/admin/clients-refactored/route.ts` (exemple)
- `src/app/api/admin/projets-refactored/route.ts` (exemple)
- `src/app/api/admin/example-secure-route/route.ts` (exemple)

### Routes à migrer 🔄

Utiliser le script `scripts/migrate-to-safe-handler.ts` pour automatiser la migration :

```bash
npm run migrate:routes
```

## ⚠️ Points d'attention

### 1. Routes avec logique complexe

Pour les routes avec beaucoup de logique métier, migrer progressivement :

```typescript
// Conserver la logique existante, juste wrapper avec safeHandler
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    // Toute la logique existante ici
    // Utiliser context.requestId pour les logs
  },
  { requireAuth: true, methods: ["GET"] }
);
```

### 2. Routes avec authentification spéciale

Si une route nécessite une authentification spéciale (super-admin, etc.) :

```typescript
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    // Vérification supplémentaire si nécessaire
  },
  {
    requireAuth: true,
    requireSuperAdmin: true, // Pour super-admin uniquement
    methods: ["GET"],
  }
);
```

### 3. Routes avec validation complexe

Pour les validations complexes, créer des schémas Zod dédiés :

```typescript
const complexSchema = z.object({
  // ... validation complexe
}).refine(...); // Validations custom

export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const data = getValidatedBody<z.infer<typeof complexSchema>>(request);
    // ...
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: complexSchema,
  }
);
```

## 🔍 Vérification post-migration

Après chaque migration, vérifier :

1. ✅ Les tests passent
2. ✅ Les logs incluent `requestId`, `tenantId`, `userId`
3. ✅ Les erreurs sont capturées dans Sentry
4. ✅ Le rate limiting fonctionne
5. ✅ L'isolation tenant est garantie
6. ✅ Les réponses incluent les headers de sécurité

## 📚 Ressources

- [Documentation safeHandler](../../src/lib/safe-handler.ts)
- [Exemples de routes migrées](../../src/app/api/admin/clients-refactored/route.ts)
- [Guide validation Zod](../../src/lib/validation.ts)

