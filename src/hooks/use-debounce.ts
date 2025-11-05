/**
 * 🎯 DEBOUNCE HOOK
 * ================
 *
 * Hook personnalisé pour debounce les valeurs
 * Utile pour la sauvegarde automatique et les recherches
 */

import { useEffect, useState } from "react";

/**
 * Hook pour debounce une valeur
 * @param value - La valeur à debounce
 * @param delay - Le délai en millisecondes (défaut: 500ms)
 * @returns La valeur debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour debounce une fonction callback
 * @param callback - La fonction à debounce
 * @param delay - Le délai en millisecondes (défaut: 500ms)
 * @returns La fonction debounced
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return debouncedCallback;
}

