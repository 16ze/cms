# 🔧 Troubleshooting - Système de Notifications

## ❌ Erreur: "Erreur lors de la récupération des notifications"

### 🔍 Diagnostic

Cette erreur se produit quand le composant `NotificationBell` ne peut pas récupérer les notifications depuis l'API.

### ✅ Solutions

#### **1. Vérifier que la base de données est synchronisée**

```bash
npx prisma db push
```

Cela va créer les tables:
- `Notification`
- `NotificationPreference`
- `NotificationHistory`
- `PushSubscription`

#### **2. Tester la création d'une notification**

Ouvrez dans votre navigateur (connecté en tant qu'admin):
```
http://localhost:3000/api/notifications/test
```

Vous devriez voir:
```json
{
  "success": true,
  "message": "Notification de test créée avec succès",
  "data": {
    "notification": { ... },
    "user": { ... }
  }
}
```

#### **3. Vérifier les logs dans la console**

Ouvrez la console du navigateur (F12) et cherchez:
```
📬 Fetching notifications from: /api/notifications
📬 Response status: 200
📬 Response data: { success: true, ... }
```

Si vous voyez des erreurs, elles seront plus détaillées maintenant.

#### **4. Vérifier l'authentification**

Le système requiert que vous soyez connecté en tant qu'admin. Vérifiez:
```javascript
// Dans la console du navigateur
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

Vous devriez voir vos informations utilisateur.

#### **5. Vérifier que l'utilisateur existe dans AdminUser**

L'erreur peut survenir si votre session pointe vers un utilisateur qui n'existe pas dans la table `AdminUser`.

```bash
# Ouvrir Prisma Studio
npx prisma studio
```

Vérifiez qu'il y a au moins un utilisateur dans `AdminUser`.

---

## 🐛 Autres problèmes courants

### **Badge de notification ne s'affiche pas**

**Cause:** Pas de notifications non lues

**Solution:**
1. Créer une notification de test: `/api/notifications/test`
2. Vérifier que `read: false` dans la BDD
3. Rafraîchir la page

### **Panel de notifications vide**

**Cause:** Aucune notification créée

**Solution:**
1. Créer une réservation pour tester
2. Ou utiliser `/api/notifications/test`
3. Vérifier la console pour les erreurs

### **Erreur 401 Unauthorized**

**Cause:** Non authentifié

**Solution:**
1. Se reconnecter à l'admin
2. Vérifier que le cookie de session est présent
3. Vérifier `/api/auth/me`

### **Erreur 500 Internal Server Error**

**Cause:** Erreur serveur (BDD, Prisma, etc.)

**Solution:**
1. Vérifier les logs du serveur (terminal où Next.js tourne)
2. Vérifier que Prisma est bien généré: `npx prisma generate`
3. Vérifier que la BDD est synchronisée: `npx prisma db push`

---

## 🧪 Tests Manuels

### **Test 1: Créer une notification**
```bash
# Dans un autre terminal
curl -X GET http://localhost:3000/api/notifications/test \
  -H "Cookie: admin_session=VOTRE_SESSION"
```

### **Test 2: Récupérer les notifications**
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Cookie: admin_session=VOTRE_SESSION"
```

### **Test 3: Marquer comme lue**
```bash
curl -X PUT http://localhost:3000/api/notifications/NOTIFICATION_ID \
  -H "Cookie: admin_session=VOTRE_SESSION"
```

---

## 📊 Vérifier l'état du système

### **Prisma Studio**
```bash
npx prisma studio
```

Ouvrez http://localhost:5555 et vérifiez:
- `AdminUser`: Votre utilisateur est présent
- `Notification`: Les notifications sont créées
- `NotificationPreference`: Les préférences existent

### **Logs serveur**

Dans le terminal où Next.js tourne, cherchez:
```
📬 API: Récupération des notifications
✅ API: Notifications récupérées avec succès
```

Ou des erreurs:
```
❌ Erreur lors de la récupération des notifications
```

---

## 🔄 Réinitialisation complète

Si rien ne fonctionne, réinitialisez le système:

```bash
# 1. Arrêter le serveur Next.js (Ctrl+C)

# 2. Supprimer la base de données
rm prisma/dev.db
rm prisma/dev.db-journal

# 3. Recréer la base de données
npx prisma db push

# 4. Recréer un utilisateur admin
# (Utiliser votre script d'initialisation ou l'interface)

# 5. Redémarrer Next.js
npm run dev
```

---

## 📝 Checklist de vérification

- [ ] Base de données synchronisée (`npx prisma db push`)
- [ ] Prisma Client généré (`npx prisma generate`)
- [ ] Serveur Next.js redémarré
- [ ] Connecté en tant qu'admin
- [ ] Utilisateur existe dans `AdminUser`
- [ ] Route de test fonctionne (`/api/notifications/test`)
- [ ] Console navigateur sans erreurs
- [ ] Logs serveur sans erreurs

---

## 💡 Besoin d'aide supplémentaire ?

1. **Vérifier la documentation**
   - `docs/SYSTEME-NOTIFICATIONS.md` - Documentation technique
   - `docs/RECAPITULATIF-NOTIFICATIONS.md` - Récapitulatif

2. **Activer les logs détaillés**
   - Les logs sont maintenant activés dans `useNotifications`
   - Vérifier la console du navigateur (F12)
   - Vérifier les logs du serveur

3. **Tester avec Postman/Insomnia**
   - Importer les routes API
   - Tester chaque endpoint individuellement
   - Vérifier les réponses

4. **Utiliser Prisma Studio**
   - Inspecter directement la BDD
   - Créer/modifier/supprimer des données
   - Vérifier les relations

---

## ✅ Le système fonctionne si...

- ✅ `/api/notifications/test` retourne `success: true`
- ✅ La cloche s'affiche dans le header
- ✅ Le badge montre le bon nombre
- ✅ Le panel s'ouvre au clic
- ✅ Les notifications apparaissent
- ✅ Marquer comme lue fonctionne
- ✅ Aucune erreur dans la console

---

**Dernière mise à jour:** 19 Octobre 2025  
**Version:** 1.0.1

