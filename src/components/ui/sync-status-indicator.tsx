"use client";

import { useState, useEffect } from "react";
import {
 Wifi,
 WifiOff,
 RefreshCw,
 CheckCircle,
 AlertCircle,
 Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusIndicatorProps {
 isConnected: boolean;
 lastUpdate?: Date | null;
 isLoading?: boolean;
 error?: string | null;
 className?: string;
 showDetails?: boolean;
 onRefresh?: () => void;
}

type SyncStatus = "connected" | "disconnected" | "syncing" | "error" | "idle";

export function SyncStatusIndicator({
 isConnected,
 lastUpdate,
 isLoading = false,
 error = null,
 className,
 showDetails = true,
 onRefresh,
}: SyncStatusIndicatorProps) {
 const [status, setStatus] = useState<SyncStatus>("idle");
 const [timeAgo, setTimeAgo] = useState<string>("");

 // Déterminer le statut actuel
 useEffect(() => {
 if (error) {
 setStatus("error");
 } else if (isLoading) {
 setStatus("syncing");
 } else if (isConnected) {
 setStatus("connected");
 } else {
 setStatus("disconnected");
 }
 }, [isConnected, isLoading, error]);

 // Mettre à jour le temps écoulé
 useEffect(() => {
 if (!lastUpdate) return;

 const updateTimeAgo = () => {
 const now = new Date();
 const diff = now.getTime() - lastUpdate.getTime();
 const seconds = Math.floor(diff / 1000);
 const minutes = Math.floor(seconds / 60);
 const hours = Math.floor(minutes / 60);

 if (seconds < 60) {
 setTimeAgo(`il y a ${seconds}s`);
 } else if (minutes < 60) {
 setTimeAgo(`il y a ${minutes}m`);
 } else {
 setTimeAgo(`il y a ${hours}h`);
 }
 };

 updateTimeAgo();
 const interval = setInterval(updateTimeAgo, 1000);

 return () => clearInterval(interval);
 }, [lastUpdate]);

 // Configuration des styles par statut
 const statusConfig = {
 connected: {
 icon: CheckCircle,
 color: "text-green-500",
 bgColor: "bg-green-50",
 borderColor: "border-green-200",
 label: "Synchronisé",
 description: "Contenu à jour",
 },
 disconnected: {
 icon: WifiOff,
 color: "text-red-500",
 bgColor: "bg-red-50",
 borderColor: "border-red-200",
 label: "Déconnecté",
 description: "Synchronisation interrompue",
 },
 syncing: {
 icon: RefreshCw,
 color: "text-blue-500",
 bgColor: "bg-blue-50",
 borderColor: "border-blue-200",
 label: "Synchronisation",
 description: "Mise à jour en cours...",
 },
 error: {
 icon: AlertCircle,
 color: "text-orange-500",
 bgColor: "bg-orange-50",
 borderColor: "border-orange-200",
 label: "Erreur",
 description: error || "Erreur de synchronisation",
 },
 idle: {
 icon: Clock,
 color: "text-gray-500",
 bgColor: "bg-gray-50",
 borderColor: "border-gray-200",
 label: "En attente",
 description: "Initialisation...",
 },
 };

 const config = statusConfig[status];
 const Icon = config.icon;

 if (!showDetails) {
 // Version compacte - juste l'icône
 return (
 <div className={cn("flex items-center", className)}>
 <div
 className={cn(
 "flex items-center justify-center w-6 h-6 rounded-full border",
 config.bgColor,
 config.borderColor
 )}
 title={`${config.label}: ${config.description}`}
 >
 <Icon
 className={cn(
 "w-3 h-3",
 config.color,
 status === "syncing" && "animate-spin"
 )}
 />
 </div>
 </div>
 );
 }

 return (
 <div className={cn("flex items-center space-x-3", className)}>
 {/* Indicateur de statut */}
 <div
 className={cn(
 "flex items-center justify-center w-8 h-8 rounded-full border",
 config.bgColor,
 config.borderColor
 )}
 >
 <Icon
 className={cn(
 "w-4 h-4",
 config.color,
 status === "syncing" && "animate-spin"
 )}
 />
 </div>

 {/* Informations détaillées */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-2">
 <span className={cn("text-sm font-medium", config.color)}>
 {config.label}
 </span>
 {lastUpdate && timeAgo && (
 <span className="text-xs text-gray-500">{timeAgo}</span>
 )}
 </div>
 <p className="text-xs text-gray-600 truncate">
 {config.description}
 </p>
 </div>

 {/* Bouton de rafraîchissement */}
 {onRefresh && status !== "syncing" && (
 <button
 onClick={onRefresh}
 className={cn(
 "flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100:bg-gray-800 transition-colors",
 "text-gray-400 hover:text-gray-600:text-gray-300"
 )}
 title="Rafraîchir manuellement"
 >
 <RefreshCw className="w-3 h-3" />
 </button>
 )}
 </div>
 );
}

// Composant pour afficher les statistiques de cache
interface CacheStatsProps {
 stats?: {
 size: number;
 maxSize: number;
 ttl: number;
 calculatedSize: number;
 };
 className?: string;
}

export function CacheStats({ stats, className }: CacheStatsProps) {
 if (!stats) return null;

 const hitRate =
 stats.size > 0 ? Math.round((stats.size / stats.maxSize) * 100) : 0;

 return (
 <div className={cn("text-xs text-gray-500 space-y-1", className)}>
 <div className="flex justify-between">
 <span>Cache:</span>
 <span>
 {stats.size}/{stats.maxSize} entrées
 </span>
 </div>
 <div className="flex justify-between">
 <span>Taux d'utilisation:</span>
 <span>{hitRate}%</span>
 </div>
 <div className="flex justify-between">
 <span>TTL:</span>
 <span>{Math.round(stats.ttl / 1000)}s</span>
 </div>
 </div>
 );
}

// Hook pour utiliser l'indicateur de synchronisation
export function useSyncStatus(
 isConnected: boolean,
 lastUpdate?: Date | null,
 isLoading?: boolean,
 error?: string | null
) {
 const [showNotification, setShowNotification] = useState(false);
 const [previousStatus, setPreviousStatus] = useState<SyncStatus>("idle");

 useEffect(() => {
 let currentStatus: SyncStatus = "idle";

 if (error) {
 currentStatus = "error";
 } else if (isLoading) {
 currentStatus = "syncing";
 } else if (isConnected) {
 currentStatus = "connected";
 } else {
 currentStatus = "disconnected";
 }

 // Afficher une notification lors du changement de statut
 if (previousStatus !== currentStatus && previousStatus !== "idle") {
 setShowNotification(true);
 setTimeout(() => setShowNotification(false), 3000);
 }

 setPreviousStatus(currentStatus);
 }, [isConnected, isLoading, error, previousStatus]);

 return {
 showNotification,
 hideNotification: () => setShowNotification(false),
 };
}

