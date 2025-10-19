# 🚀 Démarrage Rapide - Système de Notifications

## ✅ Installation et Configuration

### **1. Synchroniser la base de données**
```bash
npx prisma db push
```

### **2. Générer le Prisma Client**
```bash
npx prisma generate
```

### **3. Redémarrer le serveur Next.js**
```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis relancer:
npm run dev
```

---

## 🧪 **Test Rapide**

### **1. Ouvrir l'admin**
```
http://localhost:3000/admin/dashboard
```

### **2. Créer une notification de test**
Dans votre navigateur, ouvrez:
```
http://localhost:3000/api/notifications/test
```

Vous devriez voir:
```json
{
  "success": true,
  "message": "Notification de test créée avec succès"
}
```

### **3. Vérifier la cloche**
- Retourner sur le dashboard
- La cloche en haut à droite devrait afficher un badge rouge avec "1"
- Cliquer dessus pour voir la notification

---

## 📊 **Vérification des Logs**

### **Console du navigateur (F12)**
Vous devriez voir:
```
📬 Fetching notifications from: /api/notifications
📬 Response status: 200
📬 Response data: { success: true, data: { ... } }
```

### **Terminal du serveur**
Vous devriez voir:
```
📬 API: Récupération des notifications
📬 API: Utilisateur authentifié: user-id email@example.com
📬 API: Notifications récupérées: 1
📬 API: Unread count: 1
```

---

## ❌ **Si ça ne fonctionne pas**

### **Erreur 500**
```bash
# 1. Vérifier que Prisma est bien généré
npx prisma generate

# 2. Vérifier la BDD
npx prisma studio
# Ouvrir http://localhost:5555
# Vérifier qu'il y a des tables: Notification, NotificationPreference, etc.

# 3. Redémarrer complètement
# Arrêter Next.js (Ctrl+C)
npm run dev
```

### **Erreur 401**
```
Vous n'êtes pas connecté. Allez sur:
http://localhost:3000/admin/login
```

### **Badge ne s'affiche pas**
```bash
# Créer une notification de test
curl http://localhost:3000/api/notifications/test

# Ou ouvrir dans le navigateur
http://localhost:3000/api/notifications/test
```

---

## 🎯 **Utilisation**

### **Créer une notification (Code)**
```typescript
import { notificationService } from "@/lib/notification-service";

// Dans une API route
await notificationService.create({
  userId: user.id,
  type: "INFO",
  category: "SYSTEM",
  title: "Titre de la notification",
  message: "Message de la notification",
  priority: "MEDIUM",
  actionUrl: "/admin/dashboard",
  actionLabel: "Voir"
});
```

### **Créer une réservation → Notification auto**
```
1. Aller sur la page de réservation publique
2. Remplir le formulaire et réserver
3. La notification apparaît automatiquement dans l'admin
```

---

## 📚 **Documentation Complète**

- `docs/SYSTEME-NOTIFICATIONS.md` - Documentation technique
- `docs/RECAPITULATIF-NOTIFICATIONS.md` - Récapitulatif
- `docs/TROUBLESHOOTING-NOTIFICATIONS.md` - Dépannage

---

## ✅ **Checklist de Démarrage**

- [ ] `npx prisma db push` exécuté
- [ ] `npx prisma generate` exécuté
- [ ] Serveur Next.js redémarré
- [ ] Connecté à l'admin
- [ ] `/api/notifications/test` fonctionne
- [ ] Badge de notification visible
- [ ] Panel s'ouvre au clic
- [ ] Notification de test affichée

---

## 🎉 **C'est prêt !**

Le système de notifications est maintenant opérationnel ! 

**Prochaines étapes:**
1. Tester avec une vraie réservation
2. Configurer vos préférences
3. Intégrer avec d'autres événements

**Besoin d'aide?** Consultez `docs/TROUBLESHOOTING-NOTIFICATIONS.md`

---

**Version:** 1.0.2  
**Dernière mise à jour:** 19 Octobre 2025

