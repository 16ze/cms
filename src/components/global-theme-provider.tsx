"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

interface GlobalThemeProviderProps {
 children: React.ReactNode;
}

export default function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
 const [defaultTheme, setDefaultTheme] = useState<"light" | "dark" | "system">("system");

 useEffect(() => {
 // Récupérer les paramètres de thème depuis l'API
 const fetchThemeSettings = async () => {
 try {
 const response = await fetch("/api/settings");
 if (response.ok) {
 const data = await response.json();
 // Si le mode sombre est activé par défaut dans les paramètres
 if (data.systemSettings?.darkMode) {
 setDefaultTheme("dark");
 } else {
 setDefaultTheme("system");
 }
 }
 } catch (error) {
 console.error("Erreur lors de la récupération des paramètres de thème:", error);
 setDefaultTheme("system");
 }
 };

 fetchThemeSettings();
 }, []);

 return (
 <ThemeProvider
 attribute="class"
 defaultTheme={defaultTheme}
 enableSystem
 disableTransitionOnChange
 >
 {children}
 </ThemeProvider>
 );
}
