/**
 * 📊 PROMETHEUS METRICS ENDPOINT
 * ==============================
 *
 * Endpoint pour exposer les métriques Prometheus
 * Accessible sur /api/metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getMetrics } from "@/lib/monitoring/metrics";
import { applySecureHeaders } from "@/lib/secure-headers";

/**
 * GET /api/metrics
 * Exporter les métriques Prometheus
 */
export async function GET(request: NextRequest) {
  // Vérifier l'accès (devrait être protégé en production)
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.METRICS_AUTH_TOKEN;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return applySecureHeaders(
      NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    );
  }

  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4",
      },
    });
  } catch (error) {
    return applySecureHeaders(
      NextResponse.json(
        {
          error: "Failed to retrieve metrics",
        },
        { status: 500 }
      )
    );
  }
}
