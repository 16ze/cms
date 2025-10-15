"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface GoogleOAuthConnectProps {
  onStatusChange?: (connected: boolean) => void;
}

export default function GoogleOAuthConnect({ onStatusChange }: GoogleOAuthConnectProps) {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/google/status');
      const data = await response.json();
      
      setConnected(data.connected || false);
      setConfigured(data.configured || false);
      
      if (onStatusChange) {
        onStatusChange(data.connected || false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    // Redirection vers l'authentification OAuth
    window.location.href = '/api/auth/google/authorize';
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter Google Analytics ?')) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch('/api/auth/google/status', {
        method: 'DELETE',
      });

      if (response.ok) {
        setConnected(false);
        toast.success('Déconnecté de Google Analytics');
        
        if (onStatusChange) {
          onStatusChange(false);
        }
      } else {
        throw new Error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleReconnect = () => {
    handleConnect();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connexion Google Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Vérification...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!configured) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-900">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Configuration OAuth manquante
          </CardTitle>
          <CardDescription className="text-orange-700">
            Pour activer l'intégration Google Analytics, vous devez configurer les variables d'environnement OAuth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-sm mb-2">Variables requises :</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_OAUTH_CLIENT_ID</code></li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_OAUTH_CLIENT_SECRET</code></li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">GOOGLE_ANALYTICS_PROPERTY_ID</code></li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('/admin/guides/google-analytics', '_blank')}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir le guide de configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={connected ? "border-green-200 bg-green-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {connected ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 mr-2 text-gray-400" />
            )}
            Connexion Google Analytics
          </span>
          <Badge className={connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {connected ? "Connecté" : "Non connecté"}
          </Badge>
        </CardTitle>
        <CardDescription>
          {connected 
            ? "Votre compte Google Analytics est connecté. Les vraies données s'affichent dans le dashboard."
            : "Connectez votre compte Google pour afficher les vraies données Analytics dans le dashboard."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connected ? (
            <>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-green-900 mb-1">
                      Intégration active
                    </h4>
                    <p className="text-sm text-green-700">
                      Les données suivantes sont maintenant récupérées en temps réel :
                    </p>
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      <li>• Sessions et pages vues (Google Analytics)</li>
                      <li>• Taux de rebond et durée moyenne</li>
                      <li>• Positions et clics (Search Console)</li>
                      <li>• Performance du site (PageSpeed)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReconnect}
                  disabled={connecting}
                  className="flex-1"
                >
                  {connecting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Reconnecter
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex-1"
                >
                  {disconnecting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Déconnecter
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      Authentification sécurisée
                    </h4>
                    <p className="text-sm text-gray-600">
                      Vous allez être redirigé vers Google pour autoriser l'accès à vos données Analytics.
                      Aucun mot de passe ne sera stocké.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {connecting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {connecting ? "Connexion en cours..." : "Connecter avec Google"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
