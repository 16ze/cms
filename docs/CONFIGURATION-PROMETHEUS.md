# 📊 Configuration Prometheus pour Monitoring

Ce guide explique comment configurer Prometheus pour scraper les métriques depuis `/api/metrics` en production.

## 📋 Prérequis

- Serveur Prometheus installé (ou accès à un service Prometheus)
- Accès à l'endpoint `/api/metrics` de votre application
- Token d'authentification pour l'endpoint métriques (optionnel mais recommandé)

## 🚀 Configuration Prometheus

### 1. Installer Prometheus

#### Option A : Docker (recommandé)

```bash
# Créer un fichier prometheus.yml
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kairo-cms'
    metrics_path: '/api/metrics'
    scheme: 'https'
    static_configs:
      - targets: ['votre-domaine.com']
    bearer_token: 'votre-token-auth'
    scrape_interval: 30s
EOF

# Lancer Prometheus avec Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

#### Option B : Installation locale

```bash
# Télécharger Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Créer prometheus.yml (voir ci-dessus)
# Lancer Prometheus
./prometheus --config.file=prometheus.yml
```

### 2. Configurer prometheus.yml

Fichier complet `prometheus.yml` :

```yaml
global:
  scrape_interval: 15s      # Fréquence de scraping
  evaluation_interval: 15s # Fréquence d'évaluation des règles
  external_labels:
    cluster: 'production'
    environment: 'prod'

# Règles d'alerte (optionnel)
rule_files:
  # - "alerts.yml"

# Configuration du scraping
scrape_configs:
  # Job pour Kairo CMS
  - job_name: 'kairo-cms'
    metrics_path: '/api/metrics'
    scheme: 'https'  # ou 'http' en développement
    static_configs:
      - targets:
          - 'votre-domaine.com'
          # Ajouter d'autres instances si nécessaire
    bearer_token: '${METRICS_AUTH_TOKEN}'  # Token depuis variable d'env
    scrape_interval: 30s
    scrape_timeout: 10s
    
    # Labels additionnels
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - target_label: app
        replacement: 'kairo-cms'
      - target_label: environment
        replacement: 'production'
```

### 3. Configurer l'authentification

#### Option A : Bearer Token (recommandé)

1. Générer un token sécurisé :
```bash
openssl rand -hex 32
```

2. Configurer dans votre application :
```env
METRICS_AUTH_TOKEN=votre-token-securise
```

3. Configurer dans Prometheus :
```yaml
bearer_token: 'votre-token-securise'
```

#### Option B : Basic Auth

```yaml
basic_auth:
  username: 'prometheus'
  password: 'mot-de-passe-securise'
```

### 4. Vérifier la configuration

1. Vérifier que Prometheus peut accéder aux métriques :
```bash
curl -H "Authorization: Bearer votre-token" \
  https://votre-domaine.com/api/metrics
```

2. Vérifier dans Prometheus UI (http://localhost:9090) :
   - Allez sur "Status" > "Targets"
   - Vérifiez que le job `kairo-cms` est `UP`

## 📈 Métriques disponibles

Les métriques suivantes sont exposées par `/api/metrics` :

### HTTP Requests

```
# Nombre total de requêtes HTTP
http_requests_total{method="GET",route="/api/admin/clients",status="200",tenant_id="tenant-1"}

# Durée des requêtes HTTP (secondes)
http_request_duration_seconds{method="GET",route="/api/admin/clients",status="200",tenant_id="tenant-1"}
```

### Database Queries

```
# Nombre total de requêtes Prisma
db_queries_total{model="Client",action="findMany",tenant_id="tenant-1"}

# Durée des requêtes Prisma par tenant
tenant_db_query_duration_seconds{model="Client",action="findMany",tenant_id="tenant-1"}
```

### API Errors

```
# Nombre d'erreurs API
api_errors_total{route="/api/admin/clients",error_type="ValidationError",tenant_id="tenant-1"}
```

## 📊 Requêtes PromQL utiles

### Requêtes HTTP les plus lentes

```promql
topk(10, rate(http_request_duration_seconds_sum[5m]))
```

### Taux d'erreur par route

```promql
sum(rate(api_errors_total[5m])) by (route) / sum(rate(http_requests_total[5m])) by (route) * 100
```

### Requêtes Prisma les plus lentes

```promql
topk(10, rate(tenant_db_query_duration_seconds_sum[5m]))
```

### Requêtes par tenant

```promql
sum(rate(http_requests_total[5m])) by (tenant_id)
```

### Queries lentes (> 200ms)

```promql
sum(rate(tenant_db_query_duration_seconds_bucket{le="0.2"}[5m])) by (model, action)
```

## 🚨 Configuration d'alertes (optionnel)

Créer `alerts.yml` :

```yaml
groups:
  - name: kairo_cms_alerts
    interval: 30s
    rules:
      # Alerte si taux d'erreur > 5%
      - alert: HighErrorRate
        expr: |
          sum(rate(api_errors_total[5m])) by (route) / 
          sum(rate(http_requests_total[5m])) by (route) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Taux d'erreur élevé sur {{ $labels.route }}"
          description: "Le taux d'erreur est de {{ $value | humanizePercentage }}"

      # Alerte si requêtes lentes (> 1s)
      - alert: SlowQueries
        expr: |
          histogram_quantile(0.95, rate(tenant_db_query_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Requêtes Prisma lentes détectées"
          description: "Le percentile 95 des requêtes est de {{ $value }}s"

      # Alerte si rate limit atteint fréquemment
      - alert: RateLimitFrequent
        expr: |
          sum(rate(http_requests_total{status="429"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Rate limiting fréquent"
          description: "{{ $value }} requêtes 429 par seconde"
```

## 🔧 Configuration Grafana (optionnel)

### 1. Installer Grafana

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

### 2. Ajouter Prometheus comme source de données

1. Aller sur http://localhost:3000
2. Login : admin/admin (changer le mot de passe)
3. Configuration > Data Sources > Add data source
4. Sélectionner Prometheus
5. URL : `http://prometheus:9090` (ou votre URL Prometheus)
6. Sauvegarder & Test

### 3. Dashboard recommandé

Créer un dashboard avec les panels suivants :

- **Requêtes HTTP totales** : `sum(rate(http_requests_total[5m]))`
- **Latence moyenne** : `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])`
- **Requêtes par tenant** : `sum(rate(http_requests_total[5m])) by (tenant_id)`
- **Requêtes Prisma lentes** : `histogram_quantile(0.95, rate(tenant_db_query_duration_seconds_bucket[5m]))`
- **Taux d'erreur** : `sum(rate(api_errors_total[5m])) / sum(rate(http_requests_total[5m]))`

## 🧪 Tester la configuration

### Test local

```bash
# Activer les métriques
export ENABLE_METRICS=true
export METRICS_AUTH_TOKEN=test-token

# Lancer l'application
npm run dev

# Tester l'endpoint
curl -H "Authorization: Bearer test-token" \
  http://localhost:3000/api/metrics
```

### Test Prometheus

1. Vérifier que Prometheus peut scraper :
   - Aller sur http://localhost:9090
   - Status > Targets
   - Vérifier que `kairo-cms` est `UP`

2. Vérifier les métriques :
   - Graphique > Entrer `http_requests_total`
   - Vérifier que les métriques apparaissent

## ⚠️ Troubleshooting

### Métriques non disponibles

1. Vérifier que `ENABLE_METRICS=true` est configuré
2. Vérifier les logs pour les erreurs :
   ```bash
   # Rechercher les erreurs de métriques
   grep -i "metrics" logs/app.log
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

1. Vérifier que les métriques sont générées :
   ```bash
   # Faire quelques requêtes API
   curl https://votre-domaine.com/api/admin/clients
   
   # Vérifier les métriques
   curl -H "Authorization: Bearer token" \
     https://votre-domaine.com/api/metrics | grep http_requests_total
   ```

## 📚 Ressources

- [Documentation Prometheus](https://prometheus.io/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [Code source metrics.ts](../../src/lib/monitoring/metrics.ts)

