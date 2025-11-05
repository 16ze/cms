/**
 * ✅ VALIDATION CLIENT-SIDE
 * ========================
 *
 * Utilitaires de validation pour les formulaires côté client
 * - Validation email
 * - Validation mot de passe
 * - Validation générique
 */

/**
 * Validation email stricte
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "L'email est requis" };
  }

  // Regex stricte pour email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Format d'email invalide" };
  }

  // Longueur maximale
  if (email.length > 254) {
    return { valid: false, error: "L'email est trop long (maximum 254 caractères)" };
  }

  return { valid: true };
}

/**
 * Validation mot de passe stricte
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: "weak" | "medium" | "strong" } {
  if (!password || password.length === 0) {
    return { valid: false, error: "Le mot de passe est requis" };
  }

  // Longueur minimale
  if (password.length < 8) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 8 caractères" };
  }

  // Longueur maximale
  if (password.length > 128) {
    return { valid: false, error: "Le mot de passe est trop long (maximum 128 caractères)" };
  }

  // Vérifier la force du mot de passe
  let strength: "weak" | "medium" | "strong" = "weak";
  let score = 0;

  // Au moins une majuscule
  if (/[A-Z]/.test(password)) score++;
  // Au moins une minuscule
  if (/[a-z]/.test(password)) score++;
  // Au moins un chiffre
  if (/\d/.test(password)) score++;
  // Au moins un caractère spécial
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (password.length >= 12 && score >= 4) {
    strength = "strong";
  } else if (password.length >= 10 && score >= 3) {
    strength = "medium";
  }

  // En production, exiger au moins une majuscule, une minuscule et un chiffre
  if (process.env.NODE_ENV === "production") {
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins une majuscule" };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins une minuscule" };
    }
    if (!/\d/.test(password)) {
      return { valid: false, error: "Le mot de passe doit contenir au moins un chiffre" };
    }
  }

  return { valid: true, strength };
}

/**
 * Validation générique pour les champs requis
 */
export function validateRequired(value: string | null | undefined, fieldName: string = "Ce champ"): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} est requis` };
  }
  return { valid: true };
}

/**
 * Validation de longueur
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number,
  fieldName: string = "Ce champ"
): { valid: boolean; error?: string } {
  if (min !== undefined && value.length < min) {
    return { valid: false, error: `${fieldName} doit contenir au moins ${min} caractères` };
  }
  if (max !== undefined && value.length > max) {
    return { valid: false, error: `${fieldName} doit contenir au maximum ${max} caractères` };
  }
  return { valid: true };
}

/**
 * Validation URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: "L'URL est requise" };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "Format d'URL invalide" };
  }
}

/**
 * Validation téléphone français
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: "Le numéro de téléphone est requis" };
  }

  // Nettoyer le numéro (supprimer espaces, tirets, points)
  const cleanPhone = phone.replace(/[\s\-\.]/g, "");

  // Format français : 10 chiffres (sans indicatif) ou +33...
  const frenchPhoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;

  if (!frenchPhoneRegex.test(cleanPhone)) {
    return { valid: false, error: "Format de numéro de téléphone invalide" };
  }

  return { valid: true };
}

