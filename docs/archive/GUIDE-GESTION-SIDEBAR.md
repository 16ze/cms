# 📋 GUIDE COMPLET : GESTION DE LA SIDEBAR PAR TENANT

**Date** : 23 Octobre 2025  
**Pour** : Super Admin (admin@kairodigital.com)

---

## 🎯 OBJECTIF

Permettre au super-admin de **personnaliser la sidebar** de chaque client (tenant) selon leurs besoins spécifiques, en ajoutant ou retirant des éléments.

---

## 📊 DIFFÉRENCE : RÉSERVATIONS vs RENDEZ-VOUS

### **1. RÉSERVATIONS (Reservations)** 🌍
- **Type** : Élément **STANDARD** présent dans **TOUTES** les templates
- **Position** : En haut de la sidebar (après Dashboard)
- **Utilisation** : Système de réservation générique
- **Modèle DB** : `RestaurantReservation`
- **Page** : `/admin/reservations`
- **Cas d'usage** :
  - Consultation découverte
  - Rendez-vous téléphonique
  - Présentation projet
  - Suivi client
- **Exemple** : 
  ```
  Client : TechStore Paris
  → Un prospect réserve une consultation gratuite
  → Le gérant voit la réservation dans "Réservations"
  ```

### **2. RENDEZ-VOUS BEAUTÉ (Beauty Appointments)** 💅
- **Type** : Élément **SPÉCIFIQUE** au template "Beauté & Esthétique"
- **Position** : Dans la section template (après éléments standards)
- **Utilisation** : Gestion des rendez-vous pour soins beauté
- **Modèle DB** : `BeautyAppointment` (lié à `BeautyTreatment`)
- **Page** : `/admin/rendez-vous-beaute`
- **Cas d'usage** :
  - Réservation manucure
  - Réservation épilation
  - Réservation soin visage
  - Réservation massage
- **Exemple** :
  ```
  Cliente : Rose (Beauté & Esthétique)
  → Une cliente réserve une manucure gel pour mardi 14h
  → Rose voit le RDV dans "Rendez-vous" (sidebar template)
  ```

### **🔍 POURQUOI DEUX SYSTÈMES ?**

| Aspect | Réservations | Rendez-vous Beauté |
|--------|-------------|-------------------|
| **Générique** | ✅ Oui | ❌ Non (Beauté uniquement) |
| **Lié à un soin** | ❌ Non | ✅ Oui (`BeautyTreatment`) |
| **Durée prédéfinie** | ❌ Non | ✅ Oui (selon le soin) |
| **Prix affiché** | ❌ Non | ✅ Oui (prix du soin) |
| **Choix du soin** | ❌ Non | ✅ Oui (dropdown) |
| **Toujours visible** | ✅ Oui | ❌ Non (template) |

---

## 🛠️ COMMENT GÉRER LA SIDEBAR ?

### **Étape 1 : Accéder à la gestion**
1. Connectez-vous en tant que **Super Admin**
2. Allez sur `/super-admin/dashboard`
3. Trouvez le tenant (ex: Rose)
4. Cliquez sur l'**icône Layout** 📐 (bouton du milieu)

### **Étape 2 : Ajouter un élément**
1. Cliquez sur **"Ajouter un élément"** (bouton vert)
2. Une modale s'ouvre avec la liste des éléments disponibles
3. Sélectionnez l'élément voulu (ex: **Équipe**)
4. Cliquez sur **"Ajouter"**
5. ✅ L'élément apparaît dans la sidebar du client

### **Étape 3 : Retirer un élément**
1. Survolez un élément **ajouté manuellement** (sans badge "Template par défaut")
2. Un **bouton poubelle** 🗑️ rouge apparaît à droite
3. Cliquez sur le bouton poubelle
4. Confirmez la suppression
5. ✅ L'élément disparaît de la sidebar du client

---

## 🚫 RESTRICTIONS DE SUPPRESSION

### **❌ VOUS NE POUVEZ PAS RETIRER :**

1. **Dashboard** - Toujours visible
2. **Réservations** - Toujours visible
3. **Clients** - Toujours visible
4. **Contenu** - Toujours visible
5. **Site** - Toujours visible
6. **SEO** - Toujours visible
7. **Paramètres** - Toujours visible
8. **Éléments du template de base** - Badge bleu "Template par défaut"

**Pourquoi ?** Ces éléments sont **essentiels** au fonctionnement de l'admin.

### **✅ VOUS POUVEZ RETIRER :**

- Tous les éléments **ajoutés manuellement** par le super-admin
- Identifiables par l'**absence de badge bleu**
- Le bouton poubelle 🗑️ apparaît au survol

**Exemple :**
```
Template de base Rose (Beauté) :
├─ Dashboard           [Badge bleu] ❌ Non supprimable
├─ Réservations        [Badge bleu] ❌ Non supprimable
├─ Clients             [Badge bleu] ❌ Non supprimable
├─ Soins               [Badge bleu] ❌ Non supprimable
├─ Rendez-vous         [Badge bleu] ❌ Non supprimable
├─ Équipe              [Pas de badge] ✅ Supprimable ← Ajouté par super-admin
└─ Projets             [Pas de badge] ✅ Supprimable ← Ajouté par super-admin
```

---

## 📋 ÉLÉMENTS DISPONIBLES À AJOUTER (17 TOTAL)

### **Corporate (Entreprise)**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `projets` | Projets | 💼 Briefcase | Portfolio de projets clients |
| `equipe` | Équipe | 👥 Users | Présentation de l'équipe |

### **E-commerce (Boutique en ligne)**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `produits` | Produits | 📦 Package | Catalogue de produits |
| `commandes` | Commandes | 🛒 ShoppingCart | Gestion des commandes |

### **Blog (Articles)**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `articles` | Articles | 📄 FileText | Rédaction d'articles |
| `categories` | Catégories | 🏷️ Tag | Organisation par catégories |
| `auteurs` | Auteurs | ✅ UserCheck | Gestion des auteurs |

### **Restaurant**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `menu` | Menu | 🍴 Utensils | Carte du restaurant |
| `tables` | Tables | 📊 Grid | Gestion des tables |

### **Bien-être & Fitness**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `cours` | Cours | 💪 Dumbbell | Cours de yoga, pilates, etc. |
| `coaches` | Coaches | ✅ UserCheck | Profils des coachs |

### **Beauté & Esthétique**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `soins` | Soins | ✨ Sparkles | Catalogue de soins (manucure, etc.) |
| `rendez-vous-beaute` | Rendez-vous | 📅 Calendar | RDV liés aux soins |

### **Consultation & Thérapie**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `patients` | Patients | 👥 Users | Dossiers patients |
| `therapeutes` | Thérapeutes | ✅ UserCheck | Profils thérapeutes |

### **Prestations Professionnelles**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `devis` | Devis | 📄 FileText | Génération de devis |
| `facturation` | Facturation | 💳 CreditCard | Gestion des factures |

### **Portfolio (Galerie)**
| ID | Label | Icon | Cas d'usage |
|----|-------|------|-------------|
| `galerie` | Galerie | 🖼️ Image | Galerie photos/vidéos |

---

## 💡 EXEMPLES D'UTILISATION

### **Exemple 1 : Rose (Beauté) demande une section Équipe**

**Situation :**
Rose a un salon de beauté avec 3 esthéticiennes. Elle veut présenter son équipe sur son site.

**Solution :**
1. Super Admin va sur dashboard
2. Clique sur Layout pour Rose
3. Ajoute l'élément **"Équipe"**
4. ✅ Rose voit maintenant "Équipe" dans sa sidebar
5. Rose peut ajouter ses 3 esthéticiennes avec photos, bio, spécialités

**Résultat :**
```
Sidebar de Rose AVANT :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Soins
├─ Rendez-vous
└─ Paramètres

Sidebar de Rose APRÈS :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Soins
├─ Rendez-vous
├─ Équipe         ← ✅ AJOUTÉ
└─ Paramètres
```

---

### **Exemple 2 : TechStore (E-commerce) veut un blog**

**Situation :**
TechStore vend des produits électroniques. Ils veulent créer des articles de blog pour le SEO.

**Solution :**
1. Super Admin va sur dashboard
2. Clique sur Layout pour TechStore
3. Ajoute **"Articles"**, **"Catégories"**, et **"Auteurs"**
4. ✅ TechStore peut maintenant gérer un blog complet

**Résultat :**
```
Sidebar TechStore AVANT :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Produits
├─ Commandes
└─ Paramètres

Sidebar TechStore APRÈS :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Produits
├─ Commandes
├─ Articles       ← ✅ AJOUTÉ
├─ Catégories     ← ✅ AJOUTÉ
├─ Auteurs        ← ✅ AJOUTÉ
└─ Paramètres
```

---

### **Exemple 3 : Retirer un élément non utilisé**

**Situation :**
Le super-admin avait ajouté "Projets" à Rose, mais elle ne l'utilise pas.

**Solution :**
1. Super Admin va sur page de gestion sidebar de Rose
2. Survole l'élément "Projets"
3. Le bouton poubelle 🗑️ rouge apparaît
4. Clique sur le bouton poubelle
5. Confirme la suppression
6. ✅ "Projets" disparaît de la sidebar de Rose

**Résultat :**
```
Sidebar de Rose AVANT :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Soins
├─ Rendez-vous
├─ Projets        ← À supprimer
└─ Paramètres

Sidebar de Rose APRÈS :
├─ Dashboard
├─ Réservations
├─ Clients
├─ Soins
├─ Rendez-vous
└─ Paramètres     ✅ Projets supprimé
```

---

## 🔒 SÉCURITÉ & ISOLATION

### **Chaque tenant garde sa propre configuration**
- Ajouter "Équipe" à Rose **n'affecte PAS** TechStore
- Retirer "Projets" de Rose **n'affecte PAS** Salon Élégance
- Chaque tenant a sa propre liste d'éléments dans `TemplateSidebarConfig`

### **Cascade Delete**
Si un tenant est supprimé :
- ✅ Tous ses éléments sidebar personnalisés sont supprimés automatiquement
- ✅ Pas de données orphelines

---

## 📊 ARCHITECTURE TECHNIQUE

### **Modèle Prisma**
```prisma
model TemplateSidebarConfig {
  id          String   @id @default(uuid())
  templateId  String
  elementId   String   // "projets", "equipe", etc.
  label       String   // "Projets", "Équipe", etc.
  icon        String   // "Briefcase", "Users", etc.
  href        String   // "/admin/projets", etc.
  orderIndex  Int
  category    String?  // "CORPORATE", "ECOMMERCE", etc.
  
  template    Template @relation(...)
  
  @@unique([templateId, elementId])
}
```

### **API Endpoints**
```
GET    /api/super-admin/tenants/[tenantId]/sidebar
       → Récupérer éléments actuels + disponibles

POST   /api/super-admin/tenants/[tenantId]/sidebar
       Body: { elementId: "equipe" }
       → Ajouter un élément

DELETE /api/super-admin/tenants/[tenantId]/sidebar?elementId=equipe
       → Retirer un élément
```

### **Chargement côté client (AdminSidebar)**
```typescript
// Dans AdminSidebar.tsx
useEffect(() => {
  if (currentTemplate?.id) {
    fetch(`/api/admin/sidebar/${currentTemplate.id}`)
      .then(res => res.json())
      .then(data => {
        setTemplateSidebarElements(data.data);
      });
  }
}, [currentTemplate]);
```

---

## 🎨 UI/UX

### **Dashboard Super Admin**
- **Bouton Layout** 📐 pour accéder à la gestion sidebar
- Animation au survol (scale de l'icône)
- Position : Entre "Gérer cet espace admin" et "Paramètres"

### **Page de gestion sidebar**
- **Design** : Cohérent avec le dashboard super-admin
- **Header** : Nom du tenant + template
- **Éléments actuels** : Cartes avec icône, label, href, badge template
- **Bouton poubelle** : Visible au survol (uniquement pour éléments ajoutés)
- **Modal d'ajout** : Sélection visuelle avec highlight vert
- **Confirmation** : Avant suppression

---

## ✅ RÉSUMÉ

### **CE QUE VOUS POUVEZ FAIRE :**
- ✅ **Ajouter** n'importe quel élément de la liste (17 disponibles)
- ✅ **Retirer** les éléments ajoutés manuellement
- ✅ **Personnaliser** chaque tenant indépendamment

### **CE QUE VOUS NE POUVEZ PAS FAIRE :**
- ❌ Retirer les éléments standards (Dashboard, Réservations, Clients, etc.)
- ❌ Retirer les éléments du template de base (badge bleu)
- ❌ Modifier l'ordre des éléments (orderIndex automatique)

### **DIFFÉRENCE CLÉ :**
- **Réservations** = Système générique, toujours visible
- **Rendez-vous Beauté** = Système spécifique Beauté, lié aux soins

**🚀 Votre sidebar devient modulaire et personnalisable par client !**

