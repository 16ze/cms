#!/bin/bash

# 📊 Script de Configuration Prometheus
# ======================================
#
# Ce script aide à configurer Prometheus pour scraper les métriques
#
# Usage:
#   ./scripts/setup-prometheus.sh

set -e

echo "📊 Configuration Prometheus pour Monitoring"
echo "==========================================="
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé"
  echo "   Installez Docker: https://docs.docker.com/get-docker/"
  exit 1
fi

echo "📋 Ce script va:"
echo "1. Créer un fichier prometheus.yml"
echo "2. Générer un token d'authentification pour /api/metrics"
echo "3. Créer un fichier docker-compose.yml (optionnel)"
echo ""

read -p "Appuyez sur Entrée pour continuer..."

# Générer un token sécurisé
METRICS_TOKEN=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || echo "change-me-in-production")

echo ""
echo "🔑 Token généré pour /api/metrics: $METRICS_TOKEN"
echo ""

# Demander l'URL de l'application
read -p "URL de votre application (ex: https://votre-domaine.com): " APP_URL

if [ -z "$APP_URL" ]; then
  APP_URL="http://localhost:3000"
  echo "⚠️  Utilisation de l'URL par défaut: $APP_URL"
fi

# Créer prometheus.yml
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    environment: 'prod'

scrape_configs:
  - job_name: 'kairo-cms'
    metrics_path: '/api/metrics'
    scheme: 'https'
    static_configs:
      - targets: ['${APP_URL#https://}']
    bearer_token: '${METRICS_TOKEN}'
    scrape_interval: 30s
    scrape_timeout: 10s
    
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - target_label: app
        replacement: 'kairo-cms'
      - target_label: environment
        replacement: 'production'
EOF

echo "✅ Fichier prometheus.yml créé"

# Créer docker-compose.yml
cat > docker-compose.prometheus.yml <<EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

volumes:
  prometheus_data:
EOF

echo "✅ Fichier docker-compose.prometheus.yml créé"

# Ajouter le token au .env.local
if [ ! -f ".env.local" ]; then
  touch .env.local
fi

# Supprimer l'ancienne valeur si elle existe
sed -i.bak '/METRICS_AUTH_TOKEN/d' .env.local 2>/dev/null || true
rm -f .env.local.bak

# Ajouter la nouvelle valeur
echo "" >> .env.local
echo "# Prometheus Metrics Token" >> .env.local
echo "METRICS_AUTH_TOKEN=$METRICS_TOKEN" >> .env.local
echo "ENABLE_METRICS=true" >> .env.local

echo ""
echo "✅ Configuration sauvegardée dans .env.local"
echo ""
echo "🚀 Pour démarrer Prometheus avec Docker Compose:"
echo "   docker-compose -f docker-compose.prometheus.yml up -d"
echo ""
echo "📊 Accéder à Prometheus UI:"
echo "   http://localhost:9090"
echo ""
echo "🧪 Tester l'endpoint /api/metrics:"
echo "   curl -H 'Authorization: Bearer $METRICS_TOKEN' $APP_URL/api/metrics"
echo ""
echo "📚 Documentation: docs/CONFIGURATION-PROMETHEUS.md"
echo ""
echo "⚠️  N'oubliez pas de configurer ENABLE_METRICS=true en production !"

