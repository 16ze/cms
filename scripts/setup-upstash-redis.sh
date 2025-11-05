#!/bin/bash

# 🔧 Script de Configuration Upstash Redis
# ==========================================
#
# Ce script aide à configurer Upstash Redis pour le rate limiting
#
# Usage:
#   ./scripts/setup-upstash-redis.sh

set -e

echo "🚀 Configuration Upstash Redis pour Rate Limiting"
echo "=================================================="
echo ""

# Vérifier si les variables d'environnement existent déjà
if [ -f ".env.local" ]; then
  if grep -q "UPSTASH_REDIS_REST_URL" .env.local; then
    echo "⚠️  Upstash Redis est déjà configuré dans .env.local"
    read -p "Voulez-vous le reconfigurer ? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 0
    fi
  fi
fi

echo "📋 Étapes:"
echo "1. Créer un compte sur https://upstash.com (gratuit jusqu'à 10K req/jour)"
echo "2. Créer une base de données Redis"
echo "3. Récupérer l'URL et le token"
echo ""

read -p "Appuyez sur Entrée pour continuer..." 

echo ""
echo "🔗 Ouvrez https://console.upstash.com/redis dans votre navigateur"
echo ""
read -p "UPSTASH_REDIS_REST_URL: " UPSTASH_URL
read -p "UPSTASH_REDIS_REST_TOKEN: " UPSTASH_TOKEN

if [ -z "$UPSTASH_URL" ] || [ -z "$UPSTASH_TOKEN" ]; then
  echo "❌ URL et Token sont requis"
  exit 1
fi

# Ajouter au fichier .env.local
if [ ! -f ".env.local" ]; then
  touch .env.local
fi

# Supprimer les anciennes valeurs si elles existent
sed -i.bak '/UPSTASH_REDIS_REST_URL/d' .env.local 2>/dev/null || true
sed -i.bak '/UPSTASH_REDIS_REST_TOKEN/d' .env.local 2>/dev/null || true
rm -f .env.local.bak

# Ajouter les nouvelles valeurs
echo "" >> .env.local
echo "# Upstash Redis pour Rate Limiting" >> .env.local
echo "UPSTASH_REDIS_REST_URL=$UPSTASH_URL" >> .env.local
echo "UPSTASH_REDIS_REST_TOKEN=$UPSTASH_TOKEN" >> .env.local

echo ""
echo "✅ Configuration sauvegardée dans .env.local"
echo ""
echo "🧪 Test de connexion..."

# Tester la connexion
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$UPSTASH_URL/ping" \
  -H "Authorization: Bearer $UPSTASH_TOKEN" || echo "ERROR\n000")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$BODY" = "PONG" ]; then
  echo "✅ Connexion réussie !"
else
  echo "⚠️  Connexion échouée. Vérifiez vos credentials."
  echo "   Réponse: $BODY (HTTP $HTTP_CODE)"
fi

echo ""
echo "📚 Documentation: docs/CONFIGURATION-UPSTASH-REDIS.md"
echo ""
echo "⚠️  Ne commitez jamais .env.local dans Git !"

