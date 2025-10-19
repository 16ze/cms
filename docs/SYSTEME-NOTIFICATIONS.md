# 📬 Système de Notifications - KAIRO Digital Admin

## 🎯 Vue d'ensemble

Système de notifications complet pour l'espace admin KAIRO Digital, permettant de notifier les administrateurs des événements importants en temps réel.

## ✅ Fonctionnalités Implémentées

### 1. **Base de Données (Prisma)**
- ✅ Table `Notification` - Notifications persistantes
- ✅ Table `NotificationPreference` - Préférences utilisateur
- ✅ Table `NotificationHistory` - Historique des actions
- ✅ Table `PushSubscription` - Abonnements push (pour future implémentation)
- ✅ Enums: `NotificationType`, `NotificationCategory`, `NotificationPriority`

### 2. **Backend (API Routes)**
```
/api/notifications              GET, POST, PUT
/api/notifications/[id]         GET, PUT, DELETE
/api/notifications/preferences  GET, PUT
```

### 3. **Service de Notifications** (`notification-service.ts`)
- ✅ Création de notifications
- ✅ Récupération avec filtres
- ✅ Marquage comme lue
- ✅ Gestion des préférences
- ✅ Heures calmes
- ✅ Méthodes helper pour chaque type d'événement

### 4. **Interface Utilisateur**
- ✅ **NotificationBell** - Cloche de notification dans le header
- ✅ **Panel déroulant** avec liste des notifications
- ✅ **Filtres** par catégorie
- ✅ **Groupement** par date (Aujourd'hui, Hier, Cette semaine, Plus ancien)
- ✅ **Actions** : Marquer comme lue, Tout lire, Supprimer
- ✅ **Badge de compteur** avec animation
- ✅ **NotificationPreferences** - Page de gestion des préférences

### 5. **Hooks React**
- ✅ `useNotifications` - Gestion des notifications
- ✅ `useNotificationPreferences` - Gestion des préférences
- ✅ Auto-refresh (30 secondes par défaut)

### 6. **Intégrations**
- ✅ **API Réservations** - Notification à la création
- 🔄 **API Clients** - À intégrer
- 🔄 **API SEO** - À intégrer
- 🔄 **API Contenu** - À intégrer

---

## 📊 Types de Notifications

### **Par Type**
- `INFO` - Information générale (bleu)
- `SUCCESS` - Action réussie (vert)
- `WARNING` - Avertissement (jaune)
- `ERROR` - Erreur (rouge)

### **Par Catégorie**
- `RESERVATION` - Réservations clients
- `CLIENT` - Gestion clients/CRM
- `SEO` - Alertes SEO et performance
- `SYSTEM` - Système et maintenance
- `CONTENT` - Gestion de contenu
- `SECURITY` - Sécurité et accès
- `USER` - Gestion utilisateurs

### **Par Priorité**
- `LOW` - Basse priorité (point gris)
- `MEDIUM` - Moyenne (point bleu)
- `HIGH` - Haute (point orange)
- `URGENT` - Urgente (point rouge, pulse)

---

## 🚀 Utilisation

### **Créer une notification (Backend)**

```typescript
import { notificationService } from "@/lib/notification-service";

// Méthode générique
await notificationService.create({
  userId: "user-id",
  type: "INFO",
  category: "RESERVATION",
  title: "Nouvelle réservation",
  message: "Un client a réservé un créneau",
  priority: "HIGH",
  actionUrl: "/admin/reservations",
  actionLabel: "Voir la réservation",
  metadata: { reservationId: "res-123" },
});

// Méthodes helper
await notificationService.notifyNewReservation(userId, reservation);
await notificationService.notifyNewClient(userId, client);
await notificationService.notifySEOAlert(userId, "Score SEO < 70", "HIGH");
await notificationService.notifySystemError(userId, "Erreur de connexion");
```

### **Utiliser le hook (Frontend)**

```typescript
import { useNotifications } from "@/hooks/use-notifications";

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
    category: "RESERVATION", // Optionnel
    onlyUnread: false, // Optionnel
  });

  return (
    <div>
      <p>Notifications non lues : {unreadCount}</p>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### **Gérer les préférences**

```typescript
import { useNotificationPreferences } from "@/hooks/use-notifications";

function PreferencesComponent() {
  const { preferences, updatePreferences } = useNotificationPreferences();

  const handleToggle = async () => {
    await updatePreferences({
      emailEnabled: !preferences.emailEnabled,
      reservations: true,
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    });
  };
}
```

---

## 🎨 Design

### **NotificationBell**
- Position : Header admin, à droite du nom d'utilisateur
- Badge rouge animé avec compteur
- Panel déroulant avec:
  - Header bleu avec actions rapides
  - Filtres par catégorie
  - Liste groupée par date
  - Footer avec lien "Voir toutes les notifications"

### **Styles**
- Animations: slideDown, pulse, bounce
- Icônes: Lucide React
- Couleurs: Thème cohérent avec l'admin
- Scrollbar personnalisée

---

## 🔧 Configuration

### **Préférences par défaut**
```typescript
{
  emailEnabled: true,
  pushEnabled: true,
  soundEnabled: true,
  reservations: true,
  clients: true,
  seo: true,
  system: true,
  content: true,
  security: true,
  quietHoursEnabled: false,
}
```

### **Heures calmes**
- Période pendant laquelle aucune notification n'est créée
- Configuration par utilisateur
- Format: "HH:MM" (ex: "22:00" - "08:00")
- Gère les périodes qui passent minuit

---

## 📈 Performance

### **Optimisations**
- Index sur userId + read pour requêtes rapides
- Auto-cleanup des notifications expirées
- Pagination (limit/offset)
- Cache des préférences utilisateur
- Auto-refresh configurable

### **Métriques**
- Compteur non lus en temps réel
- Historique des actions (sent, read, clicked, dismissed)
- Groupement par date pour meilleure lisibilité

---

## 🔐 Sécurité

### **Contrôles d'accès**
- Authentification requise (ensureAdmin)
- Un utilisateur ne peut voir que ses propres notifications
- Vérification userId dans toutes les opérations
- Préférences par utilisateur isolées

### **Validation**
- Types stricts avec Prisma
- Validation des données en entrée
- Gestion des erreurs complète

---

## 📝 Prochaines Étapes

### **Phase 2 - Notifications Push**
- [ ] Service Worker pour push navigateur
- [ ] Gestion des abonnements push
- [ ] API /api/notifications/push/register
- [ ] API /api/notifications/push/send
- [ ] Notifications même app fermée

### **Phase 3 - WebSocket Temps Réel**
- [ ] Connexion WebSocket pour notifications instantanées
- [ ] Synchronisation multi-onglets
- [ ] Indicateur de connexion en direct
- [ ] Fallback polling si WebSocket indisponible

### **Phase 4 - Intégrations Complètes**
- [ ] Notifications clients (nouveaux, modifiés)
- [ ] Notifications SEO (alertes auto)
- [ ] Notifications contenu (publications)
- [ ] Notifications sécurité (accès suspects)
- [ ] Système d'automation avec règles

### **Phase 5 - Analytics**
- [ ] Dashboard notifications
- [ ] Taux de lecture par catégorie
- [ ] Temps de réponse moyen
- [ ] Tendances et rapports

---

## 🛠️ Maintenance

### **Nettoyage automatique**
```typescript
// Cron job quotidien recommandé
await notificationService.cleanupExpired();
```

### **Migration**
```bash
# Générer les tables
npx prisma generate
npx prisma migrate dev --name add_notification_system

# En production
npx prisma migrate deploy
```

### **Logs**
- Toutes les opérations loguées
- Format: `✅` succès, `❌` erreur, `📬` info
- Console.log pour debug

---

## 🎯 Exemples d'utilisation

### **1. Nouvelle réservation**
```typescript
// Dans /api/booking/reservation/route.ts
const admins = await prisma.adminUser.findMany({
  where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
});

for (const admin of admins) {
  await notificationService.notifyNewReservation(admin.id, reservation);
}
```

### **2. Alerte SEO automatique**
```typescript
// Dans /api/admin/seo/analyze
if (seoScore < 70) {
  await notificationService.notifySEOAlert(
    userId,
    `Score SEO bas: ${seoScore}/100`,
    "HIGH"
  );
}
```

### **3. Erreur système**
```typescript
// Dans un catch block
catch (error) {
  await notificationService.notifySystemError(
    adminId,
    `Erreur: ${error.message}`
  );
}
```

---

## 📚 Fichiers Créés

### **Backend**
- `src/lib/notification-service.ts` - Service principal
- `src/app/api/notifications/route.ts` - API liste/création
- `src/app/api/notifications/[id]/route.ts` - API détails
- `src/app/api/notifications/preferences/route.ts` - API préférences

### **Frontend**
- `src/hooks/use-notifications.ts` - Hooks React
- `src/components/admin/NotificationBell.tsx` - Composant cloche
- `src/components/admin/NotificationPreferences.tsx` - Composant préférences

### **Database**
- `prisma/schema.prisma` - Modèles ajoutés

### **Documentation**
- `docs/SYSTEME-NOTIFICATIONS.md` - Ce fichier

---

## 🎉 Statut

**Version:** 1.0.0  
**Statut:** ✅ **PRODUCTION READY** (Phase 1 complète)  
**Dernière mise à jour:** 19 Octobre 2025

### **Checklist**
- [x] Schéma BDD
- [x] Service backend
- [x] API routes
- [x] Composant UI
- [x] Hooks React
- [x] Intégration réservations
- [x] Préférences utilisateur
- [x] Documentation
- [ ] Notifications push
- [ ] WebSocket temps réel
- [ ] Intégrations complètes

---

## 📧 Support

Pour toute question ou problème :
- Consulter ce fichier de documentation
- Vérifier les logs dans la console
- Tester avec `console.log` dans notification-service.ts
- Utiliser l'assistant admin 24/7

**Développé avec ❤️ pour KAIRO Digital**

