"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Code2,
  Database,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GoogleAnalyticsSetupPage() {
  const router = useRouter();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const envExample = `# Google Analytics & Tag Manager
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Remplacez par vos vrais IDs
# G-XXXXXXXXXX = Votre ID Google Analytics
# GTM-XXXXXXX = Votre ID Google Tag Manager`;

  const handleCopy = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast.success("Code copié dans le presse-papiers");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "Créer un compte Google Analytics",
      description: "Créez un compte et une propriété dans Google Analytics 4",
      icon: <Globe className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Étapes :</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>
                Allez sur{" "}
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  analytics.google.com <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Cliquez sur "Commencer à mesurer"</li>
              <li>Créez un compte (nom de votre entreprise)</li>
              <li>Créez une propriété (nom de votre site)</li>
              <li>Sélectionnez votre secteur d'activité</li>
              <li>Choisissez vos objectifs business</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Récupérer l'ID Google Analytics",
      description: "Trouvez votre ID de mesure (G-XXXXXXXXXX)",
      icon: <Database className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">
              🔍 Où trouver votre ID :
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
              <li>
                Dans Google Analytics, allez dans{" "}
                <strong>Administration</strong> (icône engrenage)
              </li>
              <li>
                Dans la colonne <strong>"Propriété"</strong>, cliquez sur{" "}
                <strong>"Flux de données"</strong>
              </li>
              <li>Cliquez sur votre flux de données web</li>
              <li>
                Votre ID de mesure apparaît en haut :{" "}
                <code className="bg-green-100 px-2 py-1 rounded">
                  G-XXXXXXXXXX
                </code>
              </li>
            </ol>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 inline mr-2" />
            <span className="text-sm text-amber-800">
              <strong>Important :</strong> L'ID commence toujours par "G-" suivi
              de 10 caractères
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Configurer Google Tag Manager (optionnel)",
      description:
        "Pour un suivi avancé et une gestion centralisée des balises",
      icon: <Code2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">
              📋 Étapes GTM :
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-purple-800">
              <li>
                Allez sur{" "}
                <a
                  href="https://tagmanager.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline inline-flex items-center gap-1"
                >
                  tagmanager.google.com <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Créez un compte et un conteneur</li>
              <li>
                Votre ID GTM apparaît :{" "}
                <code className="bg-purple-100 px-2 py-1 rounded">
                  GTM-XXXXXXX
                </code>
              </li>
              <li>Configurez Google Analytics dans GTM</li>
            </ol>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600 inline mr-2" />
            <span className="text-sm text-blue-800">
              <strong>Avantage :</strong> GTM permet de gérer plusieurs outils
              de tracking sans modifier le code
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Configurer les variables d'environnement",
      description: "Ajoutez vos IDs dans le fichier .env.local",
      icon: <Code2 className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                📝 Fichier .env.local
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(envExample, 4)}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copiedStep === 4 ? "Copié !" : "Copier"}
              </Button>
            </div>
            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
              <code>{envExample}</code>
            </pre>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 inline mr-2" />
            <span className="text-sm text-red-800">
              <strong>Sécurité :</strong> Ne jamais commiter le fichier
              .env.local dans Git
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Tester l'intégration",
      description: "Vérifiez que Google Analytics fonctionne correctement",
      icon: <CheckCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">
              🧪 Tests à effectuer :
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
              <li>Redémarrez votre serveur de développement</li>
              <li>Visitez votre site en mode incognito</li>
              <li>Ouvrez les outils de développement (F12)</li>
              <li>
                Allez dans l'onglet "Network" et filtrez par "google-analytics"
              </li>
              <li>
                Rechargez la page et vérifiez qu'il y a des requêtes vers Google
              </li>
            </ol>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600 inline mr-2" />
            <span className="text-sm text-blue-800">
              <strong>Dans Google Analytics :</strong> Les données peuvent
              prendre 24-48h à apparaître
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Guide d'intégration Google Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Configurez Google Analytics et Tag Manager en 30 minutes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ⏱️ 30 minutes
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              🎯 Niveau débutant
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800"
            >
              📊 Analytics
            </Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Ce que vous obtiendrez
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  📈 Données réelles
                </h4>
                <p className="text-sm text-gray-600">
                  Visiteurs, pages vues, taux de rebond, durée de session
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  🎯 Objectifs personnalisés
                </h4>
                <p className="text-sm text-gray-600">
                  Conversions, événements, parcours utilisateur
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  📱 Multi-appareils
                </h4>
                <p className="text-sm text-gray-600">
                  Desktop, mobile, tablette - vue complète
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">🔍 SEO amélioré</h4>
                <p className="text-sm text-gray-600">
                  Données Google pour optimiser votre référencement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.id} className="relative">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {step.id}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {step.icon}
                      {step.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{step.content}</CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 Félicitations !
              </h3>
              <p className="text-gray-600 mb-4">
                Votre Google Analytics est maintenant configuré. Les données
                commenceront à apparaître dans les 24-48h.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/admin/settings")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Aller aux paramètres SEO
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open("https://analytics.google.com", "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir Google Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
