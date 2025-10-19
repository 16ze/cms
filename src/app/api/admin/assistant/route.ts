import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_KNOWLEDGE_BASE,
  AdminAssistantHelper,
} from "@/lib/admin-knowledge-base";

const ADMIN_ASSISTANT_CONFIG = {
  maxResponseLength: 2000,
  enableAnalytics: true,
  fallbackThreshold: 0.3,
  contextWindow: 10,
};

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message requis",
        },
        { status: 400 }
      );
    }

    // Détection d'intention avec la nouvelle base de connaissances
    const intent = AdminAssistantHelper.detectIntent(message);

    let response = "";
    let responseType = "general";
    let confidence = 0.8;

    // Génération de réponse basée sur l'intention détectée
    switch (intent.type) {
      case "procedure_request":
        response = generateProcedureResponse(intent.action);
        responseType = "procedure";
        confidence = 0.9;
        break;

      case "navigation_help":
        response = generateNavigationGuide(intent.target);
        responseType = "navigation";
        confidence = 0.85;
        break;

      case "troubleshooting":
        response = generateTroubleshootingGuide(intent.issue);
        responseType = "troubleshooting";
        confidence = 0.8;
        break;

      case "role_info":
        response = AdminAssistantHelper.getRoleInformation();
        responseType = "role_information";
        confidence = 0.95;
        break;

      case "external_link":
        response =
          AdminAssistantHelper.getExternalLink(intent.target || "") ||
          getFallbackResponse();
        responseType = "external_link";
        confidence = 0.9;
        break;

      case "faq_search":
        const faqAnswer = AdminAssistantHelper.findBestAnswer(message);
        response = faqAnswer || getFallbackResponse();
        responseType = "faq";
        confidence = faqAnswer ? 0.85 : 0.5;
        break;

      default:
        response = getFallbackResponse();
        responseType = "general_help";
        confidence = 0.6;
    }

    // Log de l'interaction pour analytics
    if (ADMIN_ASSISTANT_CONFIG.enableAnalytics) {
      try {
        const analyticsHeaders = request.headers;
        await prisma.chatbotConversation.create({
          data: {
            sessionId: `admin_${sessionId}`,
            userAgent: analyticsHeaders.get("user-agent") || "Unknown",
            ipAddress: analyticsHeaders.get("x-forwarded-for") || "Unknown",
            startTime: new Date(),
            endTime: new Date(),
            messageCount: 1,
            intent: intent.type,
            confidence: confidence,
            responseTime: Date.now() - startTime,
          },
        });

        await prisma.chatbotMessage.create({
          data: {
            sessionId: `admin_${sessionId}`,
            senderType: "user",
            message: message,
            timestamp: new Date(),
            intent: intent.type,
            confidence: confidence,
          },
        });

        await prisma.chatbotMessage.create({
          data: {
            sessionId: `admin_${sessionId}`,
            senderType: "assistant",
            message: response,
            timestamp: new Date(),
            intent: intent.type,
            confidence: confidence,
          },
        });

        await prisma.chatbotAnalytics.create({
          data: {
            sessionId: `admin_${sessionId}`,
            eventType: "admin_assistant_interaction",
            eventData: {
              intent: intent.type,
              confidence: confidence,
              responseType: responseType,
              messageLength: message.length,
              responseLength: response.length,
            },
            timestamp: new Date(),
          },
        });
      } catch (error) {
        console.error("Erreur analytics admin assistant:", error);
      }
    }

    return NextResponse.json({
      success: true,
      response: response,
      intent: intent.type,
      confidence: confidence,
      responseTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Erreur assistant admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}

function generateProcedureResponse(action: string): string {
  const procedures = ADMIN_KNOWLEDGE_BASE.procedures;

  switch (action) {
    case "add_client":
      const addClient = procedures.ajouter_client;
      return `**Comment ajouter un nouveau client :**\n\n${addClient.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${addClient.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${addClient.related_actions.join(", ")}`;

    case "edit_content":
      const editContent = procedures.modifier_contenu_page;
      return `**Comment modifier le contenu d'une page :**\n\n${editContent.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${editContent.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${editContent.related_actions.join(", ")}`;

    case "manage_header":
      const manageHeader = procedures.configurer_header;
      return `**Comment configurer le header du site :**\n\n${manageHeader.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${manageHeader.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${manageHeader.related_actions.join(", ")}`;

    case "manage_bookings":
      const manageBookings = procedures.gerer_reservations;
      return `**Comment gérer les réservations :**\n\n${manageBookings.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${manageBookings.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${manageBookings.related_actions.join(", ")}`;

    case "user_management":
      const userManagement = procedures.modifier_permissions;
      return `**Comment gérer les utilisateurs et permissions :**\n\n${userManagement.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${userManagement.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${userManagement.related_actions.join(", ")}`;

    case "view_stats":
      const viewStats = procedures.voir_statistiques;
      return `**Comment consulter les statistiques :**\n\n${viewStats.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${viewStats.tips.join(
        "\n"
      )}\n\n**Actions liées :** ${viewStats.related_actions.join(", ")}`;

    case "configure_analytics":
      const configAnalytics = procedures.configurer_google_analytics;
      return `**Comment configurer Google Analytics :**\n\n${configAnalytics.steps.join(
        "\n"
      )}\n\n**💡 Conseils :**\n${configAnalytics.tips.join(
        "\n"
      )}\n\n**🔗 Lien direct :** ${
        configAnalytics.external_link
      }\n\n**Actions liées :** ${configAnalytics.related_actions.join(", ")}`;

    default:
      return getFallbackResponse();
  }
}

function generateNavigationGuide(target: string): string {
  const navigation = ADMIN_KNOWLEDGE_BASE.admin_structure.navigation;
  const path = AdminAssistantHelper.getNavigationPath(target);

  if (path && navigation[target]) {
    const navItem = navigation[target];
    return `**Pour accéder à ${
      navItem.label
    } :**\n\n1. Dans la barre de navigation latérale (à gauche)\n2. Cliquez sur "${
      navItem.label
    }"\n3. Vous serez redirigé vers : ${path}\n\n**Description :** ${
      navItem.description
    }\n\n**Fonctionnalités disponibles :**\n${navItem.features
      .map((f) => `• ${f}`)
      .join("\n")}\n\n**Tâches courantes :**\n${navItem.common_tasks
      .map((t) => `• ${t}`)
      .join("\n")}`;
  }

  return `**Navigation dans l'interface admin :**\n\n**Pages principales disponibles :**\n${Object.values(
    navigation
  )
    .map((item: any) => `• **${item.label}** : ${item.description}`)
    .join(
      "\n"
    )}\n\n**💡 Conseil :** Utilisez la barre de navigation latérale pour accéder rapidement à toutes les fonctionnalités.`;
}

function generateTroubleshootingGuide(issue: string): string {
  const troubleshooting = ADMIN_KNOWLEDGE_BASE.troubleshooting;

  switch (issue) {
    case "login":
      const loginIssue = troubleshooting.login_issues;
      return `**Résolution des problèmes de connexion :**\n\n**Solutions :**\n${loginIssue.solutions.join(
        "\n"
      )}\n\n**Prévention :**\n${loginIssue.prevention.join("\n")}`;

    case "upload":
      const uploadIssue = troubleshooting.upload_problems;
      return `**Résolution des problèmes d'upload :**\n\n**Solutions :**\n${uploadIssue.solutions.join(
        "\n"
      )}\n\n**Prévention :**\n${uploadIssue.prevention.join("\n")}`;

    case "preview":
      const previewIssue = troubleshooting.preview_not_working;
      return `**Résolution des problèmes de prévisualisation :**\n\n**Solutions :**\n${previewIssue.solutions.join(
        "\n"
      )}\n\n**Prévention :**\n${previewIssue.prevention.join("\n")}`;

    case "save":
      const saveIssue = troubleshooting.save_issues;
      return `**Résolution des problèmes de sauvegarde :**\n\n**Solutions :**\n${saveIssue.solutions.join(
        "\n"
      )}\n\n**Prévention :**\n${saveIssue.prevention.join("\n")}`;

    case "navigation":
      const navIssue = troubleshooting.navigation_issues;
      return `**Résolution des problèmes de navigation :**\n\n**Solutions :**\n${navIssue.solutions.join(
        "\n"
      )}\n\n**Prévention :**\n${navIssue.prevention.join("\n")}`;

    default:
      return `**Dépannage général :**\n\nSi vous rencontrez un problème, essayez ces étapes :\n\n1. Actualisez la page (F5)\n2. Vérifiez votre connexion internet\n3. Videz le cache de votre navigateur\n4. Essayez dans un autre navigateur\n5. Contactez le support si le problème persiste\n\n**💡 Conseil :** Décrivez précisément votre problème pour un diagnostic plus rapide.`;
  }
}

function getFallbackResponse(): string {
  return `Je ne suis pas sûr de bien comprendre votre question.\n\nPouvez-vous reformuler ou choisir parmi ces options :\n\n**Procédures courantes :**\n• Comment ajouter un client ?\n• Comment modifier le contenu ?\n• Comment configurer le header ?\n• Comment gérer les réservations ?\n• Comment voir les statistiques ?\n\n**Navigation :**\n• Où trouver les statistiques ?\n• Comment accéder aux clients ?\n• Où sont les paramètres ?\n• Comment naviguer dans l'admin ?\n\n**Dépannage :**\n• Problème de connexion\n• Problème d'upload\n• Problème de sauvegarde\n• Problème de navigation\n\nOu posez votre question différemment, je suis là pour vous aider !`;
}
