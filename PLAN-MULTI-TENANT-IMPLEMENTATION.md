# 🏗️ PLAN D'IMPLÉMENTATION MULTI-TENANT

**Date:** 23 Octobre 2025  
**Objectif:** Transformer l'application en système SaaS multi-tenant avec isolation complète des données

---

## 📋 RÉSUMÉ EXÉCUTIF

### **Architecture Cible**

- ✅ **1 SuperAdmin** (admin@kairodigital.com) → Accès à tous les tenants
- ✅ **N Tenants** (clients) → Chacun avec son propre template et données
- ✅ **Isolation stricte** → Aucune fuite de données entre tenants
- ✅ **1 seule base de données** SQLite avec filtrage par `tenantId`

### **Modifications Requises**

- 📝 **Schema Prisma** : +3 modèles, ~30 modèles modifiés
- 🔒 **Authentification** : Système dual (SuperAdmin vs TenantUser)
- 🛡️ **Middleware** : Isolation automatique par tenant
- 🔌 **APIs** : Filtrage systématique par `tenantId`
- 🌱 **Seeds** : 1 SuperAdmin + 1 Tenant de test minimal

---

## 🗄️ NOUVEAUX MODÈLES PRISMA

### **1. Tenant (Client)**

```prisma
model Tenant {
  id            String   @id @default(uuid())
  name          String   // "Salon Beauté Paris"
  slug          String   @unique  // "salon-beaute-paris"
  email         String   @unique  // Email principal du tenant
  templateId    String   // Template actif (BEAUTY, ECOMMERCE, etc.)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  template      Template @relation(fields: [templateId], references: [id])
  users         TenantUser[]

  // Relations vers toutes les données
  beautyTreatments       BeautyTreatment[]
  beautyAppointments     BeautyAppointment[]
  products              Product[]
  orders                Order[]
  // ... etc
}
```

### **2. TenantUser (Utilisateur du client)**

```prisma
model TenantUser {
  id          String   @id @default(uuid())
  tenantId    String
  email       String
  password    String   // Hash bcrypt
  firstName   String
  lastName    String
  role        TenantUserRole @default(ADMIN)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
}

enum TenantUserRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}
```

### **3. SuperAdmin (Développeur KAIRO)**

```prisma
model SuperAdmin {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String   // Hash bcrypt
  firstName   String
  lastName    String
  createdAt   DateTime @default(now())
}
```

---

## 🔑 MODÈLES À MODIFIER (AJOUTER `tenantId`)

### **Template Beauté & Esthétique**

- ✅ `BeautyTreatment` → + tenantId
- ✅ `BeautyAppointment` → + tenantId

### **Template Bien-être & Fitness**

- ✅ `WellnessCourse` → + tenantId
- ✅ `WellnessCoach` → + tenantId
- ✅ `WellnessBooking` → + tenantId

### **Template E-commerce**

- ✅ `Product` → + tenantId
- ✅ `Order` → + tenantId
- ✅ `OrderItem` → + tenantId

### **Template Blog**

- ✅ `Article` → + tenantId
- ✅ `ArticleCategory` → + tenantId
- ✅ `Author` → + tenantId

### **Template Restaurant**

- ✅ `MenuItem` → + tenantId
- ✅ `RestaurantReservation` → + tenantId
- ✅ `RestaurantTable` → + tenantId

### **Template Corporate**

- ✅ `Project` → + tenantId
- ✅ `TeamMember` → + tenantId

### **Template Consultation**

- ✅ `Patient` → + tenantId
- ✅ `Therapist` → + tenantId
- ✅ `ConsultationAppointment` → + tenantId

### **Template Services**

- ✅ `ServiceClient` → + tenantId
- ✅ `ServiceProject` → + tenantId
- ✅ `Quote` → + tenantId
- ✅ `Invoice` → + tenantId

### **Template Portfolio**

- ✅ `GalleryItem` → + tenantId

---

## 🛡️ MODÈLES À GARDER PARTAGÉS (SANS `tenantId`)

- ❌ `AdminUser` → Conservé pour compatibilité (déprécié)
- ❌ `Template` → Configuration globale des templates
- ❌ `TemplatePage` → Configuration globale
- ❌ `TemplateSidebarConfig` → Configuration globale
- ❌ `SiteTemplate` → Lié au tenant
- ❌ `TemplateCustomization` → Lié au tenant
- ❌ `Notification` → Lié au user (AdminUser ou TenantUser)
- ❌ `SiteSettings` → À décider (global ou par tenant)
- ❌ `DesignGlobalSettings` → À décider (global ou par tenant)

---

## 🔐 SYSTÈME D'AUTHENTIFICATION

### **Route SuperAdmin**

- URL: `/super-admin/login`
- Email: `admin@kairodigital.com`
- Accès: Tous les tenants + gestion globale

### **Route TenantUser**

- URL: `/login` ou `/tenant/[slug]/login`
- Email: `client@example.com`
- Accès: Uniquement son tenant

### **Session Structure**

```typescript
// SuperAdmin
{
  type: "SUPER_ADMIN",
  userId: "xxx",
  email: "admin@kairodigital.com",
  tenantId: null, // Peut switch entre tenants
}

// TenantUser
{
  type: "TENANT_USER",
  userId: "yyy",
  email: "client@example.com",
  tenantId: "tenant-abc-123", // FORCÉ
  role: "ADMIN",
}
```

---

## 🌱 SEED MINIMAL (POUR TESTS UNIQUEMENT)

### **1. SuperAdmin**

```typescript
{
  email: "admin@kairodigital.com",
  password: "Admin123!@#", // À changer en production
  firstName: "KAIRO",
  lastName: "Digital"
}
```

### **2. Tenant de Test**

```typescript
{
  name: "Test Salon Beauté",
  slug: "test-salon",
  email: "test@salon-beaute.fr",
  templateId: "beauty-template-id" // Template BEAUTY
}
```

### **3. TenantUser de Test**

```typescript
{
  tenantId: "test-salon-id",
  email: "test@salon-beaute.fr",
  password: "Test123!@#", // À changer en production
  firstName: "Test",
  lastName: "User",
  role: "OWNER"
}
```

### **4. Données de Test (1 seul soin)**

```typescript
{
  tenantId: "test-salon-id",
  name: "Soin Test",
  description: "Pour vérifier l'enregistrement",
  category: "Visage",
  duration: 60,
  price: 50.00
}
```

---

## 🔄 PROCESSUS DE MIGRATION

### **Étape 1 : Modification du Schema**

1. Ajouter les 3 nouveaux modèles
2. Ajouter `tenantId` à tous les modèles concernés
3. Ajouter les relations et index

### **Étape 2 : Migration Prisma**

```bash
npx prisma db push
npx prisma generate
```

### **Étape 3 : Seed Minimal**

```bash
npx ts-node prisma/seeds/seed-multi-tenant-minimal.ts
```

### **Étape 4 : Test d'Isolation**

1. Login SuperAdmin
2. Login TenantUser
3. Créer un soin dans le tenant
4. Vérifier que SuperAdmin le voit
5. Créer un 2ème tenant
6. Vérifier l'isolation (tenant1 ne voit pas données tenant2)

---

## ⚠️ POINTS D'ATTENTION

### **Breaking Changes**

- ❌ Toutes les données actuelles devront être migrées ou supprimées
- ❌ Les APIs existantes devront être mises à jour
- ❌ Le système de login actuel (`AdminUser`) sera déprécié

### **Compatibilité**

- ✅ Garder `AdminUser` temporairement pour transition
- ✅ Créer un script de migration des données existantes
- ✅ Double authentification (ancien + nouveau) pendant transition

### **Sécurité**

- 🔒 Middleware obligatoire sur TOUTES les routes API
- 🔒 Validation stricte du `tenantId` à chaque requête
- 🔒 Impossible de modifier le `tenantId` d'une ressource existante
- 🔒 SuperAdmin peut lire mais doit expliciter le tenant pour écrire

---

## 📈 TESTS REQUIS

### **Test 1 : Isolation de Base**

- Créer 2 tenants
- Ajouter des soins dans chaque tenant
- Vérifier qu'ils ne se voient pas

### **Test 2 : SuperAdmin**

- Login SuperAdmin
- Vérifier accès à tous les tenants
- Créer une donnée dans un tenant spécifique

### **Test 3 : TenantUser**

- Login TenantUser tenant1
- Essayer d'accéder aux données du tenant2
- Doit échouer avec 403 Forbidden

### **Test 4 : Sécurité API**

- Tenter de modifier le `tenantId` dans une requête
- Doit être ignoré ou échouer

---

## 🚀 ORDRE D'IMPLÉMENTATION

1. ✅ **Backup DB** (FAIT)
2. 🔄 **Modifier Schema Prisma** (EN COURS)
3. ⏳ **Migration DB**
4. ⏳ **Seed Minimal**
5. ⏳ **Middleware d'Isolation**
6. ⏳ **Mise à Jour APIs**
7. ⏳ **Système d'Auth Multi-Tenant**
8. ⏳ **Tests d'Isolation**
9. ⏳ **Documentation Finale**

---

**Estimation:** 2-3 heures de travail méthodique  
**Impact:** MAJEUR - Refonte complète de l'architecture  
**Risque:** ÉLEVÉ - Nécessite tests exhaustifs

**Status:** 🟢 PRÊT À DÉMARRER
