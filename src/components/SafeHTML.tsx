/**
 * SafeHTML.tsx
 * Composant React pour rendu HTML sécurisé (anti-XSS)
 * @version 2.0 - Version simplifiée
 */

"use client";

import DOMPurify from "dompurify";
import React from "react";

type SafeHTMLProps = {
  html: string;
  className?: string;
  allowedTags?: string[];
};

export const SafeHTML: React.FC<SafeHTMLProps> = ({
  html,
  className,
  allowedTags,
}) => {
  const cleanHTML = React.useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags || [
          "a",
          "b",
          "i",
          "strong",
          "em",
          "p",
          "ul",
          "ol",
          "li",
          "br",
          "span",
          "div",
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "style"],
      }),
    [html, allowedTags]
  );

  return (
    <div
      className={className || ""}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};
