"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieConsent() {
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 // Vérifier si l'utilisateur a déjà donné son consentement
 const consent = localStorage.getItem("cookie-consent");
 if (consent !== "accepted" && consent !== "declined") {
 setIsVisible(true);
 }
 }, []);

 const acceptCookies = () => {
 localStorage.setItem("cookie-consent", "accepted");
 setIsVisible(false);

 // Activer Google Analytics
 if (typeof window.gtag !== "undefined") {
 window.gtag("consent", "update", {
 ad_storage: "granted",
 analytics_storage: "granted",
 });
 }
 };

 const declineCookies = () => {
 localStorage.setItem("cookie-consent", "declined");
 setIsVisible(false);

 // Désactiver Google Analytics
 if (typeof window.gtag !== "undefined") {
 window.gtag("consent", "update", {
 ad_storage: "denied",
 analytics_storage: "denied",
 });
 }
 };

 if (!isVisible) return null;

 return (
 <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-lg border-t border-neutral-200">
 <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="flex-1">
 <h3 className="text-lg font-semibold mb-1">
 Nous respectons votre vie privée
 </h3>
 <p className="text-sm text-neutral-600">
 Ce site utilise des cookies pour améliorer votre expérience et
 analyser le trafic. Vous pouvez accepter tous les cookies ou les
 refuser et continuer votre navigation.
 </p>
 </div>
 <div className="flex flex-col sm:flex-row gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={declineCookies}
 className="border-neutral-300"
 >
 Refuser
 </Button>
 <Button
 variant="default"
 size="sm"
 onClick={acceptCookies}
 className="bg-blue-800 hover:bg-blue-700"
 >
 Accepter
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="absolute right-2 top-2 sm:hidden"
 onClick={declineCookies}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 );
}
