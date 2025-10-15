"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff",
  "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
  "#008000", "#ffc0cb", "#a52a2a", "#808080", "#c0c0c0",
  "#ffd700", "#daa520", "#b8860b", "#006400", "#8b0000"
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      onChange(color);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-2 border-neutral-200 dark:border-neutral-700"
              style={{ backgroundColor: value }}
            >
              <Palette className="w-4 h-4 text-white drop-shadow-lg" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-64 p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Couleur personnalisée</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder="#000000"
                    className="flex-1"
                  />
                  <div
                    className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700"
                    style={{ backgroundColor: value }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Couleurs prédéfinies</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                        value === color
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-neutral-200 dark:border-neutral-700"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {value === color && (
                        <Check className="w-4 h-4 text-white mx-auto drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
