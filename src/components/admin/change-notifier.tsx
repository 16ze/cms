"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface ChangeNotifierProps {
  onRefreshRequested: () => void;
  className?: string;
}

export default function ChangeNotifier({
  onRefreshRequested,
  className = "",
}: ChangeNotifierProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // SUPPRIMÉ : Refresh automatique - Contrôle manuel uniquement
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setLastCheck(new Date());
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

    const handleManualRefresh = () => {
    setLastCheck(new Date());
    onRefreshRequested();
    setShowNotification(true);
    
    // Masquer la notification après 3 secondes
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-gray-900">
              Gestion des Changements
            </h4>
            <p className="text-sm text-gray-600">
              Dernière synchronisation : {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Synchroniser maintenant
        </button>
      </div>

      {/* Notification de succès */}
      {showNotification && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Données mises à jour avec succès !
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Instructions :</p>
            <ul className="mt-1 space-y-1">
              <li>• Modifiez le contenu dans les onglets ci-dessous</li>
              <li>• Sauvegardez vos modifications</li>
              <li>• Cliquez sur "Synchroniser maintenant" pour voir les changements</li>
              <li>• Utilisez la prévisualisation pour vérifier le résultat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
