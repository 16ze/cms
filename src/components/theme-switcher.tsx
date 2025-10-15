"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

interface Theme {
 name: string;
 displayName: string;
 isDefault: boolean;
 config: any;
}

interface ThemeSwitcherProps {
 themes?: Theme[];
 className?: string;
}

export default function ThemeSwitcher({ themes = [], className = "" }: ThemeSwitcherProps) {
 const [currentTheme, setCurrentTheme] = useState<string>('light');
 const [isOpen, setIsOpen] = useState(false);

 // Charger les thèmes depuis l'API si non fournis
 const [availableThemes, setAvailableThemes] = useState<Theme[]>(themes);

 useEffect(() => {
 if (themes.length === 0) {
 loadThemes();
 } else {
 setAvailableThemes(themes);
 }
 }, [themes]);

 const loadThemes = async () => {
 try {
 const response = await fetch('/api/public/content');
 if (response.ok) {
 const data = await response.json();
 if (data.themes) {
 setAvailableThemes(data.themes);
 }
 }
 } catch (error) {
 console.error('Erreur lors du chargement des thèmes:', error);
 }
 };

 // Appliquer un thème
 const applyTheme = (themeName: string) => {
 const theme = availableThemes.find(t => t.name === themeName);
 if (!theme) return;

 setCurrentTheme(themeName);
 setIsOpen(false);

 // Appliquer les styles CSS du thème
 const root = document.documentElement;
 const config = theme.config;

 if (themeName === 'auto') {
 // Mode automatique - détecter la préférence système
 const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 const activeConfig = prefersDark ? config.dark : config.light;
 applyThemeColors(activeConfig.colors);
 } else {
 // Mode manuel
 applyThemeColors(config.colors);
 }

 // Sauvegarder la préférence
 localStorage.setItem('kairo-theme', themeName);
 };

 const applyThemeColors = (colors: any) => {
 const root = document.documentElement;
 
 if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
 if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
 if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
 if (colors.background) root.style.setProperty('--color-background', colors.background);
 if (colors.surface) root.style.setProperty('--color-surface', colors.surface);
 if (colors.text) root.style.setProperty('--color-text', colors.text);
 if (colors.textSecondary) root.style.setProperty('--color-text-secondary', colors.textSecondary);
 if (colors.border) root.style.setProperty('--color-border', colors.border);
 };

 // Initialiser le thème au chargement
 useEffect(() => {
 const savedTheme = localStorage.getItem('kairo-theme');
 const defaultTheme = availableThemes.find(t => t.isDefault)?.name || 'light';
 const themeToApply = savedTheme || defaultTheme;
 
 applyTheme(themeToApply);
 }, [availableThemes]);

 // Écouter les changements de préférence système pour le mode auto
 useEffect(() => {
 const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
 
 const handleChange = () => {
 if (currentTheme === 'auto') {
 const theme = availableThemes.find(t => t.name === 'auto');
 if (theme) {
 const prefersDark = mediaQuery.matches;
 const activeConfig = prefersDark ? theme.config.dark : theme.config.light;
 applyThemeColors(activeConfig.colors);
 }
 }
 };

 mediaQuery.addEventListener('change', handleChange);
 return () => mediaQuery.removeEventListener('change', handleChange);
 }, [currentTheme, availableThemes]);

 if (availableThemes.length === 0) {
 return null;
 }

 return (
 <div className={`relative ${className}`}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
 aria-label="Changer de thème"
 >
 {currentTheme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
 {currentTheme === 'dark' && <Moon className="w-4 h-4 text-blue-500" />}
 {currentTheme === 'auto' && <Monitor className="w-4 h-4 text-gray-500" />}
 <span className="text-sm font-medium">
 {availableThemes.find(t => t.name === currentTheme)?.displayName || 'Thème'}
 </span>
 </button>

 {isOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
 <div className="py-1">
 {availableThemes.map((theme) => (
 <button
 key={theme.name}
 onClick={() => applyTheme(theme.name)}
 className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
 currentTheme === theme.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
 }`}
 >
 {theme.name === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
 {theme.name === 'dark' && <Moon className="w-4 h-4 text-blue-500" />}
 {theme.name === 'auto' && <Monitor className="w-4 h-4 text-gray-500" />}
 <span className="text-sm">{theme.displayName}</span>
 {theme.isDefault && (
 <span className="ml-auto text-xs text-gray-500">Par défaut</span>
 )}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Overlay pour fermer le menu */}
 {isOpen && (
 <div
 className="fixed inset-0 z-40"
 onClick={() => setIsOpen(false)}
 />
 )}
 </div>
 );
}
