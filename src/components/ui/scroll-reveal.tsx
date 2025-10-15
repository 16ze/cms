"use client";

import React, { useEffect, useRef } from "react";
import { isElementInViewport } from "@/lib/utils";

interface ScrollRevealProps {
 children: React.ReactNode;
 className?: string;
 threshold?: number;
 delay?: 1 | 2 | 3 | 4;
 animation?:
 | "fade-up"
 | "fade-down"
 | "fade-left"
 | "fade-right"
 | "zoom"
 | "text"
 | "pulse";
}

export function ScrollReveal({
 children,
 className = "",
 threshold = 0.1,
 delay,
 animation = "fade-up",
}: ScrollRevealProps) {
 const elementRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const element = elementRef.current;
 if (!element) return;

 // Ajouter les classes appropriées basées sur l'animation et le délai
 let animationClass = "reveal";
 if (animation === "text") {
 animationClass = "reveal-text";
 } else if (animation === "pulse") {
 animationClass = "pulse-on-reveal";
 } else {
 element.classList.add(`reveal-${animation}`);
 }

 element.classList.add(animationClass);

 if (delay) {
 element.classList.add(`reveal-delay-${delay}`);
 }

 // Vérifier si l'élément est déjà visible au chargement
 if (isElementInViewport(element, threshold)) {
 element.classList.add("active");
 }

 // Observer le défilement pour révéler les éléments
 const handleScroll = () => {
 if (
 isElementInViewport(element, threshold) &&
 !element.classList.contains("active")
 ) {
 element.classList.add("active");
 }
 };

 // Attacher l'écouteur d'événements de défilement
 window.addEventListener("scroll", handleScroll, { passive: true });

 // Nettoyage
 return () => {
 window.removeEventListener("scroll", handleScroll);
 };
 }, [animation, delay, threshold]);

 return (
 <div ref={elementRef} className={className}>
 {children}
 </div>
 );
}

// Composant pour animer les éléments dans une grille ou liste avec délai progressif
export function ScrollRevealGroup({
 children,
 className = "",
 threshold = 0.1,
 animation = "fade-up",
 stagger = 0.1,
}: ScrollRevealProps & { stagger?: number }) {
 const groupRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const groupElement = groupRef.current;
 if (!groupElement) return;

 // Sélectionner tous les éléments enfants directs
 const childElements = Array.from(groupElement.children);

 // Ajouter les classes d'animation à chaque enfant
 childElements.forEach((child, index) => {
 const element = child as HTMLElement;
 let animationClass = "reveal";

 if (animation === "text") {
 animationClass = "reveal-text";
 } else if (animation === "pulse") {
 animationClass = "pulse-on-reveal";
 } else {
 element.classList.add(`reveal-${animation}`);
 }

 element.classList.add(animationClass);

 // Ajouter un délai progressif basé sur l'index
 element.style.transitionDelay = `${index * stagger}s`;

 // Vérifier si l'élément est déjà visible au chargement
 if (isElementInViewport(element, threshold)) {
 element.classList.add("active");
 }
 });

 // Observer le défilement pour révéler les éléments
 const handleScroll = () => {
 childElements.forEach((child) => {
 const element = child as HTMLElement;
 if (
 isElementInViewport(element, threshold) &&
 !element.classList.contains("active")
 ) {
 element.classList.add("active");
 }
 });
 };

 // Attacher l'écouteur d'événements de défilement
 window.addEventListener("scroll", handleScroll, { passive: true });

 // Nettoyage
 return () => {
 window.removeEventListener("scroll", handleScroll);
 };
 }, [animation, threshold, stagger]);

 return (
 <div ref={groupRef} className={className}>
 {children}
 </div>
 );
}
