"use client";

import { useEffect, useState } from "react";
import { Wrench, Clock, Mail } from "lucide-react";

export default function MaintenancePage() {
 const [maintenanceMessage, setMaintenanceMessage] = useState("Site en maintenance. Nous serons de retour bientôt !");

 useEffect(() => {
 // Récupérer le message de maintenance depuis l'API
 const fetchMaintenanceMessage = async () => {
 try {
 const response = await fetch("/api/maintenance");
 if (response.ok) {
 const data = await response.json();
 if (data.maintenanceMessage) {
 setMaintenanceMessage(data.maintenanceMessage);
 }
 }
 } catch (error) {
 console.error("Erreur lors de la récupération du message de maintenance:", error);
 }
 };

 fetchMaintenanceMessage();
 }, []);

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
 <div className="max-w-md w-full">
 <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
 {/* Icône de maintenance */}
 <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
 <Wrench className="w-10 h-10 text-yellow-600" />
 </div>

 {/* Titre */}
 <h1 className="text-2xl font-bold text-gray-900 mb-4">
 Site en Maintenance
 </h1>

 {/* Message de maintenance */}
 <p className="text-gray-600 mb-6 leading-relaxed">
 {maintenanceMessage}
 </p>

 {/* Indicateur de temps */}
 <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
 <Clock className="w-4 h-4 mr-2" />
 <span>Nous travaillons pour améliorer votre expérience</span>
 </div>

 {/* Informations de contact */}
 <div className="bg-gray-50 rounded-lg p-4">
 <div className="flex items-center justify-center text-sm text-gray-600">
 <Mail className="w-4 h-4 mr-2" />
 <span>contact.kairodigital@gmail.com</span>
 </div>
 </div>

 {/* Animation de chargement */}
 <div className="mt-6">
 <div className="flex space-x-2 justify-center">
 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
 <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="text-center mt-6">
 <p className="text-xs text-gray-500">
 © 2024 KAIRO Digital. Tous droits réservés.
 </p>
 </div>
 </div>
 </div>
 );
}
