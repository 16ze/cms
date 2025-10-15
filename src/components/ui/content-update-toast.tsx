"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, Eye, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentUpdateNotification } from "@/lib/websocket";

interface ContentUpdateToastProps {
 notification: ContentUpdateNotification | null;
 onDismiss: () => void;
 onRefresh?: () => void;
 onPreview?: () => void;
 autoHideDuration?: number;
}

export function ContentUpdateToast({
 notification,
 onDismiss,
 onRefresh,
 onPreview,
 autoHideDuration = 5000,
}: ContentUpdateToastProps) {
 const [isVisible, setIsVisible] = useState(false);
 const [isLeaving, setIsLeaving] = useState(false);

 useEffect(() => {
 if (notification) {
 setIsVisible(true);
 setIsLeaving(false);

 // Auto-hide après la durée spécifiée
 const timer = setTimeout(() => {
 handleDismiss();
 }, autoHideDuration);

 return () => clearTimeout(timer);
 }
 }, [notification, autoHideDuration]);

 const handleDismiss = () => {
 setIsLeaving(true);
 setTimeout(() => {
 setIsVisible(false);
 onDismiss();
 }, 200); // Durée de l'animation de sortie
 };

 const handleRefresh = () => {
 if (onRefresh) {
 onRefresh();
 }
 handleDismiss();
 };

 const handlePreview = () => {
 if (onPreview) {
 onPreview();
 }
 // Ne pas fermer automatiquement pour permettre la prévisualisation
 };

 if (!notification || !isVisible) {
 return null;
 }

 const isGlobalUpdate = notification.page === "*";
 const pageName = isGlobalUpdate ? "Site" : notification.page;
 const sectionName = notification.section;

 return (
 <div
 className={cn(
 "fixed top-4 right-4 z-50 max-w-md w-full",
 "transform transition-all duration-200 ease-in-out",
 isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
 )}
 >
 <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
 {/* Header */}
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center space-x-2">
 <div className="flex-shrink-0">
 <CheckCircle className="w-5 h-5 text-green-500" />
 </div>
 <div>
 <h4 className="text-sm font-medium text-gray-900">
 Contenu mis à jour
 </h4>
 <p className="text-xs text-gray-500">
 {new Date(notification.timestamp).toLocaleTimeString("fr-FR")}
 </p>
 </div>
 </div>
 <button
 onClick={handleDismiss}
 className="flex-shrink-0 text-gray-400 hover:text-gray-600:text-gray-300 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Content */}
 <div className="mb-4">
 <p className="text-sm text-gray-700">
 {isGlobalUpdate ? (
 "Le contenu global du site a été mis à jour"
 ) : sectionName ? (
 <>
 La section <span className="font-medium">{sectionName}</span> de
 la page <span className="font-medium">{pageName}</span> a été
 mise à jour
 </>
 ) : (
 <>
 La page <span className="font-medium">{pageName}</span> a été
 mise à jour
 </>
 )}
 </p>
 </div>

 {/* Actions */}
 <div className="flex items-center space-x-2">
 <button
 onClick={handleRefresh}
 className={cn(
 "flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded",
 "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
 )}
 >
 <RefreshCw className="w-3 h-3" />
 <span>Actualiser</span>
 </button>

 {onPreview && (
 <button
 onClick={handlePreview}
 className={cn(
 "flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded",
 "border border-gray-300 text-gray-700",
 "hover:bg-gray-50:bg-gray-800 transition-colors"
 )}
 >
 <Eye className="w-3 h-3" />
 <span>Prévisualiser</span>
 </button>
 )}

 <button
 onClick={handleDismiss}
 className={cn(
 "px-3 py-1.5 text-xs font-medium rounded",
 "text-gray-500 hover:text-gray-700:text-gray-300 transition-colors"
 )}
 >
 Ignorer
 </button>
 </div>

 {/* Progress bar pour l'auto-hide */}
 <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
 <div
 className="h-full bg-blue-500 transition-all duration-linear"
 style={{
 animation: `shrink ${autoHideDuration}ms linear forwards`,
 }}
 />
 </div>
 </div>

 <style jsx>{`
 @keyframes shrink {
 from {
 width: 100%;
 }
 to {
 width: 0%;
 }
 }
 `}</style>
 </div>
 );
}

// Hook pour gérer les notifications de mise à jour de contenu
export function useContentUpdateNotifications() {
 const [notification, setNotification] =
 useState<ContentUpdateNotification | null>(null);
 const [history, setHistory] = useState<ContentUpdateNotification[]>([]);

 const showNotification = (newNotification: ContentUpdateNotification) => {
 setNotification(newNotification);
 setHistory((prev) => [newNotification, ...prev.slice(0, 9)]); // Garder les 10 dernières
 };

 const dismissNotification = () => {
 setNotification(null);
 };

 const clearHistory = () => {
 setHistory([]);
 };

 return {
 notification,
 history,
 showNotification,
 dismissNotification,
 clearHistory,
 };
}



