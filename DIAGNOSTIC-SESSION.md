# 🔍 DIAGNOSTIC SESSION - PROBLÈME DE CONNEXION

**Date:** 23 Octobre 2025  
**Problème:** Connexion avec Sophie mais toujours connecté en Super Admin

---

## 🎯 ANALYSE DU PROBLÈME

### **Symptômes observés:**
```
✅ Page affiche: "Connecté en tant que Super Administrateur"
✅ Email affiché: admin@kairodigital.com
❌ Tentative de connexion avec: sophie@salon-elegance.fr
❌ Résultat: Reste sur Super Admin
```

### **Causes possibles:**

#### **1. Cookie de session non supprimé**
- Le cookie `auth_session` du Super Admin est toujours présent
- Le navigateur l'envoie automatiquement à chaque requête
- Solution: Supprimer manuellement le cookie

#### **2. Cache du navigateur**
- Le navigateur a mis en cache la page du dashboard Super Admin
- Il ne recharge pas la nouvelle session
- Solution: Vider le cache ou utiliser navigation privée

#### **3. Multiple onglets ouverts**
- Plusieurs onglets localhost:3000 ouverts
- Confusion entre les sessions
- Solution: Fermer tous les onglets

#### **4. Bouton "Déconnexion" non cliqué**
- Simple navigation vers /login sans déconnexion
- Le cookie reste actif
- Solution: Toujours cliquer "Déconnexion" avant

---

## ✅ SOLUTION ÉTAPE PAR ÉTAPE

### **MÉTHODE 1: Suppression manuelle des cookies (RECOMMANDÉ)**

#### **Sur Chrome/Edge:**
```
1. Appuyer sur F12 (Outils de développement)
2. Aller dans l'onglet "Application"
3. Dans le menu de gauche:
   - Storage → Cookies → http://localhost:3000
4. Clic droit sur "auth_session" → Delete
5. OU cliquer sur "Clear all" pour tout supprimer
6. Fermer la console (F12)
7. Rafraîchir la page (Ctrl+R ou Cmd+R)
```

#### **Sur Firefox:**
```
1. Appuyer sur F12 (Outils de développement)
2. Aller dans l'onglet "Stockage"
3. Dans le menu de gauche:
   - Cookies → http://localhost:3000
4. Clic droit sur "auth_session" → Supprimer
5. OU cliquer sur "Tout supprimer"
6. Fermer la console
7. Rafraîchir la page
```

#### **Sur Safari:**
```
1. Safari → Préférences → Avancées
2. Cocher "Afficher le menu Développement"
3. Développement → Afficher l'inspecteur web
4. Onglet "Stockage" → Cookies
5. Supprimer "auth_session"
6. Rafraîchir
```

---

### **MÉTHODE 2: Navigation privée (PLUS SIMPLE)**

#### **Chrome/Edge:**
```
1. Cmd+Shift+N (Mac) ou Ctrl+Shift+N (Windows)
2. Dans la fenêtre privée:
   http://localhost:3000/login
3. sophie@salon-elegance.fr / test2025
4. Se connecter
```

#### **Firefox:**
```
1. Cmd+Shift+P (Mac) ou Ctrl+Shift+P (Windows)
2. Dans la fenêtre privée:
   http://localhost:3000/login
3. sophie@salon-elegance.fr / test2025
4. Se connecter
```

#### **Safari:**
```
1. Cmd+Shift+N (Nouvelle fenêtre privée)
2. http://localhost:3000/login
3. sophie@salon-elegance.fr / test2025
4. Se connecter
```

---

### **MÉTHODE 3: Script de déconnexion forcée**

#### **Dans la console du navigateur (F12 → Console):**
```javascript
// Supprimer le cookie auth_session
document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Vérifier qu'il est supprimé
console.log("Cookies:", document.cookie);

// Rediriger vers login
window.location.href = "/login";
```

---

### **MÉTHODE 4: Déconnexion complète via interface**

```
1. Sur localhost:3000/admin/dashboard
2. Cliquer sur "Déconnexion" (en haut à droite)
3. Attendre la redirection vers /super-admin/login
4. Fermer cet onglet
5. Ouvrir un nouvel onglet
6. Aller sur http://localhost:3000/login
7. Se connecter avec sophie@salon-elegance.fr
```

---

## 🧪 TESTS DE VALIDATION

### **Test 1: Vérifier la suppression du cookie**
```javascript
// Dans la console (F12)
console.log(document.cookie);
// Doit afficher: "" (vide) ou ne pas contenir "auth_session"
```

### **Test 2: Vérifier l'utilisateur connecté**
```javascript
// Dans la console (F12)
fetch('/api/auth/me')
  .then(r => r.json())
  .then(d => console.log('User:', d.user));

// Doit afficher:
// User: { type: "TENANT_USER", email: "sophie@salon-elegance.fr", ... }
// PAS: { type: "SUPER_ADMIN", ... }
```

### **Test 3: Vérifier le dashboard**
```
URL: localhost:3000/admin/dashboard
Header: "Connecté en tant que..." doit afficher le nom de Sophie
Email: doit afficher sophie@salon-elegance.fr
Stats: Réservations: 0, Utilisateurs: 1
```

---

## 🔧 SI LE PROBLÈME PERSISTE

### **Diagnostic approfondi:**

#### **1. Vérifier les cookies dans le terminal:**
```bash
# Ouvrir la console du navigateur (F12)
# Copier ce code et l'exécuter:
document.cookie.split(';').forEach(c => console.log(c.trim()));
```

#### **2. Tester l'API directement:**
```bash
# Dans le terminal
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: auth_session=YOUR_COOKIE_HERE" \
  -v
```

#### **3. Vérifier les headers de réponse:**
```bash
# Dans la console réseau (F12 → Network)
# Lors de la déconnexion, vérifier:
# - Status: 200
# - Set-Cookie: auth_session=; Max-Age=0; Path=/
```

---

## 📋 CHECKLIST DE DÉPANNAGE

Cochez chaque étape :

- [ ] **Étape 1:** Ouvrir F12 (Outils de développement)
- [ ] **Étape 2:** Aller dans "Application" ou "Stockage"
- [ ] **Étape 3:** Trouver "Cookies" → "localhost:3000"
- [ ] **Étape 4:** Supprimer "auth_session"
- [ ] **Étape 5:** Vérifier qu'il est bien supprimé
- [ ] **Étape 6:** Fermer tous les onglets localhost:3000
- [ ] **Étape 7:** Ouvrir nouvel onglet (ou privé)
- [ ] **Étape 8:** Aller sur /login (PAS /super-admin/login)
- [ ] **Étape 9:** Saisir sophie@salon-elegance.fr
- [ ] **Étape 10:** Saisir test2025
- [ ] **Étape 11:** Cliquer "Se connecter"
- [ ] **Étape 12:** Vérifier l'email affiché en haut

---

## ⚠️ ERREURS COURANTES

### **Erreur 1: Mauvaise URL de login**
```
❌ http://localhost:3000/super-admin/login
✅ http://localhost:3000/login
```

### **Erreur 2: Cookie toujours présent**
```
Cause: Pas supprimé correctement
Solution: Utiliser navigation privée
```

### **Erreur 3: Cache du navigateur**
```
Cause: Page en cache
Solution: Ctrl+Shift+R (hard refresh)
```

### **Erreur 4: Plusieurs onglets**
```
Cause: Session partagée entre onglets
Solution: Fermer TOUS les onglets
```

---

## 🎯 RÉSULTAT ATTENDU

Après avoir suivi les étapes, vous devez voir :

```
┌────────────────────────────────────┐
│ localhost:3000/admin/dashboard     │
├────────────────────────────────────┤
│                                    │
│ Logo     Connecté en tant que:     │
│          [Nom du tenant]           │
│          sophie@salon-elegance.fr  │
│                                    │
│ Dashboard Salon Élégance           │
│                                    │
│ Réservations: 0                    │
│ Utilisateurs: 1                    │
│                                    │
└────────────────────────────────────┘
```

**PAS:**
```
❌ Super Administrateur
❌ admin@kairodigital.com
```

---

## 📞 SI RIEN NE FONCTIONNE

Contactez-moi avec :
1. Screenshot de la console (F12 → Console)
2. Screenshot des cookies (F12 → Application → Cookies)
3. Copie de `document.cookie` depuis la console
4. Logs du terminal Next.js

---

**✅ SUIVEZ CES ÉTAPES DANS L'ORDRE ET VOUS SEREZ CONNECTÉ AVEC SOPHIE !**

