"use client";

import { useState } from "react";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({
  label,
  value,
  onChange,
}: ColorPickerProps) {
  const presets = [
    { name: "Rose", color: "#ec4899" },
    { name: "Violet", color: "#8b5cf6" },
    { name: "Bleu", color: "#3b82f6" },
    { name: "Vert", color: "#10b981" },
    { name: "Orange", color: "#f97316" },
    { name: "Rouge", color: "#ef4444" },
    { name: "Noir", color: "#000000" },
    { name: "Gris", color: "#6b7280" },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
          placeholder="#ec4899"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onChange(preset.color)}
            className={`px-3 py-1 text-xs rounded-lg border transition-all ${
              value === preset.color
                ? "border-pink-600 bg-pink-50 text-pink-900"
                : "border-gray-200 hover:border-pink-400"
            }`}
            title={preset.name}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: preset.color }}
              ></div>
              {preset.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
