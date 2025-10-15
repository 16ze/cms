"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Composant qui scroll automatiquement en haut de la page
 * à chaque changement de route
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll smooth vers le haut
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}
