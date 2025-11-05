# 📝 MODIFICATIONS DU SCHEMA PRISMA POUR MULTI-TENANT

## 🆕 NOUVEAUX MODÈLES

### 1. SuperAdmin

```prisma
// ===== SUPER ADMIN (KAIRO DIGITAL) =====
model SuperAdmin {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String   // Hash bcrypt
  firstName   String
  lastName    String
  isActive    Boolean  @default(true)
  lastLogin   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([isActive])
}
```

### 2. Tenant

```prisma
// ===== TENANT (CLIENT) =====
model Tenant {
  id            String   @id @default(uuid())
  name          String   // "Salon Beauté Paris"
  slug          String   @unique  // "salon-beaute-paris"
  email         String   @unique  // Email principal
  templateId    String   // Template actif
  domain        String?  // Domaine custom (optionnel)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  template                Template @relation(fields: [templateId], references: [id])
  users                   TenantUser[]
  siteTemplate            SiteTemplate?

  // Relations vers les données
  beautyTreatments        BeautyTreatment[]
  beautyAppointments      BeautyAppointment[]
  wellnessCourses         WellnessCourse[]
  wellnessCoaches         WellnessCoach[]
  wellnessBookings        WellnessBooking[]
  beautyTreatments        BeautyTreatment[]
  beautyAppointments      BeautyAppointment[]
  products                Product[]
  orders                  Order[]
  articles                Article[]
  articleCategories       ArticleCategory[]
  authors                 Author[]
  menuItems               MenuItem[]
  restaurantReservations  RestaurantReservation[]
  restaurantTables        RestaurantTable[]
  projects                Project[]
  teamMembers             TeamMember[]
  patients                Patient[]
  therapists              Therapist[]
  consultationAppointments ConsultationAppointment[]
  serviceClients          ServiceClient[]
  serviceProjects         ServiceProject[]
  quotes                  Quote[]
  invoices                Invoice[]
  galleryItems            GalleryItem[]

  @@index([slug])
  @@index([templateId])
  @@index([email])
  @@index([isActive])
}
```

### 3. TenantUser

```prisma
// ===== TENANT USER (UTILISATEUR CLIENT) =====
model TenantUser {
  id          String   @id @default(uuid())
  tenantId    String
  email       String
  password    String   // Hash bcrypt
  firstName   String
  lastName    String
  role        TenantUserRole @default(ADMIN)
  isActive    Boolean  @default(true)
  lastLogin   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([email])
  @@index([isActive])
}

enum TenantUserRole {
  OWNER       // Propriétaire du compte
  ADMIN       // Administrateur
  EDITOR      // Éditeur
  VIEWER      // Consultation seule
}
```

## 🔧 MODÈLES À MODIFIER (AJOUTER `tenantId`)

### Pattern de modification:

```prisma
model ExampleModel {
  id          String   @id @default(uuid())
  tenantId    String   // 🆕 AJOUT
  // ... autres champs

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade) // 🆕

  @@index([tenantId]) // 🆕
}
```

### Liste des modèles à modifier:

1. BeautyTreatment
2. BeautyAppointment
3. WellnessCourse
4. WellnessCoach
5. WellnessBooking
6. Product
7. Order
8. OrderItem (via Order)
9. Article
10. ArticleCategory
11. Author
12. MenuItem
13. RestaurantReservation
14. RestaurantTable
15. Project
16. TeamMember
17. Patient
18. Therapist
19. ConsultationAppointment
20. ServiceClient
21. ServiceProject
22. Quote
23. Invoice
24. GalleryItem

## 🔄 MODÈLES MODIFIÉS (RELATION TENANT)

### SiteTemplate

```prisma
model SiteTemplate {
  id          String   @id @default(uuid())
  tenantId    String   @unique  // 🆕 Un tenant = un template actif
  templateId  String
  isActive    Boolean  @default(true)
  activatedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade) // 🆕
  template    Template @relation(fields: [templateId], references: [id])

  @@index([tenantId]) // 🆕
  @@index([templateId])
}
```

### TemplateCustomization

```prisma
model TemplateCustomization {
  id          String   @id @default(uuid())
  tenantId    String   // 🆕 Remplace siteId
  templateId  String
  colors      Json?
  typography  Json?
  logo        String?
  favicon     String?
  content     Json?
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade) // 🆕
  template    Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@unique([tenantId, templateId]) // 🆕 Modifié de [templateId, siteId]
  @@index([tenantId]) // 🆕
  @@index([templateId])
}
```

## ❌ MODÈLES À CONSERVER (PAS DE TENANT_ID)

- AdminUser (ancien système, à déprécier progressivement)
- Template
- TemplatePage
- TemplateSidebarConfig
- Notification (lié à AdminUser ou TenantUser via polymorphisme)
- GoogleOAuthToken
- User (ancien système réservations)
- Availability
- Exclusion
- Reservation (ancien système)
- Client (ancien système)
- SiteSettings (global ou à dupliquer par tenant ?)
- DesignGlobalSettings (global ou à dupliquer par tenant ?)
- SiteTheme (global)

## ⚠️ DÉCISIONS À PRENDRE

### SiteSettings - Option A: Global

```prisma
// Pas de modification, settings partagés entre tous
```

### SiteSettings - Option B: Par Tenant (RECOMMANDÉ)

```prisma
model TenantSettings {
  id          String   @id @default(uuid())
  tenantId    String
  key         String
  value       String
  category    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, key])
  @@index([tenantId])
}
```

### DesignGlobalSettings - À dupliquer par tenant

```prisma
model TenantDesignSettings {
  id          String   @id @default(uuid())
  tenantId    String
  category    String
  property    String
  value       String
  deviceType  String   @default("desktop")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, category, property, deviceType])
  @@index([tenantId])
}
```

## 📊 STATISTIQUES

- **Modèles ajoutés:** 3 (SuperAdmin, Tenant, TenantUser)
- **Modèles modifiés:** ~30 (ajout tenantId)
- **Relations ajoutées:** ~30
- **Index ajoutés:** ~30
- **Enums ajoutés:** 1 (TenantUserRole)

## 🎯 PROCHAINE ÉTAPE

Modifier le fichier `prisma/schema.prisma` avec tous ces changements.
