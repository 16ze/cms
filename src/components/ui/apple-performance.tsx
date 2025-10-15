"use client";

import { useEffect, useRef } from 'react';

// Hook pour les animations au scroll style Apple
export function useAppleScrollAnimation() {
 const ref = useRef<HTMLElement>(null);

 useEffect(() => {
 const element = ref.current;
 if (!element) return;

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) {
 element.classList.add('apple-fade-up');
 observer.unobserve(element);
 }
 },
 {
 threshold: 0.1,
 rootMargin: '0px 0px -50px 0px',
 }
 );

 observer.observe(element);

 return () => observer.disconnect();
 }, []);

 return ref;
}

// Composant pour le préchargement d'images style Apple
export function AppleImagePreloader({ images }: { images: string[] }) {
 useEffect(() => {
 const preloadImages = images.map((src) => {
 const img = new Image();
 img.src = src;
 return img;
 });

 return () => {
 preloadImages.forEach((img) => {
 img.src = '';
 });
 };
 }, [images]);

 return null;
}

// Hook pour le lazy loading style Apple
export function useAppleLazyLoading() {
 const ref = useRef<HTMLImageElement>(null);

 useEffect(() => {
 const img = ref.current;
 if (!img) return;

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting && img.dataset.src) {
 img.src = img.dataset.src;
 img.classList.add('loaded');
 observer.unobserve(img);
 }
 },
 {
 threshold: 0.1,
 rootMargin: '50px',
 }
 );

 observer.observe(img);

 return () => observer.disconnect();
 }, []);

 return ref;
}

// Composant pour les effets de parallax subtils Apple
export function AppleParallax({ 
 children, 
 speed = 0.5 
}: { 
 children: React.ReactNode; 
 speed?: number; 
}) {
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const element = ref.current;
 if (!element) return;

 const handleScroll = () => {
 const scrolled = window.pageYOffset;
 const rate = scrolled * -speed;
 element.style.transform = `translateY(${rate}px)`;
 };

 // Throttle pour les performances
 let ticking = false;
 const throttledHandleScroll = () => {
 if (!ticking) {
 requestAnimationFrame(() => {
 handleScroll();
 ticking = false;
 });
 ticking = true;
 }
 };

 window.addEventListener('scroll', throttledHandleScroll, { passive: true });

 return () => {
 window.removeEventListener('scroll', throttledHandleScroll);
 };
 }, [speed]);

 return (
 <div ref={ref} style={{ willChange: 'transform' }}>
 {children}
 </div>
 );
}

// Hook pour les micro-interactions Apple
export function useAppleMicroInteractions() {
 useEffect(() => {
 // Ajout des effets de hover sur tous les éléments interactifs
 const addHoverEffects = () => {
 const interactiveElements = document.querySelectorAll(
 '.apple-button, .apple-card, .apple-carousel-controls'
 );

 interactiveElements.forEach((element) => {
 const el = element as HTMLElement;
 
 el.addEventListener('mouseenter', () => {
 el.style.transform = 'scale(1.02)';
 });

 el.addEventListener('mouseleave', () => {
 el.style.transform = 'scale(1)';
 });

 el.addEventListener('mousedown', () => {
 el.style.transform = 'scale(0.98)';
 });

 el.addEventListener('mouseup', () => {
 el.style.transform = 'scale(1.02)';
 });
 });
 };

 // Délai pour s'assurer que les éléments sont montés
 setTimeout(addHoverEffects, 100);

 return () => {
 // Cleanup si nécessaire
 };
 }, []);
}

// Composant pour les skeleton loaders Apple
export function AppleSkeleton({ 
 className = "",
 width = "100%",
 height = "20px"
}: {
 className?: string;
 width?: string;
 height?: string;
}) {
 return (
 <div 
 className={`animate-pulse bg-gray-200 rounded ${className}`}
 style={{ 
 width, 
 height,
 background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
 backgroundSize: '200% 100%',
 animation: 'apple-skeleton-shimmer 1.5s ease-in-out infinite'
 }}
 />
 );
}

// Styles pour le skeleton loader
const skeletonStyles = `
@keyframes apple-skeleton-shimmer {
 0% {
 background-position: -200% 0;
 }
 100% {
 background-position: 200% 0;
 }
}
`;

// Injection des styles skeleton
if (typeof document !== 'undefined') {
 const styleSheet = document.createElement('style');
 styleSheet.textContent = skeletonStyles;
 document.head.appendChild(styleSheet);
}
