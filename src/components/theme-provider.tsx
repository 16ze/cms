"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
 const [mounted, setMounted] = React.useState(false);

 React.useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted) {
 return <>{children}</>;
 }

 return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
