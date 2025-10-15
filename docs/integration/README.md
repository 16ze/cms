# 📚 Guide d'intégration - KAIRO Digital Template

Bienvenue dans les guides d'intégration de votre template KAIRO Digital.

## 🎯 Vue d'ensemble

Cette template est **prête à l'emploi** et fonctionne immédiatement sans configuration additionnelle. Les intégrations ci-dessous sont **optionnelles** et permettent d'activer des fonctionnalités avancées.

---

## 📊 Intégrations disponibles

### 1. Google Analytics & APIs Google
**Statut** : ⚙️ Prêt pour activation (infrastructure en place)  
**Temps d'installation** : ~30 minutes  
**Difficulté** : Intermédiaire

**Ce que ça apporte :**
- 📈 Données Analytics réelles dans l'admin
- ⚡ Scores PageSpeed en temps réel
- 🔍 Métriques Search Console
- 📊 Score SEO combiné (technique + Google)

**Guide** : [GOOGLE-ANALYTICS-SETUP.md](./GOOGLE-ANALYTICS-SETUP.md)

**Prérequis :**
- Compte Google Analytics (GA4)
- Compte Google Cloud Platform
- 6 variables d'environnement

---

### 2. Email SMTP (Déjà configuré)
**Statut** : ✅ Fonctionnel

**Ce que ça fait :**
- 📧 Emails de confirmation de réservation
- 📧 Notifications admin
- 📧 Emails d'annulation

**Configuration actuelle** : `.env.local`

---

### 3. Authentification Admin (Déjà configuré)
**Statut** : ✅ Fonctionnel

**Identifiants par défaut :**
- Email : `admin@kairodigital.com`
- Mot de passe : `admin123`

⚠️ **À changer en production !**

---

## 🚀 Roadmap des intégrations futures

### Phase 1 (Prêt maintenant)
- [x] Google Analytics Data API
- [x] PageSpeed Insights API
- [x] Search Console API

### Phase 2 (À venir)
- [ ] Stripe / PayPal (paiements en ligne)
- [ ] Calendly / Cal.com (réservations avancées)
- [ ] CRM externe (Pipedrive, HubSpot)

### Phase 3 (À venir)
- [ ] Multi-langue (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Notifications push

---

## 📝 Comment activer une intégration ?

### Méthode générale

1. **Lire le guide spécifique** dans ce dossier
2. **Créer les comptes** nécessaires (Google, Stripe, etc.)
3. **Obtenir les clés API** depuis les plateformes
4. **Ajouter les variables d'environnement** dans `.env.local`
5. **Redémarrer le serveur** : `npm run dev`
6. **Vérifier** dans l'espace admin

---

## 🔧 Variables d'environnement

### Fichier `.env.local` (local/développement)

```bash
# Base de données
DATABASE_URL="postgresql://..."

# Authentification
JWT_SECRET="..."
ADMIN_EMAIL="admin@kairodigital.com"
ADMIN_PASSWORD="admin123"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Google Analytics (OPTIONNEL)
GOOGLE_ANALYTICS_ENABLED=false
GOOGLE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_PROPERTY_ID=
```

### Fichier `.env.production` (production)

⚠️ **Important** : Utiliser des valeurs différentes en production !

```bash
# Base de données (Production)
DATABASE_URL="postgresql://prod-user:prod-password@..."

# Authentification (CHANGER LES VALEURS !)
JWT_SECRET="super-secret-key-production-different"
ADMIN_EMAIL="admin@votre-domaine.com"
ADMIN_PASSWORD="VotreMotDePasseSecurise123!"

# Site (URL de production)
NEXT_PUBLIC_SITE_URL="https://www.votre-domaine.com"

# Email SMTP (Production)
SMTP_HOST="smtp.votre-provider.com"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASSWORD="..."

# Google Analytics (si activé)
GOOGLE_ANALYTICS_ENABLED=true
GOOGLE_API_KEY="..."
# ... autres variables
```

---

## 🆘 Support

### Documentation officielle
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs
- Tailwind CSS : https://tailwindcss.com/docs

### Guides spécifiques
- [Google Analytics Setup](./GOOGLE-ANALYTICS-SETUP.md)
- Plus de guides à venir...

### Questions fréquentes

**Q: Dois-je activer Google Analytics tout de suite ?**  
R: Non, c'est optionnel. Le système fonctionne parfaitement sans. Activez-le quand vous voulez des données Google réelles.

**Q: Les données Google sont-elles simulées ?**  
R: Non, il n'y a AUCUNE simulation. Si Google n'est pas configuré, aucune donnée Google n'est affichée (propre et honnête).

**Q: L'intégration Google coûte-t-elle de l'argent ?**  
R: Non, les APIs Google sont gratuites dans la limite des quotas (50,000 requêtes/jour pour Analytics).

**Q: Puis-je utiliser ma propre solution d'analytics ?**  
R: Oui ! L'architecture est modulaire. Vous pouvez créer votre propre client dans `src/lib/analytics/`.

---

## 📞 Contact

Pour toute question sur l'intégration ou la configuration :
- Issues GitHub : [Créer une issue](../../../issues)
- Email : support@kairodigital.com (si configuré)

---

**Dernière mise à jour** : Octobre 2025  
**Version template** : 2.0

