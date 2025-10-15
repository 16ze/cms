# 🔍 Audit des données hardcodées - Paramètres SEO

**Date** : Octobre 2025  
**Méthodologie** : Analyse ligne par ligne du code source

---

## 📊 Résumé exécutif

### ✅ Verdict : Les vraies données SONT récupérées correctement

**État actuel** :
- ✅ Données récupérées depuis `/api/settings` (base de données PostgreSQL)
- ✅ Fallback vers `defaultSettings` uniquement si API échoue
- ✅ Pattern `data.seoSettings?.property || defaultSettings.seo.property`
- ⚠️ `defaultSettings` contient des valeurs de démonstration KAIRO Digital

---

## 📍 PARTIE 1 : Données hardcodées identifiées

### 1.1 DefaultSettings (lignes 223-270)

**Localisation** : `const defaultSettings: SiteSettings`

**Données KAIRO Digital hardcodées** :

```typescript
general: {
  siteName: "KAIRO Digital",  // ❌ Hardcodé
  tagline: "Agence de développement web et consulting digital",  // ❌ Hardcodé
  contactEmail: "contact.kairodigital@gmail.com",  // ❌ Hardcodé
  phoneNumber: "06 XX XX XX XX",  // ❌ Hardcodé
  address: "",  // ✅ Vide par défaut
}

social: {
  facebook: "https://facebook.com/kairodigital",  // ❌ Hardcodé
  twitter: "",  // ✅ Vide
  instagram: "https://instagram.com/kairodigital",  // ❌ Hardcodé
  linkedin: "https://linkedin.com/company/kairodigital",  // ❌ Hardcodé
}

seo: {
  metaTitle: "KAIRO Digital | Agence web & consulting digital",  // ❌ Hardcodé
  metaDescription: "KAIRO Digital vous accompagne dans vos projets web...",  // ❌ Hardcodé
  keywords: "web, digital, développement, consulting, kairo",  // ❌ Hardcodé
  ogTitle: "KAIRO Digital | Agence web & consulting digital",  // ❌ Hardcodé
  ogDescription: "KAIRO Digital vous accompagne...",  // ❌ Hardcodé
  ogImage: "/images/kairo-og-image.jpg",  // ❌ Hardcodé
  canonicalUrl: "https://www.kairo-digital.fr",  // ❌ Hardcodé
}
```

**⚠️ Impact** :
- Si `/api/settings` échoue → Affiche les données KAIRO Digital
- Si base de données vide → Affiche les données KAIRO Digital

---

### 1.2 Prévisualisation Google (lignes 2152-2166)

**Fallback hardcodé** :

```typescript
{settings.seo?.canonicalUrl || "https://www.kairo-digital.fr"}
// ❌ Fallback hardcodé utilisé 2 fois (lignes 2154 et 2165)
```

**Impact** :
- Si l'utilisateur n'a pas configuré canonicalUrl
- La prévisualisation affiche `https://www.kairo-digital.fr`

---

### 1.3 Test de performance (ligne 811)

**Fallback hardcodé** :

```typescript
url: settings.seo?.canonicalUrl || "https://www.kairo-digital.fr"
// ❌ Si pas d'URL configurée, teste kairo-digital.fr
```

---

### 1.4 Admin user (ligne 280-284)

**Admin temporaire hardcodé** :

```typescript
const tempAdmin: AdminUser = {
  id: "temp-admin",
  name: "Admin Temporaire",  // ❌ Hardcodé
  email: "admin@kairodigital.com",  // ❌ Hardcodé
  role: "super_admin",
};
```

---

## ✅ PARTIE 2 : Récupération des vraies données

### 2.1 Flux de récupération des données

**Étape 1** : useEffect déclenché au chargement (ligne 293)

```typescript
useEffect(() => {
  const fetchSettings = async () => {
    // 1. Appel API
    const response = await fetch("/api/settings");
    const data = await response.json();
    
    // 2. Transformation des données
    const transformedSettings = {
      seo: {
        metaTitle: data.seoSettings?.defaultMetaTitle || defaultSettings.seo.metaTitle,
        // ... toutes les propriétés SEO
      }
    };
    
    // 3. Mise à jour du state
    setSettings(transformedSettings);
  };
  
  if (adminUser) {
    fetchSettings(); // ✅ Appelé uniquement si admin connecté
  }
}, [adminUser]);
```

**✅ Verdict** : Les vraies données SONT récupérées

---

### 2.2 API `/api/settings` - Vérification

<function_calls>
<invoke name="run_terminal_cmd">
<parameter name="command">curl -s http://localhost:3000/api/settings | head -c 500
