#!/bin/bash

echo "🔄 Script de redémarrage Next.js"
echo "================================"
echo ""
echo "⚠️  ATTENTION: Ce script va arrêter tous les processus Next.js"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "1️⃣ Arrêt de tous les processus Next.js..."
    pkill -f "next dev" || echo "   ℹ️  Aucun processus Next.js trouvé"
    
    echo ""
    echo "2️⃣ Attente de l'arrêt complet..."
    sleep 2
    
    echo ""
    echo "3️⃣ Relancement de Next.js..."
    npm run dev
else
    echo ""
    echo "❌ Annulé"
    exit 1
fi

