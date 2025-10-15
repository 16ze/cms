import { NextRequest, NextResponse } from 'next/server';
import { createOAuthService } from '@/lib/google-oauth-service';

export async function GET(request: NextRequest) {
  try {
    const oauthService = createOAuthService();

    if (!oauthService) {
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'Configuration OAuth manquante'
      });
    }

    const isAuthenticated = await oauthService.isAuthenticated();

    return NextResponse.json({
      connected: isAuthenticated,
      configured: true,
      message: isAuthenticated 
        ? 'Connecté à Google Analytics' 
        : 'Non connecté'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { 
        connected: false,
        configured: false,
        error: 'Erreur lors de la vérification du statut' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const oauthService = createOAuthService();

    if (!oauthService) {
      return NextResponse.json(
        { error: 'Configuration OAuth manquante' },
        { status: 500 }
      );
    }

    await oauthService.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
