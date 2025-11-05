/**
 * 📦 UI COMPONENTS INDEX
 * ======================
 *
 * Export centralisé de tous les composants UI
 * Tous les composants sont accessibles, typés et conformes au design system
 */

// Form Controls
export { Button, buttonVariants } from "./button";
export { Input } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";
export { RadioGroup, RadioGroupItem } from "./radio-group";
export { Switch } from "./switch";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
export { Checkbox } from "./checkbox";

// Layout Components
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Footer } from "./footer";

// Overlay Components
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

// Calendar & Date Pickers
export { Calendar } from "./calendar";
export { CalendarAlternate } from "./calendar-alternate";

// Feedback Components
export { Toaster } from "./sonner";
export { Progress } from "./progress";

// Utility Components
export { ScrollReveal } from "./scroll-reveal";
export { StickyCTA } from "./sticky-cta";
export { ScrollArea } from "./scroll-area";
export { Slider } from "./slider";

/**
 * Type exports pour TypeScript
 */
export type { ButtonProps } from "./button";
export type { InputProps } from "./input";
export type { TextareaProps } from "./textarea";
export type { LabelProps } from "./label";

/**
 * 🎨 Design System Guidelines
 * 
 * Tous les composants suivent ces principes :
 * - ✅ Accessibilité ARIA complète
 * - ✅ Navigation clavier supportée
 * - ✅ Contraste WCAG AA minimum
 * - ✅ Responsive mobile-first
 * - ✅ Typage TypeScript strict
 * - ✅ Styles avec Tailwind CSS
 * - ✅ Compatible avec Radix UI
 */

