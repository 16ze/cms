# 📊 Exports de Données

Ce dossier contient tous les exports de données du projet (contacts, dashboard, analyses).

## 📂 Structure

```
exports/
├── contacts/       → Exports des contacts clients
├── dashboard/      → Exports des données du dashboard admin
└── analysis/       → Analyses et inventaires complets
```

---

## 👥 Contacts (`contacts/`)

Exports des données de contacts clients.

### Fichiers

- **contacts_export.csv**
  - Premier export de contacts
  - Données brutes du formulaire de contact

- **contacts_export2.csv**
  - Second export (mise à jour)
  - Version plus récente des contacts

### Colonnes Typiques

```csv
id, nom, prenom, email, telephone, entreprise, message, date_creation, statut
```

---

## 📈 Dashboard (`dashboard/`)

Exports des données du dashboard administrateur.

### Fichiers

- **dashboard_export.csv**
  - Premier export dashboard
  - Métriques et statistiques

- **dashboard_export2.csv**
  - Second export (mise à jour)
  - Nouvelles métriques

- **dashboard_export3.csv**
  - Troisième export (version finale)
  - Données les plus récentes

### Données Exportées

- Statistiques de visites
- Conversions
- Réservations
- Performances

---

## 🔍 Analysis (`analysis/`)

Analyses et inventaires complets du projet.

### Fichiers

- **full-inventory.csv**
  - Inventaire complet du projet
  - Liste de tous les fichiers
  - Métriques et classifications

### Contenu Typique

```csv
fichier, type, taille, lignes, complexite, categorie, statut
```

---

## 🎯 Utilisation

### Ouvrir un Export

Les fichiers CSV peuvent être ouverts avec :
- Excel
- Google Sheets
- Numbers (Mac)
- LibreOffice Calc
- Éditeur de texte

### Importer dans Excel

1. Ouvrir Excel
2. Fichier → Ouvrir
3. Sélectionner le fichier `.csv`
4. Choisir le séparateur (virgule)
5. Valider

### Importer dans Google Sheets

1. Ouvrir Google Sheets
2. Fichier → Importer
3. Glisser-déposer le fichier
4. Choisir "Remplacer les données"
5. Valider

---

## ⚠️ Sécurité

**Ces fichiers contiennent des données sensibles !**

### ❌ À NE PAS FAIRE

- ❌ Commit dans Git
- ❌ Partager publiquement
- ❌ Envoyer par email non sécurisé
- ❌ Laisser en production

### ✅ Bonnes Pratiques

- ✅ Garder en local uniquement
- ✅ Ajouter à `.gitignore`
- ✅ Chiffrer si nécessaire
- ✅ Supprimer après utilisation

---

## 📋 Format CSV

### Structure Standard

```csv
colonne1,colonne2,colonne3
valeur1,valeur2,valeur3
valeur4,valeur5,valeur6
```

### Séparateurs

- **Virgule** (`,`) : Standard international
- **Point-virgule** (`;`) : Standard français Excel

### Encodage

- **UTF-8** : Recommandé (accents, émojis)
- **ISO-8859-1** : Ancien, éviter

---

## 🔄 Générer de Nouveaux Exports

### Via l'Interface Admin

1. Se connecter à `/admin`
2. Aller dans la section concernée
3. Cliquer sur "Exporter"
4. Choisir le format CSV
5. Télécharger

### Via l'API

```bash
# Exporter les contacts
curl -X GET http://localhost:3000/api/admin/contacts/export \
  -H "Cookie: session=..." \
  -o contacts_export.csv

# Exporter le dashboard
curl -X GET http://localhost:3000/api/admin/dashboard/export \
  -H "Cookie: session=..." \
  -o dashboard_export.csv
```

---

## 📊 Statistiques Actuelles

```
Contacts exportés  : 2 fichiers
Dashboard exportés : 3 fichiers
Analyses          : 1 fichier
Total             : 6 fichiers
```

---

## 🗑️ Nettoyage

Pour nettoyer les anciens exports :

```bash
# Supprimer tous les exports de contacts
rm exports/contacts/*.csv

# Supprimer tous les exports de dashboard
rm exports/dashboard/*.csv

# Garder uniquement le dernier export
# (à faire manuellement)
```

---

## 📝 Nomenclature

### Format Recommandé

```
[type]_export_[date]_[version].csv

Exemples :
- contacts_export_2025-10-10_v1.csv
- dashboard_export_2025-10-10_final.csv
- analysis_inventory_2025-10-10.csv
```

---

_Dossier créé le : 10 octobre 2025_  
_Projet : KAIRO Digital Website_  
_⚠️ Données sensibles - Ne pas versionner dans Git_

