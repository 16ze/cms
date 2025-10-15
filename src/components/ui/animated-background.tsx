"use client";

import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
 className?: string;
}

export function AnimatedBackground({
 className = "",
}: AnimatedBackgroundProps) {
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 const ctx = canvas.getContext("2d");
 if (!ctx) return;

 // Configuration du canvas
 const resizeCanvas = () => {
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
 };

 resizeCanvas();
 window.addEventListener("resize", resizeCanvas);

 // Configuration des particules
 const particles: Array<{
 x: number;
 y: number;
 vx: number;
 vy: number;
 size: number;
 opacity: number;
 color: string;
 }> = [];

 const colors = ["#007aff", "#34c759", "#ff9500", "#ff3b30", "#5856d6"];

 // Créer les particules
 for (let i = 0; i < 50; i++) {
 particles.push({
 x: Math.random() * canvas.width,
 y: Math.random() * canvas.height,
 vx: (Math.random() - 0.5) * 0.5,
 vy: (Math.random() - 0.5) * 0.5,
 size: Math.random() * 3 + 1,
 opacity: Math.random() * 0.5 + 0.1,
 color: colors[Math.floor(Math.random() * colors.length)],
 });
 }

 // Animation des particules
 const animate = () => {
 ctx.clearRect(0, 0, canvas.width, canvas.height);

 // Dessiner les particules
 particles.forEach((particle, index) => {
 // Mettre à jour la position
 particle.x += particle.vx;
 particle.y += particle.vy;

 // Rebondir sur les bords
 if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
 if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

 // Garder les particules dans le canvas
 particle.x = Math.max(0, Math.min(canvas.width, particle.x));
 particle.y = Math.max(0, Math.min(canvas.height, particle.y));

 // Dessiner la particule
 ctx.beginPath();
 ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
 ctx.fillStyle =
 particle.color +
 Math.floor(particle.opacity * 255)
 .toString(16)
 .padStart(2, "0");
 ctx.fill();

 // Effet de traînée
 ctx.beginPath();
 ctx.moveTo(particle.x, particle.y);
 ctx.lineTo(
 particle.x - particle.vx * 10,
 particle.y - particle.vy * 10
 );
 ctx.strokeStyle =
 particle.color +
 Math.floor(particle.opacity * 0.3 * 255)
 .toString(16)
 .padStart(2, "0");
 ctx.lineWidth = particle.size * 0.5;
 ctx.stroke();
 });

 // Dessiner les connexions entre particules proches
 particles.forEach((particle1, i) => {
 particles.slice(i + 1).forEach((particle2) => {
 const dx = particle1.x - particle2.x;
 const dy = particle1.y - particle2.y;
 const distance = Math.sqrt(dx * dx + dy * dy);

 if (distance < 100) {
 ctx.beginPath();
 ctx.moveTo(particle1.x, particle1.y);
 ctx.lineTo(particle2.x, particle2.y);
 ctx.strokeStyle = `rgba(0, 122, 255, ${
 0.1 * (1 - distance / 100)
 })`;
 ctx.lineWidth = 1;
 ctx.stroke();
 }
 });
 });

 requestAnimationFrame(animate);
 };

 animate();

 return () => {
 window.removeEventListener("resize", resizeCanvas);
 };
 }, []);

 return (
 <canvas
 ref={canvasRef}
 className={`fixed inset-0 pointer-events-none z-0 ${className}`}
 style={{ background: "transparent" }}
 />
 );
}
