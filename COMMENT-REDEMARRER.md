# 🔄 COMMENT REDÉMARRER NEXT.JS

## 🎯 **OPTION 1 : Script Automatique (Recommandé)**

### **Dans N'IMPORTE QUEL terminal, tapez :**

```bash
./restart-nextjs.sh
```

**Ou si ça ne marche pas :**

```bash
bash restart-nextjs.sh
```

Le script va :
1. Arrêter Next.js automatiquement
2. Attendre 2 secondes
3. Relancer Next.js

**Appuyez sur `y` quand demandé.**

---

## 🎯 **OPTION 2 : Manuel**

### **Étape 1 : Trouver le terminal Next.js**

Cherchez un terminal/onglet avec ce texte :
```
▲ Next.js 15.2.4
✓ Ready in 2.5s
```

### **Étape 2 : Arrêter**

**Dans CE terminal**, appuyez sur les touches de votre clavier :
```
Ctrl + C
```

(Maintenez Ctrl, puis appuyez sur C)

### **Étape 3 : Attendre**

Attendez 2-3 secondes que le terminal affiche :
```
$
```

### **Étape 4 : Relancer**

**Dans LE MÊME terminal**, tapez :
```bash
npm run dev
```

Puis appuyez sur Entrée.

### **Étape 5 : Attendre "Ready"**

Attendez de voir :
```
✓ Ready in 2.5s
```

---

## 🎯 **OPTION 3 : Nouveau Terminal**

Si vous ne trouvez pas le terminal où Next.js tourne :

### **Terminal 1 : Arrêt forcé**

Ouvrez un nouveau terminal et tapez :
```bash
cd "/Users/KAIRO Dgital projet/templateVITRINE/kairowebsite"
pkill -f "next dev"
```

### **Terminal 2 : Relance**

Dans le même terminal ou un autre :
```bash
cd "/Users/KAIRO Dgital projet/templateVITRINE/kairowebsite"
npm run dev
```

---

## ✅ **APRÈS LE REDÉMARRAGE**

### **1. Rafraîchir la page**
```
Appuyez sur F5 dans votre navigateur
```

### **2. Tester**
```
http://localhost:3000/api/notifications/test
```

### **3. Vérifier la cloche**
La cloche 🔔 en haut à droite devrait montrer un badge "1"

---

## 💡 **CONSEIL**

**Utilisez l'OPTION 1 (script automatique) - c'est le plus simple !**

```bash
./restart-nextjs.sh
```

Appuyez sur `y` et c'est fait automatiquement.

---

## 📞 **BESOIN D'AIDE ?**

Si vous ne savez pas comment faire, dites-moi :
- **Système d'exploitation** : Mac / Windows / Linux ?
- **Terminal utilisé** : Terminal Mac / iTerm / VS Code Terminal ?
- **Emplacement de Next.js** : Quel terminal / onglet ?

Et je vous guiderai étape par étape.

---

**Le système fonctionne, il attend juste le redémarrage ! ⚡**

