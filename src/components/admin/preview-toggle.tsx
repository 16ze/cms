"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PreviewToggleProps {
  onToggle: () => void;
  isVisible: boolean;
  hasChanges: boolean;
}

export function PreviewToggle({ onToggle, isVisible, hasChanges }: PreviewToggleProps) {
  return (
    <Button
      onClick={onToggle}
      variant={isVisible ? "default" : "outline"}
      size="sm"
      className="relative flex items-center space-x-2"
    >
      {isVisible ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
      <span>{isVisible ? "Masquer" : "Prévisualiser"}</span>
      
      {/* Indicateur de changements non sauvegardés */}
      {hasChanges && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
      )}
    </Button>
  );
}
