"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useColors } from "@/lib/hooks/useColors";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface AppleStyleServicesProps {
 content?: any;
}

export function AppleStyleServices({ content }: AppleStyleServicesProps) {
 const colors = useColors();

 const services = [
 {
 id: "site-vitrine",
 title: "Site Vitrine",
 subtitle: "Votre présence en ligne. Professionnelle et impactante.",
 description: "Sites web élégants qui convertissent vos visiteurs en clients.",
 ctaPrimary: "Découvrir",
 ctaSecondary: "Voir nos réalisations",
 backgroundLight: true,
 image: "/images/placeholder-site-vitrine.jpg"
 },
 {
 id: "ecommerce",
 title: "E-commerce",
 subtitle: "Vendez en ligne. Simplement et efficacement.",
 description: "Boutiques en ligne performantes avec paiement sécurisé intégré.",
 ctaPrimary: "En savoir plus",
 ctaSecondary: "Demander un devis",
 backgroundLight: false,
 image: "/images/placeholder-ecommerce.jpg"
 },
 {
 id: "app-web",
 title: "Application Web",
 subtitle: "Solutions sur mesure pour vos besoins spécifiques.",
 description: "Applications web personnalisées, performantes et scalables.",
 ctaPrimary: "Explorer",
 ctaSecondary: "Discuter du projet",
 backgroundLight: true,
 image: "/images/placeholder-app-web.jpg"
 },
 {
 id: "maintenance",
 title: "Maintenance & Support",
 subtitle: "Votre site entre de bonnes mains. 24h/24, 7j/7.",
 description: "Support technique réactif et maintenance préventive.",
 ctaPrimary: "Nos forfaits",
 ctaSecondary: "Support immédiat",
 backgroundLight: false,
 image: "/images/placeholder-maintenance.jpg"
 }
 ];

 return (
 <div className="min-h-screen">
 {/* Hero Principal */}
 <section 
 className="relative min-h-screen flex items-center justify-center text-center"
 style={{ backgroundColor: colors.heroBackground }}
 >
 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
 <div className="relative z-10 max-w-4xl mx-auto px-4">
 <ScrollReveal animation="fade-up">
 <h1 
 className="text-6xl md:text-8xl font-bold mb-6"
 style={{ color: colors.heroTitle }}
 >
 Nos Services
 </h1>
 <p 
 className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
 style={{ color: colors.heroSubtitle }}
 >
 Des solutions digitales qui transforment votre vision en réalité
 </p>
 <Button
 size="lg"
 className="text-lg px-8 py-4 rounded-full"
 style={{ 
 backgroundColor: colors.ctaButton,
 color: colors.ctaButtonText
 }}
 >
 Découvrir nos services
 </Button>
 </ScrollReveal>
 </div>
 
 {/* Image d'arrière-plan ou vidéo */}
 <div className="absolute inset-0 overflow-hidden">
 <div 
 className="w-full h-full bg-cover bg-center bg-no-repeat"
 style={{
 backgroundImage: "url('/images/hero-services-bg.jpg')",
 filter: "brightness(0.4)"
 }}
 />
 </div>
 </section>

 {/* Services Sections - Style Apple */}
 {services.map((service, index) => (
 <section 
 key={service.id}
 className="min-h-screen flex items-center"
 style={{ 
 backgroundColor: service.backgroundLight ? colors.background : colors.backgroundDark 
 }}
 >
 <div className="w-full max-w-7xl mx-auto px-4">
 <div className={`grid lg:grid-cols-2 gap-12 items-center ${
 index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
 }`}>
 
 {/* Contenu Texte */}
 <div className={`space-y-8 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
 <ScrollReveal animation="fade-up">
 <div className="space-y-6">
 <h2 
 className="text-5xl md:text-7xl font-bold"
 style={{ 
 color: service.backgroundLight ? colors.titleH1 : colors.titleH1Dark 
 }}
 >
 {service.title}
 </h2>
 <p 
 className="text-xl md:text-2xl font-medium"
 style={{ 
 color: service.backgroundLight ? colors.textSecondary : colors.textSecondaryDark 
 }}
 >
 {service.subtitle}
 </p>
 <p 
 className="text-lg leading-relaxed max-w-lg"
 style={{ 
 color: service.backgroundLight ? colors.textMuted : colors.textMutedDark 
 }}
 >
 {service.description}
 </p>
 </div>
 </ScrollReveal>

 <ScrollReveal animation="fade-up" delay={200}>
 <div className="flex flex-col sm:flex-row gap-4">
 <Button
 size="lg"
 className="text-lg px-8 py-4 rounded-full font-medium"
 style={{ 
 backgroundColor: colors.ctaButton,
 color: colors.ctaButtonText
 }}
 >
 {service.ctaPrimary}
 </Button>
 <Button
 variant="outline"
 size="lg"
 className="text-lg px-8 py-4 rounded-full font-medium"
 style={{ 
 borderColor: service.backgroundLight ? colors.primary : colors.textSecondaryDark,
 color: service.backgroundLight ? colors.primary : colors.textSecondaryDark
 }}
 >
 {service.ctaSecondary}
 </Button>
 </div>
 </ScrollReveal>
 </div>

 {/* Image/Visuel */}
 <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
 <ScrollReveal animation="fade-up" delay={300}>
 <div className="relative">
 <div 
 className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
 style={{
 backgroundColor: service.backgroundLight ? colors.surface : colors.surfaceDark
 }}
 >
 {/* Placeholder pour l'image */}
 <div className="w-full h-full flex items-center justify-center">
 <div 
 className="text-6xl font-bold opacity-20"
 style={{ 
 color: service.backgroundLight ? colors.textMuted : colors.textMutedDark 
 }}
 >
 {service.title}
 </div>
 </div>
 </div>
 
 {/* Effet de profondeur */}
 <div 
 className="absolute -bottom-6 -right-6 w-full h-full rounded-3xl -z-10"
 style={{ 
 backgroundColor: service.backgroundLight ? colors.primary + "20" : colors.accent + "20" 
 }}
 />
 </div>
 </ScrollReveal>
 </div>
 </div>
 </div>
 </section>
 ))}

 {/* Section CTA Final */}
 <section 
 className="py-20"
 style={{ backgroundColor: colors.ctaSection }}
 >
 <div className="max-w-4xl mx-auto text-center px-4">
 <ScrollReveal animation="fade-up">
 <h2 
 className="text-4xl md:text-6xl font-bold mb-8"
 style={{ color: colors.ctaSectionTitle }}
 >
 Prêt à transformer votre idée ?
 </h2>
 <p 
 className="text-xl mb-12 max-w-2xl mx-auto"
 style={{ color: colors.textSecondary }}
 >
 Discutons de votre projet et créons ensemble la solution digitale qui vous ressemble.
 </p>
 <div className="flex flex-col sm:flex-row gap-6 justify-center">
 <Button
 size="lg"
 className="text-lg px-10 py-4 rounded-full font-medium"
 style={{ 
 backgroundColor: colors.ctaButton,
 color: colors.ctaButtonText
 }}
 >
 Démarrer un projet
 </Button>
 <Button
 variant="outline"
 size="lg"
 className="text-lg px-10 py-4 rounded-full font-medium"
 style={{ 
 borderColor: colors.primary,
 color: colors.primary
 }}
 >
 Portfolio
 </Button>
 </div>
 </ScrollReveal>
 </div>
 </section>
 </div>
 );
}
