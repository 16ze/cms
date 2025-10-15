import { NextRequest, NextResponse } from 'next/server';
import { createOAuthService } from '@/lib/google-oauth-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Vérifier si l'utilisateur a refusé
    if (error) {
      console.error('Erreur OAuth:', error);
      return NextResponse.redirect(
        new URL('/admin/seo/settings?error=access_denied', request.url)
      );
    }

    // Vérifier qu'on a bien un code
    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/seo/settings?error=no_code', request.url)
      );
    }

    const oauthService = createOAuthService();

    if (!oauthService) {
      return NextResponse.redirect(
        new URL('/admin/seo/settings?error=config_missing', request.url)
      );
    }

    // Échanger le code contre des tokens
    const tokens = await oauthService.getTokensFromCode(code);

    // Sauvegarder les tokens
    await oauthService.saveTokens(tokens);

    console.log('✅ Authentification Google réussie');

    // Rediriger vers les paramètres avec succès
    return NextResponse.redirect(
      new URL('/admin/seo/settings?success=connected', request.url)
    );
  } catch (error) {
    console.error('Erreur lors du callback OAuth:', error);
    return NextResponse.redirect(
      new URL('/admin/seo/settings?error=callback_failed', request.url)
    );
  }
}
