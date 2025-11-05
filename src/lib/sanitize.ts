/**
 * 🛡️ SANITIZE HTML
 * ================
 *
 * Utilitaire pour sécuriser le contenu HTML
 * Protection contre les attaques XSS
 */

/**
 * Sanitize HTML simple pour prévenir XSS
 * Pour une sécurité renforcée, utiliser sanitize-html (librairie externe)
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Supprimer les scripts et événements inline
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();
}

/**
 * Échapper les caractères HTML pour affichage sûr
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Valider et nettoyer une URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Supprimer les protocoles dangereux
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return "";
    }
  }

  // Si pas de protocole, ajouter https://
  if (!lowerUrl.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Valider le contenu avant de le sauvegarder
 */
export function validateContent(content: unknown): boolean {
  if (content === null || content === undefined) {
    return false;
  }

  // Vérifier la taille maximale (10MB)
  const contentString = JSON.stringify(content);
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentString.length > maxSize) {
    return false;
  }

  // Vérifier la profondeur maximale (100 niveaux)
  const depth = getObjectDepth(content);
  if (depth > 100) {
    return false;
  }

  return true;
}

/**
 * Calculer la profondeur d'un objet
 */
function getObjectDepth(obj: unknown, currentDepth: number = 0): number {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return currentDepth;
  }

  if (Array.isArray(obj)) {
    return Math.max(...obj.map((item) => getObjectDepth(item, currentDepth + 1)), currentDepth);
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return currentDepth;
  }

  return Math.max(...keys.map((key) => getObjectDepth((obj as Record<string, unknown>)[key], currentDepth + 1)), currentDepth);
}

