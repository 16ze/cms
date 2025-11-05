# 🧪 GUIDE DE TESTS - ISOLATION MULTI-TENANT

**Date:** 23 Octobre 2025  
**Status:** ✅ Prêt pour les tests

---

## 📊 DONNÉES DE TEST CRÉÉES

### **Tenant 1: Salon Élégance Paris** (Beauté)
```
Email: sophie@salon-elegance.fr
Password: test2025
Template: Beauté & Esthétique
Données: 1 soin (Soin Visage Éclat - 75€)
```

### **Tenant 2: TechStore Paris** (E-commerce)
```
Email: manager@techstore.fr
Password: test2025
Template: E-commerce
Données: 2 produits (MacBook Pro 16, iPhone 15 Pro)
```

### **Super Admin: KAIRO Digital**
```
Email: admin@kairodigital.com
Password: kairo2025!
Accès: GLOBAL (tous les tenants)
```

---

## 🧪 TESTS À EFFECTUER

### **TEST 1: Isolation GET (SELECT)**

#### **1.1 Login Tenant 1 (Salon)**
1. Aller sur `http://localhost:3000/login`
2. Login: `sophie@salon-elegance.fr` / `test2025`
3. Aller sur `/admin/soins`
4. **✅ Vérifier:** Voir uniquement "Soin Visage Éclat" (1 soin)
5. **❌ Ne PAS voir:** Les produits du TechStore

#### **1.2 Login Tenant 2 (TechStore)**
1. Se déconnecter
2. Login: `manager@techstore.fr` / `test2025`
3. Aller sur `/admin/produits`
4. **✅ Vérifier:** Voir uniquement MacBook + iPhone (2 produits)
5. **❌ Ne PAS voir:** Le soin du Salon

#### **1.3 Login Super Admin**
1. Se déconnecter
2. Aller sur `http://localhost:3000/super-admin/login`
3. Login: `admin@kairodigital.com` / `kairo2025!`
4. Aller sur `/admin/soins?tenantId=<id-salon>`
5. **✅ Vérifier:** Voir le soin du Salon
6. Aller sur `/admin/produits?tenantId=<id-techstore>`
7. **✅ Vérifier:** Voir les produits du TechStore

**Résultat attendu:** ✅ Isolation complète des données en lecture

---

### **TEST 2: Isolation CREATE**

#### **2.1 Créer un soin (Tenant 1)**
1. Login: `sophie@salon-elegance.fr` / `test2025`
2. Aller sur `/admin/soins`
3. Cliquer "Ajouter un soin"
4. Créer: "Massage Relaxant" - 90€
5. **✅ Vérifier:** Soin créé avec succès
6. **✅ Vérifier en DB:** Le soin a `tenantId` = ID du Salon

#### **2.2 Créer un produit (Tenant 2)**
1. Login: `manager@techstore.fr` / `test2025`
2. Aller sur `/admin/produits`
3. Cliquer "Ajouter un produit"
4. Créer: "AirPods Pro" - 279€
5. **✅ Vérifier:** Produit créé avec succès
6. **✅ Vérifier en DB:** Le produit a `tenantId` = ID du TechStore

#### **2.3 Vérifier isolation**
1. Login: `sophie@salon-elegance.fr` / `test2025`
2. Aller sur `/admin/soins`
3. **✅ Vérifier:** Voir ses 2 soins uniquement
4. **❌ Ne PAS voir:** Les produits du TechStore

**Résultat attendu:** ✅ Chaque tenant crée des données dans son propre espace

---

### **TEST 3: Isolation UPDATE**

#### **3.1 Modifier un soin (Tenant 1)**
1. Login: `sophie@salon-elegance.fr` / `test2025`
2. Aller sur `/admin/soins`
3. Modifier "Soin Visage Éclat" → Prix: 85€
4. **✅ Vérifier:** Modification réussie
5. **✅ Vérifier:** Prix mis à jour à 85€

#### **3.2 Tenter de modifier un soin d'un autre tenant (DOIT ÉCHOUER)**
1. Rester connecté en tant que `manager@techstore.fr`
2. Essayer d'accéder à `/api/admin/soins/<id-soin-salon>` (PUT)
3. **✅ Vérifier:** Erreur 403 "Accès refusé"
4. **✅ Vérifier:** Le soin n'est PAS modifié

**Résultat attendu:** ✅ Impossible de modifier les données d'un autre tenant

---

### **TEST 4: Isolation DELETE**

#### **4.1 Supprimer un produit (Tenant 2)**
1. Login: `manager@techstore.fr` / `test2025`
2. Aller sur `/admin/produits`
3. Supprimer "AirPods Pro"
4. **✅ Vérifier:** Suppression réussie
5. **✅ Vérifier:** Le produit n'apparaît plus

#### **4.2 Tenter de supprimer un produit d'un autre tenant (DOIT ÉCHOUER)**
1. Login: `sophie@salon-elegance.fr` / `test2025`
2. Essayer d'accéder à `/api/admin/produits/<id-produit-techstore>` (DELETE)
3. **✅ Vérifier:** Erreur 403 "Accès refusé"
4. **✅ Vérifier:** Le produit existe toujours

**Résultat attendu:** ✅ Impossible de supprimer les données d'un autre tenant

---

### **TEST 5: Super Admin - Accès Global**

#### **5.1 Voir tous les tenants**
1. Login: `admin@kairodigital.com` / `kairo2025!`
2. Aller sur `/admin/dashboard`
3. **✅ Vérifier:** Voir les 2 tenants dans une liste
4. **✅ Vérifier:** Statistiques globales

#### **5.2 Accéder aux données de n'importe quel tenant**
1. Aller sur `/admin/soins?tenantId=<id-salon>`
2. **✅ Vérifier:** Voir les soins du Salon
3. Aller sur `/admin/produits?tenantId=<id-techstore>`
4. **✅ Vérifier:** Voir les produits du TechStore

#### **5.3 Modifier/Supprimer pour n'importe quel tenant**
1. Modifier un soin du Salon
2. **✅ Vérifier:** Modification réussie
3. Modifier un produit du TechStore
4. **✅ Vérifier:** Modification réussie

**Résultat attendu:** ✅ Super Admin a accès total à tous les tenants

---

## 🔍 TESTS EN BASE DE DONNÉES

### **Vérifier les tenantId en DB**
```bash
# Ouvrir la DB
npx prisma studio

# Vérifier BeautyTreatment
# → Tous les soins doivent avoir un tenantId
# → Soin Salon = tenantId du Salon
# → Aucun soin sans tenantId

# Vérifier Product
# → Tous les produits doivent avoir un tenantId
# → Produits TechStore = tenantId du TechStore
# → Aucun produit sans tenantId
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] **TEST 1:** Isolation GET réussie
- [ ] **TEST 2:** Isolation CREATE réussie
- [ ] **TEST 3:** Isolation UPDATE réussie
- [ ] **TEST 4:** Isolation DELETE réussie
- [ ] **TEST 5:** Super Admin accès global OK
- [ ] **DB:** Tous les records ont un tenantId
- [ ] **Sécurité:** Aucune fuite de données entre tenants
- [ ] **Performance:** Requêtes rapides (<100ms)

---

## 🐛 EN CAS DE PROBLÈME

### **Erreur 401 (Non authentifié)**
- Vérifier que le cookie de session est bien défini
- Essayer de se déconnecter et se reconnecter
- Vérifier `/api/auth/me` retourne bien l'utilisateur

### **Erreur 403 (Accès refusé)**
- **C'EST NORMAL !** Cela signifie que l'isolation fonctionne
- Vérifier que vous tentez bien d'accéder à une ressource d'un autre tenant

### **Voir les données d'un autre tenant**
- **❌ PROBLÈME CRITIQUE !** L'isolation ne fonctionne pas
- Vérifier que `getTenantFilter()` est bien appelé dans l'API
- Vérifier que le `tenantId` est bien dans la requête Prisma

### **Erreur "Tenant non trouvé"**
- Pour les TenantUser: vérifier que le tenant existe
- Pour les SuperAdmin: vérifier que `?tenantId=xxx` est bien passé

---

## 📊 RÉSULTATS ATTENDUS

**Si tous les tests passent:**
✅ L'isolation multi-tenant est **COMPLÈTE et FONCTIONNELLE**  
✅ Le système est **PRÊT POUR LA PRODUCTION**  
✅ La sécurité est **MAXIMALE**  

**Si un test échoue:**
❌ Identifier le test qui échoue  
❌ Vérifier l'API concernée  
❌ Corriger le problème avant de déployer  

---

## 🎯 APRÈS LES TESTS

Une fois tous les tests validés:
1. Commit final
2. Documentation de production
3. Déploiement staging
4. Tests de charge
5. Déploiement production

---

**Status:** 🟢 **PRÊT POUR LES TESTS**

**Commencez par le TEST 1 et suivez le guide pas à pas !**

