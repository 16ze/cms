import { NextRequest, NextResponse } from 'next/server';
import { createOAuthService } from '@/lib/google-oauth-service';

export async function GET(request: NextRequest) {
  try {
    const oauthService = createOAuthService();

    if (!oauthService) {
      return NextResponse.json(
        { 
          error: 'Configuration OAuth manquante',
          message: 'Veuillez configurer GOOGLE_OAUTH_CLIENT_ID et GOOGLE_OAUTH_CLIENT_SECRET dans les variables d\'environnement'
        },
        { status: 500 }
      );
    }

    // Générer l'URL d'autorisation
    const authUrl = oauthService.getAuthUrl();

    // Rediriger vers Google
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'autorisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'URL d\'autorisation' },
      { status: 500 }
    );
  }
}
