import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export type SidebarMode = "navigation" | "site-editor" | "default";

/**
 * Hook pour gérer le mode de la sidebar
 */
export function useSidebarMode() {
  const pathname = usePathname();
  const [mode, setMode] = useState<SidebarMode>("navigation");

  useEffect(() => {
    // Détecter automatiquement le mode selon la route
    if (pathname === "/admin/site") {
      setMode("site-editor");
    } else {
      setMode("navigation");
    }
  }, [pathname]);

  return {
    mode,
    setMode,
  };
}
