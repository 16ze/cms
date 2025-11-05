# 🆓 Guide : Configuration Google Custom Search API (GRATUIT)

**Obtenez les vraies positions de vos concurrents sans payer !**

---

## 🎯 **Avantages**

✅ **100% GRATUIT** jusqu'à 100 requêtes/jour (3000/mois)  
✅ **Positions concurrents RÉELLES** depuis Google  
✅ **Officiel Google** (pas de risque légal)  
✅ **Configuration en 10 minutes**  
✅ **Cache intelligent inclus** (économise les requêtes)

---

## 📝 **Étapes de Configuration**

### **Étape 1 : Créer une clé API Google (2 minutes)**

1. Allez sur : https://console.cloud.google.com/apis/credentials
2. Cliquez sur **"Créer des identifiants"** → **"Clé API"**
3. Copiez la clé générée (ex: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxx`)
4. (Optionnel) Restreindre la clé :
   - Cliquez sur la clé créée
   - **Restrictions relatives à l'API** → **Custom Search JSON API**
   - Sauvegarder

### **Étape 2 : Activer l'API Custom Search (1 minute)**

1. Restez sur Google Cloud Console
2. Allez dans **"Bibliothèque d'API"**
3. Recherchez **"Custom Search JSON API"**
4. Cliquez sur **"Activer"**

### **Étape 3 : Créer un moteur de recherche (3 minutes)**

1. Allez sur : https://programmablesearchengine.google.com/
2. Cliquez sur **"Ajouter"** ou **"Create search engine"**
3. Configuration :
   - **Sites à rechercher** : Sélectionnez **"Rechercher sur tout le Web"**
   - **Nom du moteur** : "Analyse SEO Concurrentielle"
   - **Langue** : Français
4. Cliquez sur **"Créer"**
5. Dans les paramètres du moteur :
   - Activez **"Rechercher sur tout le Web"** (si pas déjà fait)
   - Désactivez **"Recherche d'images"** (optionnel, pour économiser)
6. **Copiez le Search Engine ID** (ex: `01234567890abcdef:xxxxxxxxx`)

### **Étape 4 : Configuration dans votre projet (2 minutes)**

1. Ouvrez votre fichier `.env.local`
2. Ajoutez ces lignes :

```env
# Google Custom Search API (GRATUIT 100 requêtes/jour)
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=01234567890abcdef:xxxxxxxxx
```

3. Redémarrez votre serveur :

```bash
pkill -f "next dev" && npm run dev
```

---

## ✅ **Test de Configuration**

Une fois configuré, lancez une analyse SEO :

```bash
curl -X POST "http://localhost:3000/api/admin/seo/keywords/analyze" \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["développement web"], "sector": "web_agency"}'
```

**Dans les logs, vous devriez voir :**

```
🎯 Stratégie d'analyse concurrentielle:
📊 Tentative #1 pour "développement web": Google Custom Search (gratuit)
🔍 [Google Custom Search] Analyse pour "développement web"
🔍 Recherche Google pour "développement web" (locale: fr)
✅ 10 résultats récupérés pour "développement web"
📊 Analyse "développement web": Votre position = 4, 3 concurrent(s) trouvé(s)
✅ [Données réelles] Position: 4, 3 concurrent(s)
💾 Cache stocké pour "développement web_competitors" (TTL: 1440 min)
✅ Données réelles obtenues via Google Custom Search
```

---

## 📊 **Fonctionnalités Implémentées**

### **1. Cache Intelligent** 💾
- Stocke les résultats pendant 24h
- Économise vos 100 requêtes/jour
- Nettoyage automatique des données expirées

### **2. Stratégie en Cascade** 🎯
1. **Priorité #1** : Google Custom Search (positions réelles - gratuit)
2. **Priorité #2** : Google Search Console (votre position uniquement)
3. **Fallback #3** : Données simulées

### **3. Analyse Complète** 📈
- Votre position réelle
- Positions des concurrents réelles
- Top 10 résultats Google
- Calcul automatique des gaps
- Estimation du trafic potentiel

---

## 💡 **Conseils pour Économiser les Requêtes**

### **Limites Gratuites**
- **100 requêtes/jour** = 3000/mois
- Reset tous les jours à minuit (PST)

### **Optimisations Automatiques**
✅ **Cache 24h** : Les mêmes mots-clés ne consomment pas de requêtes  
✅ **Limite à 3 mots-clés** : Analyse seulement les 3 premiers  
✅ **Stratégie intelligente** : Fallback vers autres sources

### **Si vous dépassez la limite**
Le système basculera automatiquement vers :
1. Google Search Console (votre position)
2. Données simulées (basées sur vos vraies positions)

---

## 🔍 **Exemple de Résultats Réels**

### **Avant (données simulées)**
```json
{
  "keyword": "agence web",
  "yourPosition": 4,
  "competitorPositions": [
    {"domain": "concurrent1.fr", "position": 2},  // ← Simulé
    {"domain": "concurrent2.fr", "position": 3}   // ← Simulé
  ],
  "isRealData": false
}
```

### **Après (données réelles)**
```json
{
  "keyword": "agence web",
  "yourPosition": 4,
  "competitorPositions": [
    {"domain": "webflow.com", "position": 1},           // ← Réel !
    {"domain": "agence-webmarketing.fr", "position": 2}, // ← Réel !
    {"domain": "sortlist.fr", "position": 3}            // ← Réel !
  ],
  "isRealData": true  // ← Marqueur de données réelles
}
```

---

## 🚨 **Dépannage**

### **Problème : "Google Custom Search API non configurée"**
✅ Vérifiez que les variables d'environnement sont bien dans `.env.local`  
✅ Redémarrez le serveur après modification

### **Problème : "Quota dépassé"**
✅ Attendez le lendemain (reset à minuit PST)  
✅ Le système bascule automatiquement sur les autres sources

### **Problème : "Aucun résultat trouvé"**
✅ Vérifiez que le mot-clé est pertinent  
✅ Essayez avec des mots-clés plus généralistes  
✅ Vérifiez que votre site est bien indexé sur Google

---

## 📈 **Monitoring**

### **Vérifier l'utilisation du quota**

1. Allez sur : https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas
2. Vous verrez :
   - **Requêtes utilisées aujourd'hui**
   - **Limite quotidienne** (100)
   - **Reset dans** (heures)

### **Statistiques du cache**

Les logs afficheront automatiquement :
```
✅ Cache hit pour "développement web" (expire dans 1320 min)
💾 Cache stocké pour "agence web_competitors" (TTL: 1440 min)
🧹 2 entrée(s) expirée(s) nettoyée(s)
```

---

## 🎉 **C'est Fini !**

Votre système d'analyse concurrentielle utilise maintenant :
- ✅ **Vraies positions** depuis Google (gratuit)
- ✅ **Cache intelligent** pour économiser les requêtes
- ✅ **Fallback automatique** si quota dépassé
- ✅ **Marqueurs de données** pour identifier la source

**Vous avez maintenant un système professionnel d'analyse SEO 100% gratuit !** 🚀

---

## 📚 **Ressources**

- [Documentation Google Custom Search](https://developers.google.com/custom-search/v1/overview)
- [Tarification](https://developers.google.com/custom-search/v1/overview#pricing)
- [Console Google Cloud](https://console.cloud.google.com/)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)

---

**Questions ? Besoin d'aide ?**  
Contactez votre assistant IA développeur ! 🤖

