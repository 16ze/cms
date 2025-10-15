import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  kpis: {
    totalRevenue: number;
    totalOpportunities: number;
    newContacts: number;
    activitiesCompleted: number;
    avgDealSize: number;
    pipelineValue: number;
    conversionRate: number;
  };
  charts: {
    revenueEvolution: { labels: string[]; values: number[] };
    pipelineStages: { labels: string[]; values: number[] };
    sourcesDistribution: { labels: string[]; values: number[] };
    userPerformance: {
      labels: string[];
      revenue: number[];
      opportunities: number[];
    };
    activitiesByType: { labels: string[]; values: number[] };
    contactsTrend: { labels: string[]; values: number[] };
  };
  tables: {
    topOpportunities: any[];
    recentActivities: any[];
  };
}

export async function generateCrmReportPDF(data: ReportData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Générer le HTML du rapport
    const html = generateReportHTML(data);

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Générer le PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

function generateReportHTML(data: ReportData): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #3B82F6;
          margin: 0;
          font-size: 28px;
        }
        
        .header .subtitle {
          color: #6B7280;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        
        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .kpi-card {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background: #F9FAFB;
        }
        
        .kpi-value {
          font-size: 24px;
          font-weight: bold;
          color: #3B82F6;
          margin: 10px 0 5px 0;
        }
        
        .kpi-label {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1F2937;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .chart-placeholder {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background: #F9FAFB;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .chart-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #374151;
        }
        
        .chart-data {
          font-size: 12px;
          color: #6B7280;
          margin-top: 10px;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .table th,
        .table td {
          border: 1px solid #E5E7EB;
          padding: 12px;
          text-align: left;
        }
        
        .table th {
          background: #F3F4F6;
          font-weight: bold;
          color: #374151;
        }
        
        .table tr:nth-child(even) {
          background: #F9FAFB;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        
        @media print {
          .page-break {
            page-break-before: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <p class="subtitle">Période: ${data.period} | Généré le ${new Date(
    data.generatedAt
  ).toLocaleDateString("fr-FR")}</p>
      </div>

      <!-- KPIs -->
      <div class="section">
        <h2 class="section-title">Indicateurs Clés de Performance</h2>
        <div class="kpis-grid">
          <div class="kpi-card">
            <div class="kpi-value">${formatCurrency(
              data.kpis.totalRevenue
            )}</div>
            <p class="kpi-label">Chiffre d'affaires</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatNumber(
              data.kpis.totalOpportunities
            )}</div>
            <p class="kpi-label">Opportunités</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatNumber(data.kpis.newContacts)}</div>
            <p class="kpi-label">Nouveaux contacts</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatNumber(
              data.kpis.activitiesCompleted
            )}</div>
            <p class="kpi-label">Activités terminées</p>
          </div>
        </div>
        
        <div class="kpis-grid">
          <div class="kpi-card">
            <div class="kpi-value">${formatCurrency(
              data.kpis.avgDealSize
            )}</div>
            <p class="kpi-label">Taille moyenne des deals</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatCurrency(
              data.kpis.pipelineValue
            )}</div>
            <p class="kpi-label">Valeur du pipeline</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${formatPercentage(
              data.kpis.conversionRate
            )}</div>
            <p class="kpi-label">Taux de conversion</p>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">-</div>
            <p class="kpi-label">Autres métriques</p>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="section">
        <h2 class="section-title">Analyses Graphiques</h2>
        <div class="charts-grid">
          <div class="chart-placeholder">
            <div class="chart-title">Évolution du Chiffre d'affaires</div>
            <div class="chart-data">
              Période: ${data.charts.revenueEvolution.labels.join(", ")}<br>
              Valeurs: ${data.charts.revenueEvolution.values
                .map((v) => formatCurrency(v))
                .join(", ")}
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-title">Pipeline par Étape</div>
            <div class="chart-data">
              Étapes: ${data.charts.pipelineStages.labels.join(", ")}<br>
              Valeurs: ${data.charts.pipelineStages.values
                .map((v) => formatCurrency(v))
                .join(", ")}
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-title">Sources des Contacts</div>
            <div class="chart-data">
              Sources: ${data.charts.sourcesDistribution.labels.join(", ")}<br>
              Quantités: ${data.charts.sourcesDistribution.values.join(", ")}
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-title">Performance par Utilisateur</div>
            <div class="chart-data">
              Utilisateurs: ${data.charts.userPerformance.labels.join(", ")}<br>
              Revenus: ${data.charts.userPerformance.revenue
                .map((v) => formatCurrency(v))
                .join(", ")}
            </div>
          </div>
        </div>
      </div>

      <!-- Tables de détail -->
      <div class="section page-break">
        <h2 class="section-title">Détails des Opportunités</h2>
        ${
          data.tables.topOpportunities.length > 0
            ? `
          <table class="table">
            <thead>
              <tr>
                <th>Opportunité</th>
                <th>Contact</th>
                <th>Valeur</th>
                <th>Étape</th>
                <th>Probabilité</th>
              </tr>
            </thead>
            <tbody>
              ${data.tables.topOpportunities
                .map(
                  (opp) => `
                <tr>
                  <td>${opp.title}</td>
                  <td>${opp.contact}</td>
                  <td>${formatCurrency(opp.value)}</td>
                  <td>${opp.stage}</td>
                  <td>${opp.probability}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>Aucune opportunité trouvée pour cette période.</p>"
        }
      </div>

      <div class="section">
        <h2 class="section-title">Activités Récentes</h2>
        ${
          data.tables.recentActivities.length > 0
            ? `
          <table class="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Sujet</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${data.tables.recentActivities
                .map(
                  (activity) => `
                <tr>
                  <td>${activity.type}</td>
                  <td>${activity.subject}</td>
                  <td>${activity.contact}</td>
                  <td>${new Date(activity.date).toLocaleDateString(
                    "fr-FR"
                  )}</td>
                  <td>${activity.status}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>Aucune activité trouvée pour cette période.</p>"
        }
      </div>

      <div class="footer">
        <p>Rapport généré automatiquement par KAIRO Digital CRM</p>
        <p>Pour toute question, contactez votre administrateur système</p>
      </div>
    </body>
    </html>
  `;
}

export async function generateCrmReportPDFResponse(
  data: ReportData,
  filename?: string
): Promise<NextResponse> {
  try {
    const pdfBuffer = await generateCrmReportPDF(data);

    const response = new NextResponse(pdfBuffer);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename || "rapport-crm.pdf"}"`
    );
    response.headers.set("Content-Length", pdfBuffer.length.toString());

    return response;
  } catch (error: any) {
    console.error("Erreur lors de la génération du PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF", details: error.message },
      { status: 500 }
    );
  }
}
