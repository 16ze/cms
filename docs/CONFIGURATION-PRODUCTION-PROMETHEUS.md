# 📊 Configuration Production - Prometheus

Ce guide explique comment configurer Prometheus pour scraper les métriques depuis `/api/metrics` en production.

## 📋 Prérequis

- Serveur Prometheus installé (ou accès à un service Prometheus)
- Accès à l'endpoint `/api/metrics` de votre application
- Token d'authentification pour l'endpoint métriques

## 🔧 Configuration Vercel / Serverless

### Option 1 : Prometheus Cloud (Recommandé)

Prometheus Cloud est un service managé qui simplifie la configuration.

#### 1. Créer un compte Prometheus Cloud

1. Aller sur [https://prometheus.io/download/](https://prometheus.io/download/)
2. Ou utiliser un service managé comme :
   - [Grafana Cloud](https://grafana.com/products/cloud/prometheus/)
   - [Weave Cloud](https://cloud.weave.works/)

#### 2. Configurer le scraping

Dans votre configuration Prometheus Cloud :

```yaml
scrape_configs:
  - job_name: 'kairo-cms-production'
    metrics_path: '/api/metrics'
    scheme: 'https'
    static_configs:
      - targets: ['votre-domaine.com']
    bearer_token: '${METRICS_AUTH_TOKEN}'
    scrape_interval: 30s
    scrape_timeout: 10s
```

### Option 2 : Prometheus Self-Hosted

Si vous avez un serveur dédié :

#### 1. Installer Prometheus

```bash
# Ubuntu/Debian
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Créer prometheus.yml
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kairo-cms-production'
    metrics_path: '/api/metrics'
    scheme: 'https'
    static_configs:
      - targets: ['votre-domaine.com']
    bearer_token: '${METRICS_AUTH_TOKEN}'
    scrape_interval: 30s
EOF

# Lancer Prometheus
./prometheus --config.file=prometheus.yml
```

#### 2. Configurer avec systemd

```bash
# Créer /etc/systemd/system/prometheus.service
sudo tee /etc/systemd/system/prometheus.service <<EOF
[Unit]
Description=Prometheus
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/usr/local/bin/prometheus --config.file=/etc/prometheus/prometheus.yml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable prometheus
sudo systemctl start prometheus
```

## 🔒 Sécurité

### Générer un token sécurisé

```bash
openssl rand -hex 32
```

### Configurer dans l'application

**Vercel :**
```bash
vercel env add METRICS_AUTH_TOKEN production
vercel env add ENABLE_METRICS production
```

**Heroku :**
```bash
heroku config:set METRICS_AUTH_TOKEN=your-token-here
heroku config:set ENABLE_METRICS=true
```

### Protection de l'endpoint

L'endpoint `/api/metrics` vérifie automatiquement :
- Présence du header `Authorization: Bearer <token>`
- Correspondance avec `METRICS_AUTH_TOKEN`

## 📊 Configuration Grafana

### 1. Installer Grafana

```bash
# Docker
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Ou installation système
# Voir: https://grafana.com/docs/grafana/latest/setup-grafana/installation/
```

### 2. Ajouter Prometheus comme source de données

1. Aller sur http://localhost:3000 (ou votre URL Grafana)
2. Login : admin/admin (changer le mot de passe)
3. Configuration > Data Sources > Add data source
4. Sélectionner Prometheus
5. URL : `http://prometheus:9090` (ou votre URL Prometheus)
6. Sauvegarder & Test

### 3. Importer le dashboard

1. Dashboards > Import
2. Upload `grafana/kairo-cms-dashboard.json`
3. Sélectionner Prometheus comme source de données
4. Importer

## 🔧 Configuration Kubernetes

### Prometheus Operator

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kairo-cms
spec:
  selector:
    matchLabels:
      app: kairo-cms
  endpoints:
  - port: http
    path: /api/metrics
    interval: 30s
    bearerTokenSecret:
      name: metrics-token
      key: token
```

## 📈 Monitoring & Alertes

### Requêtes PromQL utiles

```promql
# Requêtes HTTP totales par minute
sum(rate(http_requests_total[5m])) by (method, route)

# Latence p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taux d'erreur
sum(rate(api_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100

# Requêtes Prisma lentes (> 200ms)
sum(rate(tenant_db_query_duration_seconds_bucket{le="0.2"}[5m])) by (model)
```

### Alertes recommandées

```yaml
groups:
  - name: kairo_cms_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(api_errors_total[5m])) / 
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Taux d'erreur élevé"
          
      - alert: SlowQueries
        expr: |
          histogram_quantile(0.95, 
            rate(tenant_db_query_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Requêtes Prisma lentes détectées"
```

## ✅ Vérification

### Test de l'endpoint

```bash
curl -H "Authorization: Bearer $METRICS_AUTH_TOKEN" \
  https://votre-domaine.com/api/metrics
```

Devrait retourner les métriques au format Prometheus.

### Vérifier dans Prometheus

1. Aller sur http://prometheus:9090
2. Status > Targets
3. Vérifier que `kairo-cms-production` est `UP`

### Vérifier les métriques

Dans Prometheus UI :
1. Graphique > Entrer `http_requests_total`
2. Vérifier que les métriques apparaissent

## ⚠️ Troubleshooting

### Métriques non disponibles

1. Vérifier que `ENABLE_METRICS=true` est configuré
2. Vérifier les logs pour les erreurs :
   ```bash
   vercel logs | grep metrics
   ```

### Prometheus ne peut pas scraper

1. Vérifier la connectivité réseau :
   ```bash
   curl -H "Authorization: Bearer token" \
     https://votre-domaine.com/api/metrics
   ```

2. Vérifier les logs Prometheus :
   ```bash
   docker logs prometheus
   ```

3. Vérifier les erreurs dans Prometheus UI :
   - Status > Targets
   - Cliquer sur le job pour voir les erreurs

### Métriques manquantes

1. Faire quelques requêtes API pour générer des métriques
2. Vérifier que les métriques sont générées :
   ```bash
   curl -H "Authorization: Bearer token" \
     https://votre-domaine.com/api/metrics | grep http_requests_total
   ```

## 📚 Ressources

- [Documentation Prometheus](https://prometheus.io/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [Code source metrics.ts](../../src/lib/monitoring/metrics.ts)

