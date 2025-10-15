# 🧪 Tests & Logs

Ce dossier contient tous les logs et résultats de tests du projet.

## 📂 Structure

```
tests-logs/
├── maintenance/    → Tests du mode maintenance
├── cookies/        → Tests et logs des cookies
└── cycles/         → Tests de cycles et d'itérations
```

---

## 📁 Maintenance (`maintenance/`)

Tests du système de mode maintenance.

### Fichiers

- **test_maintenance.txt**
  - Test d'activation du mode maintenance
  - Vérification que le site affiche la page maintenance

- **test_disable_maintenance.txt**
  - Test de désactivation du mode maintenance
  - Retour au mode normal

- **test_force_disable.txt**
  - Test de désactivation forcée
  - Bypass des contrôles

---

## 🍪 Cookies (`cookies/`)

Tests et logs relatifs à la gestion des cookies.

**Note** : Ce dossier est actuellement vide mais prêt à recevoir :
- Logs de cookies de session
- Tests de consentement cookies
- Logs d'authentification (cookies JWT)

---

## 🔄 Cycles (`cycles/`)

Tests de cycles d'exécution et d'itérations.

### Fichiers

- **test_cycle.txt**
  - Tests de cycles d'exécution
  - Vérification des boucles
  - Logs d'itérations

---

## 🎯 Utilisation

Ces fichiers sont générés automatiquement lors des tests ou manuellement pour documenter :
- Les résultats de tests
- Les logs d'erreurs
- Les comportements observés
- Les cycles de développement

---

## ⚠️ Important

Ces fichiers ne doivent **PAS** être déployés en production.

Ils sont dans `.gitignore` pour éviter d'être versionnés (normalement).

Si vous les voyez dans Git, c'est qu'ils ont été ajoutés avant la mise en place du `.gitignore`.

---

_Dossier créé le : 10 octobre 2025_  
_Projet : KAIRO Digital Website_

