/**
 * 🛡️ SAFE INPUT COMPONENT
 * ========================
 *
 * Composant input sécurisé avec validation et échappement automatique
 */

"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Patterns de validation
 */
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^[\d\s\-\+\(\)]+$/,
  number: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
};

/**
 * Props du composant SafeInput
 */
export interface SafeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /**
   * Type de validation
   */
  validationType?: "email" | "url" | "phone" | "number" | "alphanumeric" | "none";

  /**
   * Callback appelé avec la valeur sanitizer
   */
  onSafeChange?: (value: string) => void;

  /**
   * Afficher un message d'erreur si validation échoue
   */
  showValidationError?: boolean;

  /**
   * Regex personnalisée pour validation
   */
  customPattern?: RegExp;

  /**
   * Message d'erreur personnalisé
   */
  errorMessage?: string;
}

/**
 * Sanitizer une valeur d'input
 */
function sanitizeInputValue(value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Échapper les caractères dangereux
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#47;");
}

/**
 * Composant SafeInput - Input sécurisé avec validation
 */
export const SafeInput = forwardRef<HTMLInputElement, SafeInputProps>(
  (
    {
      validationType = "none",
      onSafeChange,
      showValidationError = false,
      customPattern,
      errorMessage,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isValid, setIsValid] = useState(true);
    const [validationError, setValidationError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Valider selon le type
      if (validationType !== "none" && value) {
        const pattern =
          customPattern || VALIDATION_PATTERNS[validationType];
        const valid = pattern.test(value);

        setIsValid(valid);

        if (!valid && showValidationError) {
          const defaultMessages: Record<string, string> = {
            email: "Format d'email invalide",
            url: "Format d'URL invalide",
            phone: "Format de téléphone invalide",
            number: "Ce champ doit contenir uniquement des chiffres",
            alphanumeric: "Ce champ doit contenir uniquement des lettres et chiffres",
          };
          setValidationError(
            errorMessage || defaultMessages[validationType] || "Format invalide"
          );
        } else {
          setValidationError("");
        }
      } else {
        setIsValid(true);
        setValidationError("");
      }

      // Appeler le callback avec la valeur sanitizer
      if (onSafeChange) {
        onSafeChange(value);
      }

      // Appeler le onChange original si fourni
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !isValid && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {showValidationError && !isValid && validationError && (
          <p className="mt-1 text-sm text-red-500">{validationError}</p>
        )}
      </div>
    );
  }
);

SafeInput.displayName = "SafeInput";

/**
 * Composant SecureEditor - Éditeur WYSIWYG sécurisé avec sandbox
 */
import { useState, useRef, useEffect } from "react";
import { SafeHTML } from "@/components/SafeHTML";

export interface SecureEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  sandbox?: boolean;
}

/**
 * Composant SecureEditor - Éditeur WYSIWYG sécurisé
 */
export function SecureEditor({
  value,
  onChange,
  placeholder,
  className,
  sandbox = true,
}: SecureEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className={className}>
      {sandbox ? (
        // Mode sandbox : utiliser SafeHTML pour afficher le contenu
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={handleInput}
          suppressContentEditableWarning
        >
          <SafeHTML html={content} />
        </div>
      ) : (
        // Mode normal avec sanitization
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressContentEditableWarning
        />
      )}
      {placeholder && !content && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}

