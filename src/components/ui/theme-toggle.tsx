"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
 const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = React.useState(false);

 React.useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted) {
 return null;
 }

 return (
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setTheme(theme === "light" ? "dark" : "light")}
 className="h-9 w-9 rounded-md hover:bg-neutral-100:bg-neutral-800 transition-colors"
 aria-label={`Basculer en mode ${theme === "light" ? "sombre" : "clair"}`}
 >
 <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
 <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all" />
 <span className="sr-only">Basculer le thème</span>
 </Button>
 );
}
