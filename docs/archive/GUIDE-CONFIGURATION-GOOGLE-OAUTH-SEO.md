# 🔧 Guide Configuration Google OAuth pour SEO Analysis

**Date** : 12 octobre 2025  
**Objectif** : Configurer Google OAuth pour activer les données réelles dans `/admin/seo/analysis`

---

## 🎯 **POURQUOI CONFIGURER GOOGLE OAUTH ?**

Actuellement, votre page `/admin/seo/analysis` affiche :

- ✅ **Score technique** : 53/100 (calculé)
- ✅ **Problèmes détectés** : 7 erreurs/warnings
- ✅ **Suggestions** : 2 recommandations
- ❌ **Données Google** : "Non configuré"

**Avec OAuth configuré, vous aurez :**

- 📊 **Score Google** : Basé sur Analytics + Search Console
- 📈 **Score combiné** : Technique + Google plus précis
- 🔍 **Métriques réelles** : Sessions, pages vues, bounce rate
- 🎯 **Mots-clés réels** : Vos vraies positions Google

---

## 📋 **ÉTAPES DE CONFIGURATION**

### **1. Google Cloud Console**

1. **Aller sur** : https://console.cloud.google.com/
2. **Créer ou sélectionner** un projet
3. **Activer la facturation** (gratuit jusqu'à 100 requêtes/jour)

### **2. Activer les APIs nécessaires**

Dans Google Cloud Console → **APIs & Services** → **Library** :

**APIs à activer :**

- ✅ **Google Analytics Data API**
- ✅ **Google Search Console API**
- ✅ **Google Custom Search JSON API**

### **3. Configurer OAuth 2.0**

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client IDs**
3. **Application type** : Web application
4. **Name** : "KAIRO SEO Analysis"
5. **Authorized redirect URIs** :
   ```
   http://localhost:3000/api/auth/google/callback
   ```

### **4. Récupérer les identifiants**

Après création, vous obtiendrez :

- **Client ID** : `123456789-abcdefghijk.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-abcdefghijklmnopqrstuvwxyz`

### **5. Configurer Google Analytics**

1. **Aller sur** : https://analytics.google.com/
2. **Créer une propriété** pour `kairo-digital.fr`
3. **Récupérer le Property ID** : `G-XXXXXXXXXX`

### **6. Configurer Google Search Console**

1. **Aller sur** : https://search.google.com/search-console/
2. **Ajouter votre propriété** : `https://kairo-digital.fr`
3. **Vérifier la propriété** (via fichier HTML ou DNS)
4. **Lier à Google Analytics**

### **7. Configurer Google Custom Search**

1. **Aller sur** : https://cse.google.com/
2. **Créer un moteur de recherche**
3. **Sites à rechercher** : `*` (pour rechercher tout le web)
4. **Récupérer l'Engine ID** : `0123456789:abcdefghij`
5. **Dans Google Cloud Console**, activer l'API et créer une clé API

---

## ⚙️ **CONFIGURATION DU FICHIER .env.local**

Remplacer les valeurs dans `.env.local` :

```bash
# Google OAuth 2.0 (OBLIGATOIRE)
GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Google Analytics (pour métriques réelles)
GOOGLE_ANALYTICS_PROPERTY_ID=G-QCJ1PQY6WB

# Google Search Console (pour mots-clés réels)
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:kairo-digital.fr

# Google Custom Search (pour concurrents réels)
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyAlKeygt_aHvt2zxuvEWVVSH6_hwa1Fqf4
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=04df66faa405548ec

# Configuration du site
NEXT_PUBLIC_SITE_URL=https://kairo-digital.fr
```

---

## 🔄 **ACTIVATION DE LA CONNEXION**

### **1. Redémarrer le serveur**

```bash
npm run dev
```

### **2. Aller dans les paramètres SEO**

1. **Accéder à** : http://localhost:3000/admin/seo/settings
2. **Section "Intégrations Google"**
3. **Cliquer sur "Connecter avec Google"**
4. **Autoriser l'accès** aux APIs

### **3. Vérifier la connexion**

1. **Aller à** : http://localhost:3000/admin/seo/analysis
2. **Onglet "Données Google"** doit afficher "Connecté"
3. **Score combiné** doit inclure les données Google

---

## ✅ **RÉSULTATS ATTENDUS**

### **Avant OAuth (actuel) :**

```
Score Technique: 53/100
Score Google: null
Score Combiné: 53/100
Google Connecté: False
```

### **Après OAuth :**

```
Score Technique: 53/100
Score Google: 78/100
Score Combiné: 65/100
Google Connecté: True

Métriques Google:
- Sessions: 1,247 (ce mois)
- Pages vues: 3,891
- Bounce rate: 42%
- Mots-clés: 45 positions
```

---

## 🚨 **DÉPANNAGE**

### **Erreur "OAuth non configuré"**

- Vérifier que `GOOGLE_OAUTH_CLIENT_ID` et `GOOGLE_OAUTH_CLIENT_SECRET` sont définis
- Redémarrer le serveur après modification de `.env.local`

### **Erreur "API not enabled"**

- Vérifier que les 3 APIs sont activées dans Google Cloud Console
- Attendre 5-10 minutes après activation

### **Erreur "Insufficient permissions"**

- Vérifier que le site est bien ajouté dans Search Console
- Vérifier que la propriété Analytics est correcte

### **Erreur "Quota exceeded"**

- Google Custom Search : 100 requêtes/jour gratuites
- Analytics/Search Console : 100 requêtes/jour gratuites
- Attendre le lendemain ou passer en version payante

---

## 💰 **COÛTS**

### **Gratuit (quotas par jour) :**

- **Google Analytics Data API** : 100 requêtes
- **Google Search Console API** : 100 requêtes
- **Google Custom Search JSON API** : 100 requêtes

### **Payant (si besoin de plus) :**

- **Analytics** : $0.01 par requête
- **Search Console** : $0.01 par requête
- **Custom Search** : $5 pour 1000 requêtes

**Pour un usage normal, le gratuit suffit largement !**

---

## 🎯 **APRÈS CONFIGURATION**

Une fois OAuth configuré, votre page `/admin/seo/analysis` affichera :

1. **Dashboard complet** avec scores Google réels
2. **Métriques détaillées** depuis Analytics
3. **Mots-clés réels** depuis Search Console
4. **Concurrents réels** depuis Custom Search
5. **Suggestions personnalisées** basées sur vos vraies données

**Votre analyse SEO sera 100% basée sur vos vraies performances Google !** 🚀

---

**Guide créé le** : 12 octobre 2025  
**Statut** : ✅ **PRÊT À CONFIGURER**  
**Temps estimé** : 15-20 minutes  
**Difficulté** : Moyenne
