"use client";

import { ScrollReveal } from "../ui/scroll-reveal";
import Image from "next/image";
import { useEffect, useRef } from "react";

const guarantees = [
 {
 icon: "🎯",
 title: "Garantie satisfaction",
 description: "Révisions illimitées jusqu'à votre satisfaction complète",
 },
 {
 icon: "⚡",
 title: "Délais respectés",
 description: "Livraison dans les temps ou remboursement de 10%",
 },
 {
 icon: "📱",
 title: "Support réactif",
 description: "Réponse garantie sous 24h ouvrées",
 },
];

export function Guarantees() {
 const sectionRef = useRef<HTMLElement>(null);
 const imageRef = useRef<HTMLDivElement>(null);

 // Effet parallaxe amélioré
 useEffect(() => {
 const handleScroll = () => {
 if (!sectionRef.current || !imageRef.current) return;

 const section = sectionRef.current;
 const rect = section.getBoundingClientRect();

 // Calculer le pourcentage de visibilité de la section dans la fenêtre
 const viewportHeight = window.innerHeight;
 const sectionTop = rect.top;
 const sectionHeight = rect.height;

 // Calculer la position relative de la section par rapport à la fenêtre
 // -1 quand la section est complètement au-dessus, 0 quand elle est centrée, 1 quand elle est complètement en-dessous
 const relativePosition =
 (sectionTop + sectionHeight / 2) / (viewportHeight / 2) - 1;

 // Appliquer un déplacement proportionnel à la position relative
 // Limiter le déplacement à un maximum (ici 50px)
 const maxShift = 50;
 const shift = relativePosition * maxShift;

 // Appliquer la transformation
 imageRef.current.style.transform = `translateY(${shift}px)`;
 };

 // Ajouter l'écouteur d'événement
 window.addEventListener("scroll", handleScroll);
 // Initialiser la position
 handleScroll();

 // Nettoyage
 return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 return (
 <section ref={sectionRef} className="py-20 relative overflow-hidden">
 {/* Image d'arrière-plan avec effet parallaxe */}
 <div className="absolute inset-0 w-full h-full">
 <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/70 z-10"></div>
 <div
 ref={imageRef}
 className="absolute inset-0 z-0 h-[120%] top-[-10%]"
 >
 <Image
 src="/images/kairo-hero-img.webp"
 alt="Fond parallaxe"
 fill
 priority
 className="object-cover object-center"
 sizes="100vw"
 quality={90}
 />
 </div>
 </div>

 <div className="container mx-auto px-4 relative z-20">
 <ScrollReveal animation="fade-up">
 <h2 className="text-3xl font-bold mb-12 text-center text-white">
 Travailler avec moi en toute sérénité
 </h2>
 </ScrollReveal>

 <ScrollReveal animation="fade-up" delay={1}>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
 {guarantees.map((guarantee, index) => (
 <div
 key={index}
 className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10"
 >
 <div className="flex items-start gap-4">
 <span className="text-3xl">{guarantee.icon}</span>
 <div>
 <h3 className="font-semibold mb-2 text-white">
 {guarantee.title}
 </h3>
 <p className="text-sm text-neutral-200">
 {guarantee.description}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </ScrollReveal>
 </div>
 </section>
 );
}
