"use client";

import React from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { useColors } from "@/lib/hooks/useColors";

interface AppleCardProps {
 title: string;
 subtitle: string;
 description: string;
 primaryCta: string;
 secondaryCta: string;
 imagePlaceholder?: string;
 darkMode?: boolean;
 reverse?: boolean;
}

export function AppleCard({
 title,
 subtitle,
 description,
 primaryCta,
 secondaryCta,
 imagePlaceholder,
 darkMode = false,
 reverse = false,
}: AppleCardProps) {
 const colors = useColors();

 return (
 <div
 className="min-h-screen flex items-center justify-center px-4"
 style={{
 backgroundColor: darkMode ? colors.backgroundDark : colors.background,
 }}
 >
 <div className="max-w-7xl w-full">
 <div
 className={`grid lg:grid-cols-2 gap-16 items-center ${
 reverse ? "lg:grid-flow-col-dense" : ""
 }`}
 >
 {/* Contenu */}
 <div className={`space-y-8 ${reverse ? "lg:col-start-2" : ""}`}>
 <div className="space-y-6">
 <h1
 className="text-6xl lg:text-8xl font-bold leading-tight"
 style={{
 color: darkMode ? colors.titleH1Dark : colors.titleH1,
 fontWeight: 700,
 }}
 >
 {title}
 </h1>
 <h2
 className="text-2xl lg:text-3xl font-medium"
 style={{
 color: darkMode
 ? colors.textSecondaryDark
 : colors.textSecondary,
 }}
 >
 {subtitle}
 </h2>
 <p
 className="text-lg lg:text-xl leading-relaxed max-w-xl"
 style={{
 color: darkMode ? colors.textMutedDark : colors.textMuted,
 }}
 >
 {description}
 </p>
 </div>

 <div className="flex flex-col sm:flex-row gap-4 pt-4">
 <Button
 size="lg"
 className="text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
 style={{
 backgroundColor: colors.ctaButton,
 color: colors.ctaButtonText,
 boxShadow: "0 8px 32px rgba(6, 182, 212, 0.3)",
 }}
 >
 {primaryCta}
 </Button>
 <Button
 variant="outline"
 size="lg"
 className="text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
 style={{
 borderColor: darkMode
 ? colors.textSecondaryDark
 : colors.primary,
 color: darkMode ? colors.textSecondaryDark : colors.primary,
 backgroundColor: "transparent",
 }}
 >
 {secondaryCta}
 </Button>
 </div>
 </div>

 {/* Image/Visuel */}
 <div className={`${reverse ? "lg:col-start-1" : ""}`}>
 <div className="relative group">
 {/* Image principale */}
 <div
 className="aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-105"
 style={{
 backgroundColor: darkMode
 ? colors.surfaceDark
 : colors.surface,
 background: `linear-gradient(135deg, ${colors.primary}20, ${colors.accent}20)`,
 }}
 >
 <div className="w-full h-full flex items-center justify-center">
 {imagePlaceholder ? (
 <NextImage
 src={imagePlaceholder}
 alt={title}
 width={400}
 height={300}
 className="w-full h-full object-cover"
 />
 ) : (
 <div
 className="text-4xl lg:text-6xl font-bold opacity-30"
 style={{
 color: darkMode
 ? colors.textMutedDark
 : colors.textMuted,
 }}
 >
 {title}
 </div>
 )}
 </div>
 </div>

 {/* Effet de profondeur */}
 <div
 className="absolute -bottom-8 -right-8 w-full h-full rounded-3xl -z-10 transition-transform duration-700 group-hover:scale-105"
 style={{
 background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}15)`,
 filter: "blur(1px)",
 }}
 />

 {/* Effet de lueur */}
 <div
 className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-5"
 style={{
 background: `radial-gradient(circle at center, ${colors.primary}10, transparent 70%)`,
 filter: "blur(20px)",
 }}
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
