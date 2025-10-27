# Diagnostic Test Éditeur

## Données actuelles en base
```json
{"title":"BIENVENUE"}
```

## Données attendues par SiteEditorSidebar
```javascript
{
  title: "...",
  subtitle: "...",
  primaryButton: { text: "...", url: "..." },
  secondaryButton: { text: "...", url: "..." }
}
```

## Problème possible
Les données en base sont incomplètes - seul `title` existe.

## Solution
1. Ajouter les champs manquants en base
2. Ou adapter SiteEditorSidebar pour gérer les données partielles

## Test
1. Ouvrir `/admin/site`
2. Regarder la console (F12)
3. Voir les logs d'initialisation
4. Modifier le titre
5. Cliquer sur Sauvegarder
6. Observer les logs API dans le terminal
