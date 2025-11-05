#!/bin/bash

# Script de redémarrage automatique pour CI/CD
# Usage: ./restart-nextjs.sh [--force]

set -e

FORCE=false
if [[ "$1" == "--force" ]]; then
  FORCE=true
fi

if [[ "$CI" == "true" ]]; then
  FORCE=true
fi

if [[ "$FORCE" == "false" ]]; then
  echo "🔄 Script de redémarrage Next.js"
  echo "================================"
  echo ""
  echo "⚠️  ATTENTION: Ce script va arrêter tous les processus Next.js"
  echo ""
  read -p "Continuer? (y/n) " -n 1 -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Annulé"
    exit 1
  fi
fi

echo ""
echo "1️⃣ Arrêt de tous les processus Next.js..."
pkill -f "next dev" || echo "   ℹ️  Aucun processus Next.js trouvé"

echo ""
echo "2️⃣ Attente de l'arrêt complet..."
sleep 2

echo ""
echo "3️⃣ Relancement de Next.js..."
if [[ "$CI" == "true" ]]; then
  echo "   ℹ️  Mode CI détecté, démarrage en arrière-plan..."
  npm run dev &
else
  npm run dev
fi

echo ""
echo "✅ Redémarrage terminé"
