# 🔐 GUIDE DE CONNEXION RAPIDE

**Mise à jour:** 23 Octobre 2025  
**Problème résolu:** Utilisation des bonnes URLs de login

---

## ⚠️ IMPORTANT: NOUVELLES URLS DE LOGIN

Depuis l'implémentation du multi-tenant, il y a **2 systèmes de login différents** :

### ❌ **NE PLUS UTILISER:**
```
http://localhost:3000/admin/login  ❌ OBSOLÈTE
```
Cette page utilise l'ancien système (`AdminUser` qui est vide).

### ✅ **UTILISER:**

#### **1. Super Admin (KAIRO Digital)**
```
🔗 URL: http://localhost:3000/super-admin/login
📧 Email: admin@kairodigital.com
🔑 Password: kairo2025!
```

#### **2. Tenant Users (Clients)**
```
🔗 URL: http://localhost:3000/login
📧 Email: sophie@salon-elegance.fr (ou manager@techstore.fr)
🔑 Password: test2025
```

---

## 🎯 COMPTES DISPONIBLES

### **Super Admin (Développeur KAIRO)**
- **URL:** http://localhost:3000/super-admin/login
- **Email:** admin@kairodigital.com
- **Password:** kairo2025!
- **Accès:** GLOBAL (tous les tenants)
- **Table DB:** `SuperAdmin`

### **Tenant 1: Salon Élégance**
- **URL:** http://localhost:3000/login
- **Email:** sophie@salon-elegance.fr
- **Password:** test2025
- **Accès:** Salon Élégance uniquement
- **Template:** Beauté & Esthétique
- **Table DB:** `TenantUser`

### **Tenant 2: TechStore**
- **URL:** http://localhost:3000/login
- **Email:** manager@techstore.fr
- **Password:** test2025
- **Accès:** TechStore uniquement
- **Template:** E-commerce
- **Table DB:** `TenantUser`

---

## 🚀 ÉTAPES DE CONNEXION

### **Pour le Super Admin:**
1. Ouvrir: http://localhost:3000/super-admin/login
2. Email: admin@kairodigital.com
3. Password: kairo2025!
4. Cliquer "Se connecter"
5. ✅ Redirection vers `/admin/dashboard`

### **Pour un Tenant:**
1. Ouvrir: http://localhost:3000/login
2. Email: sophie@salon-elegance.fr (ou manager@techstore.fr)
3. Password: test2025
4. Cliquer "Se connecter"
5. ✅ Redirection vers `/admin/dashboard`

---

## 🔍 VÉRIFICATION DES DONNÉES

Si la connexion échoue, vérifiez que les données existent :

```bash
# Vérifier SuperAdmin
sqlite3 prisma/prisma/dev.db "SELECT email FROM SuperAdmin;"
# Résultat attendu: admin@kairodigital.com

# Vérifier TenantUser
sqlite3 prisma/prisma/dev.db "SELECT email FROM TenantUser;"
# Résultat attendu: sophie@salon-elegance.fr et manager@techstore.fr

# Vérifier Tenant
sqlite3 prisma/prisma/dev.db "SELECT name, slug FROM Tenant;"
# Résultat attendu: Salon Élégance Paris et TechStore Paris
```

---

## 🛠️ SI LES DONNÉES SONT MANQUANTES

Relancez les seeds :

```bash
# 1. Templates
npx ts-node prisma/seeds/seed-templates-only.ts

# 2. Premier tenant + SuperAdmin
npx ts-node prisma/seeds/seed-multi-tenant-minimal.ts

# 3. Deuxième tenant
npx ts-node prisma/seeds/create-second-tenant.ts
```

---

## 📊 DIFFÉRENCES ENTRE LES SYSTÈMES

| Caractéristique | Ancien système | Nouveau système |
|-----------------|----------------|-----------------|
| **URL Login** | `/admin/login` | `/super-admin/login` ou `/login` |
| **API** | `/api/auth/login` | `/api/auth/login/super-admin` ou `/api/auth/login/tenant` |
| **Table DB** | `AdminUser` | `SuperAdmin` + `TenantUser` |
| **Multi-tenant** | ❌ Non | ✅ Oui |
| **Isolation** | ❌ Non | ✅ Complète |

---

## 🎉 APRÈS LA CONNEXION

### **Super Admin peut:**
- Accéder à `/admin/dashboard`
- Voir tous les tenants
- Accéder aux données avec `?tenantId=xxx`
- Modifier n'importe quelles données

### **Tenant User peut:**
- Accéder à `/admin/dashboard`
- Voir uniquement ses données
- Modifier uniquement ses données
- ❌ Ne peut PAS voir les autres tenants

---

## 📝 BOOKMARKS RECOMMANDÉS

Ajoutez ces favoris à votre navigateur :

```
🔐 Super Admin Login
http://localhost:3000/super-admin/login

🔐 Tenant Login
http://localhost:3000/login

📊 Dashboard
http://localhost:3000/admin/dashboard

💆 Soins (Salon)
http://localhost:3000/admin/soins?tenantSlug=salon-elegance-paris

🛒 Produits (TechStore)
http://localhost:3000/admin/produits?tenantSlug=techstore-paris
```

---

## ❓ PROBLÈMES COURANTS

### **"Identifiants invalides"**
- ✅ Vérifiez que vous utilisez la bonne URL
- ✅ Vérifiez l'email (pas d'espaces)
- ✅ Vérifiez le mot de passe (respecte la casse)
- ✅ Vérifiez que les données existent en DB

### **"Page non trouvée"**
- ✅ Vérifiez l'URL (pas de faute de frappe)
- ✅ Vérifiez que le serveur Next.js tourne (`npm run dev`)
- ✅ Rafraîchissez la page (Ctrl+R ou Cmd+R)

### **Redirection vers ancienne page**
- ✅ Videz le cache du navigateur
- ✅ Ouvrez en navigation privée
- ✅ Utilisez les nouvelles URLs directement

---

**✅ TOUT EST PRÊT ! Utilisez les nouvelles URLs de login.**

