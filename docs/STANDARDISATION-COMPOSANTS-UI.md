# 🎨 Standardisation des Composants UI

## ✅ Index centralisé (`src/components/ui/index.ts`)

Tous les composants UI sont exportés depuis un seul point d'entrée pour faciliter :
- L'import cohérent dans toute l'application
- La maintenance et la documentation
- La découverte des composants disponibles

## 📋 Principes de Design System

### 1. Accessibilité (WCAG 2.1 AA)
- ✅ Attributs ARIA appropriés sur tous les composants
- ✅ Navigation clavier complète
- ✅ Contraste minimum de 4.5:1 pour le texte
- ✅ Zones de touch minimum 44x44px sur mobile
- ✅ Annonces pour les lecteurs d'écran

### 2. Typage TypeScript
- ✅ Tous les composants sont typés avec TypeScript
- ✅ Props exportées via `export type` pour réutilisation
- ✅ Support des props HTML natives via `React.HTMLAttributes`

### 3. Styles & Responsive
- ✅ Tailwind CSS pour tous les styles
- ✅ Design mobile-first
- ✅ Breakpoints : sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ Dark mode support (via theme provider)

### 4. Composants basés sur Radix UI
- ✅ Composants accessibles par défaut
- ✅ Gestion d'état intégrée
- ✅ Composants unstyled avec Tailwind pour personnalisation

## 🧩 Composants disponibles

### Form Controls
- `Button` - Boutons avec variants (default, destructive, outline, secondary, ghost, link)
- `Input` - Champs de saisie texte
- `Label` - Labels pour formulaires
- `Textarea` - Zones de texte multiligne
- `Select` - Sélecteurs déroulants
- `RadioGroup` - Groupes de boutons radio
- `Checkbox` - Cases à cocher
- `Switch` - Interrupteurs toggle

### Layout Components
- `Card` - Cartes avec header, content, footer
- `Tabs` - Onglets de navigation
- `Footer` - Pied de page

### Overlay Components
- `Dialog` - Modales
- `Popover` - Popovers contextuels
- `Tooltip` - Infobulles

### Calendar & Date Pickers
- `Calendar` - Calendrier de sélection de date
- `CalendarAlternate` - Variante de calendrier

### Feedback Components
- `Toaster` - Système de notifications toast (Sonner)
- `Progress` - Barres de progression

### Utility Components
- `ScrollReveal` - Animation au scroll
- `StickyCTA` - CTA sticky en bas de page
- `ScrollArea` - Zone de défilement personnalisée
- `Slider` - Sliders de valeur

## 📝 Guide d'utilisation

### Import standardisé
```tsx
import { Button, Input, Label, Card } from "@/components/ui";
```

### Exemple d'utilisation avec accessibilité
```tsx
import { Button, Input, Label } from "@/components/ui";

function LoginForm() {
  return (
    <form>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        aria-required="true"
        aria-describedby="email-error"
      />
      <span id="email-error" role="alert" className="sr-only">
        Message d'erreur
      </span>
      
      <Button type="submit" aria-label="Se connecter">
        Se connecter
      </Button>
    </form>
  );
}
```

## ✅ Checklist de conformité

Avant d'utiliser un composant UI, vérifier :

- [ ] Le composant est importé depuis `@/components/ui`
- [ ] Les attributs ARIA appropriés sont ajoutés
- [ ] Le composant est responsive (testé sur mobile)
- [ ] Le contraste des couleurs est suffisant
- [ ] La navigation clavier fonctionne
- [ ] Les erreurs sont annoncées aux lecteurs d'écran
- [ ] Le composant est typé avec TypeScript

## 🔄 Maintenance

### Ajouter un nouveau composant
1. Créer le composant dans `src/components/ui/`
2. S'assurer qu'il suit les principes du design system
3. L'exporter dans `src/components/ui/index.ts`
4. Documenter son utilisation dans ce fichier

### Modifier un composant existant
1. Maintenir la rétrocompatibilité
2. Mettre à jour les types TypeScript si nécessaire
3. Tester l'accessibilité après modification
4. Mettre à jour la documentation

## 🎯 Améliorations futures

- [ ] Ajouter Storybook pour documentation visuelle
- [ ] Créer des composants composés (ex: FormField avec Label + Input + Error)
- [ ] Ajouter des variants de taille cohérents
- [ ] Standardiser les animations et transitions
- [ ] Créer un système de tokens de couleur centralisé

