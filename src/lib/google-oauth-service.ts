import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

// Charger explicitement .env.local en priorité
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

// Configuration OAuth2
const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleOAuthService {
  private oauth2Client: any;
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Génère l'URL d'autorisation Google
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // Force le consentement pour obtenir le refresh token
    });
  }

  /**
   * Échange le code d'autorisation contre des tokens
   */
  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error("Erreur lors de l'échange du code:", error);
      throw new Error("Impossible d'obtenir les tokens");
    }
  }

  /**
   * Sauvegarde les tokens dans la base de données
   */
  async saveTokens(tokens: any) {
    try {
      const expiryDate = new Date(tokens.expiry_date);

      // Supprimer l'ancien token s'il existe
      await prisma.googleOAuthToken.deleteMany({});

      // Créer le nouveau token
      await prisma.googleOAuthToken.create({
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          scope: tokens.scope,
          tokenType: tokens.token_type,
          expiryDate: expiryDate,
        },
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des tokens:", error);
      throw new Error("Impossible de sauvegarder les tokens");
    }
  }

  /**
   * Récupère les tokens depuis la base de données
   */
  async getStoredTokens() {
    try {
      const tokenData = await prisma.googleOAuthToken.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!tokenData) {
        return null;
      }

      return {
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        scope: tokenData.scope,
        token_type: tokenData.tokenType,
        expiry_date: tokenData.expiryDate.getTime(),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens:", error);
      return null;
    }
  }

  /**
   * Vérifie si les tokens sont valides et les rafraîchit si nécessaire
   */
  async getValidTokens() {
    try {
      const tokens = await this.getStoredTokens();

      if (!tokens) {
        return null;
      }

      // Configurer les credentials
      this.oauth2Client.setCredentials(tokens);

      // Vérifier si le token est expiré
      const now = Date.now();
      if (tokens.expiry_date && tokens.expiry_date < now) {
        console.log("Token expiré, rafraîchissement...");

        // Rafraîchir le token
        const { credentials } = await this.oauth2Client.refreshAccessToken();

        // Sauvegarder les nouveaux tokens
        await this.saveTokens(credentials);

        return credentials;
      }

      return tokens;
    } catch (error) {
      console.error("Erreur lors de la validation des tokens:", error);
      return null;
    }
  }

  /**
   * Vérifie si l'authentification est active
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getValidTokens();
    return tokens !== null;
  }

  /**
   * Déconnecte l'utilisateur (supprime les tokens)
   */
  async disconnect() {
    try {
      await prisma.googleOAuthToken.deleteMany({});
      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return false;
    }
  }

  /**
   * Retourne un client OAuth2 authentifié
   */
  async getAuthenticatedClient() {
    const tokens = await this.getValidTokens();

    if (!tokens) {
      throw new Error("Non authentifié");
    }

    this.oauth2Client.setCredentials(tokens);
    return this.oauth2Client;
  }
}

/**
 * Crée une instance du service OAuth avec la configuration depuis les variables d'environnement
 */
export function createOAuthService(): GoogleOAuthService | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.warn("⚠️ Configuration OAuth Google manquante");
    return null;
  }

  return new GoogleOAuthService({
    clientId,
    clientSecret,
    redirectUri,
  });
}
