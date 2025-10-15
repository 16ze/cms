import nodemailer, { SentMessageInfo } from "nodemailer";

// Interface pour les emails
export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

// Fonction d'envoi d'email
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  console.log("📧 Service Email: Début de préparation d'un email");
  console.log(`📧 Destinataire: ${emailData.to}`);
  console.log(`📧 Sujet: ${emailData.subject}`);

  console.log("📧 VARIABLES ENV DEBUG:");
  console.log(`EMAIL_SERVER: ${process.env.EMAIL_SERVER}`);
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`EMAIL_SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);

  // Récupérer les paramètres de configuration depuis les variables d'environnement
  const EMAIL_HOST =
    process.env.EMAIL_SERVER_HOST ||
    process.env.EMAIL_SERVER ||
    process.env.EMAIL_HOST ||
    process.env.SMTP_HOST;
  const EMAIL_PORT = parseInt(
    process.env.EMAIL_SERVER_PORT ||
      process.env.EMAIL_PORT ||
      process.env.SMTP_PORT ||
      "587",
    10
  );
  const EMAIL_USER =
    process.env.EMAIL_SERVER_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER;
  const EMAIL_PASSWORD =
    process.env.EMAIL_SERVER_PASSWORD ||
    process.env.EMAIL_PASSWORD ||
    process.env.SMTP_PASSWORD;
  const EMAIL_FROM =
    process.env.EMAIL_FROM ||
    process.env.FROM_EMAIL ||
    "contact.kairodigital@gmail.com";

  // Vérification des paramètres critiques
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.error("❌ Erreur de configuration SMTP: Paramètres manquants");
    console.error(`  - Host: ${EMAIL_HOST ? "✓" : "✗"}`);
    console.error(`  - User: ${EMAIL_USER ? "✓" : "✗"}`);
    console.error(`  - Password: ${EMAIL_PASSWORD ? "✓" : "✗"}`);
    return false;
  }

  try {
    console.log(
      `📧 Configuration SMTP: ${EMAIL_HOST}:${EMAIL_PORT} (${EMAIL_USER})`
    );

    // Créer un transporteur d'email
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      tls: {
        // Ne pas faire échouer en cas de certificat auto-signé
        rejectUnauthorized: false,
      },
    });

    console.log("📧 Vérification de la connexion SMTP...");

    // Vérifier la connexion
    try {
      await transporter.verify();
      console.log("✅ Connexion SMTP vérifiée avec succès");
    } catch (verifyError) {
      console.error("❌ Échec de vérification SMTP:", verifyError);
      return false;
    }

    // Configurer les options de l'email
    const mailOptions = {
      from: `KAIRO Digital <${EMAIL_FROM}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo,
    };

    console.log("📧 Envoi de l'email en cours...");

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email envoyé avec succès!");
    console.log(`📧 ID Message: ${info.messageId}`);

    return true;
  } catch (error: unknown) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);

    // Log détaillé pour les erreurs d'authentification
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("Invalid login")
    ) {
      console.error(
        "❌ Échec d'authentification SMTP. Vérifiez vos identifiants."
      );
      console.error(
        "💡 Si vous utilisez Gmail, assurez-vous d'utiliser un mot de passe d'application."
      );
    }

    return false;
  }
}

// Fonction de débogage pour les problèmes d'envoi d'email
export async function debugEmailService(): Promise<{
  success: boolean;
  environmentVariables?: Record<string, string>;
  smtpVerification?: boolean;
  testEmailResult?: SentMessageInfo;
  error?: string;
  stack?: string;
  details?: unknown;
}> {
  try {
    console.log("=== DÉBUT DÉBOGAGE EMAIL SERVICE ===");
    console.log("Vérification des variables d'environnement:");

    const requiredVars = [
      "EMAIL_SERVER_HOST",
      "EMAIL_SERVER_PORT",
      "EMAIL_SERVER_USER",
      "EMAIL_SERVER_PASSWORD",
      "EMAIL_FROM",
      "ADMIN_EMAIL",
    ];

    const missingVars: string[] = [];
    const envInfo: Record<string, string> = {};

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
        envInfo[varName] = "MANQUANT";
      } else {
        // Masquer le mot de passe pour la sécurité
        envInfo[varName] =
          varName === "EMAIL_SERVER_PASSWORD" ? "********" : value;
      }
    }

    console.log("Configuration email:", envInfo);

    if (missingVars.length > 0) {
      throw new Error(
        `Variables d'environnement manquantes: ${missingVars.join(", ")}`
      );
    }

    // Tester la connexion SMTP
    console.log("Test de connexion SMTP...");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER || "",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
    });
    const verifyResult = await transporter.verify();
    console.log("Résultat de vérification SMTP:", verifyResult);

    // Tenter d'envoyer un email de test
    console.log("Envoi d'un email de test...");
    const testResult = await transporter.sendMail({
      from: `"Test Débogage" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "Test de débogage - Système d'email",
      text: `Ceci est un email de test envoyé à ${new Date().toISOString()} pour déboguer les problèmes d'envoi.`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>Test de débogage du système d'email</h1>
          <p>Cet email a été envoyé automatiquement pour tester le système d'envoi d'emails.</p>
          <p>Date et heure: ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      `,
    });

    console.log("Email de test envoyé avec succès:", testResult);
    console.log("=== FIN DÉBOGAGE EMAIL SERVICE ===");

    return {
      success: true,
      environmentVariables: envInfo,
      smtpVerification: verifyResult,
      testEmailResult: testResult,
    };
  } catch (error: unknown) {
    console.error("=== ERREUR DÉBOGAGE EMAIL SERVICE ===", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    };
  }
}

// Définition du type ReservationType pour éviter l'import direct de @prisma/client
type ReservationType =
  | "DISCOVERY"
  | "CONSULTATION"
  | "PRESENTATION"
  | "FOLLOWUP";

// Obtenir le nom du type de réservation
function getReservationTypeLabel(type: ReservationType): string {
  switch (type) {
    case "DISCOVERY":
      return "Appel découverte";
    case "CONSULTATION":
      return "Consultation stratégique";
    case "PRESENTATION":
      return "Présentation de projet";
    case "FOLLOWUP":
      return "Suivi de projet";
    default:
      return "Consultation";
  }
}

// Formatter une date en français
function formatDateFr(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("fr-FR", options);
}

// Envoyer un email de confirmation
export async function sendConfirmationEmail(
  to: string,
  clientName: string,
  reservationId: string,
  startTime: Date,
  endTime: Date,
  reservationType: ReservationType,
  cancellationToken: string
): Promise<void> {
  const reservationTypeLabel = getReservationTypeLabel(reservationType);
  const startTimeFormatted = formatDateFr(startTime);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.kairo-digital.fr";

  // Format de la date pour Google Calendar
  const startTimeGCal = startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTimeGCal = endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const googleCalendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${reservationTypeLabel} avec KAIRO Digital`
  )}&dates=${startTimeGCal}/${endTimeGCal}&details=${encodeURIComponent(
    `Consultation avec KAIRO Digital. ID: ${reservationId}`
  )}&location=En ligne`;

  // Lien d'annulation
  const cancellationLink = `${baseUrl}/consultation/annulation?id=${reservationId}&token=${cancellationToken}`;

  try {
    await sendEmail({
      to,
      subject: `Confirmation de votre ${reservationTypeLabel.toLowerCase()} - KAIRO Digital`,
      text: `Bonjour ${clientName}, votre réservation est confirmée pour le ${startTimeFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${baseUrl}/images/logo.png" alt="KAIRO Digital" style="max-width: 200px; height: auto;" />
          </div>
          
          <h1 style="color: #1e40af; text-align: center; font-size: 24px; margin-bottom: 20px;">Votre réservation est confirmée !</h1>
          
          <p style="margin-bottom: 15px;">Bonjour ${clientName},</p>
          
          <p style="margin-bottom: 15px;">Merci d'avoir réservé un créneau pour un <strong>${reservationTypeLabel.toLowerCase()}</strong> avec KAIRO Digital. Votre réservation a bien été enregistrée.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">Détails de votre réservation</h2>
            <p><strong>Type :</strong> ${reservationTypeLabel}</p>
            <p><strong>Date et heure :</strong> ${startTimeFormatted}</p>
            <p><strong>Durée :</strong> ${Math.round(
              (endTime.getTime() - startTime.getTime()) / 1000 / 60
            )} minutes</p>
            <p><strong>ID de réservation :</strong> ${reservationId}</p>
          </div>
          
          <p style="margin-bottom: 15px;">Les détails concernant le lien de visioconférence vous seront envoyés par email la veille de notre rendez-vous.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${googleCalendarLink}" target="_blank" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ajouter à Google Calendar</a>
          </div>
          
          <p style="margin-bottom: 15px;">Si vous devez annuler ou reprogrammer votre rendez-vous, veuillez cliquer sur le lien ci-dessous :</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${cancellationLink}" target="_blank" style="color: #dc2626; text-decoration: underline;">Annuler ou modifier ma réservation</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            KAIRO Digital<br />
            Développeur web freelance<br />
            <a href="${baseUrl}" style="color: #1e40af;">www.kairo-digital.fr</a>
          </p>
        </div>
      `,
    });
    console.log(`✅ Email de confirmation envoyé à ${to}`);
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation:",
      error
    );
  }
}

// Envoyer un email de rappel
export async function sendReminderEmail(
  to: string,
  clientName: string,
  reservationId: string,
  startTime: Date,
  endTime: Date,
  reservationType: ReservationType,
  cancellationToken: string,
  meetingLink?: string
): Promise<void> {
  const reservationTypeLabel = getReservationTypeLabel(reservationType);
  const startTimeFormatted = formatDateFr(startTime);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.kairo-digital.fr";

  // Lien d'annulation
  const cancellationLink = `${baseUrl}/consultation/annulation?id=${reservationId}&token=${cancellationToken}`;

  try {
    await sendEmail({
      to,
      subject: `Rappel : Votre ${reservationTypeLabel.toLowerCase()} demain - KAIRO Digital`,
      text: `Bonjour ${clientName}, rappel pour votre rendez-vous demain à ${startTimeFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${baseUrl}/images/logo.png" alt="KAIRO Digital" style="max-width: 200px; height: auto;" />
          </div>
          
          <h1 style="color: #1e40af; text-align: center; font-size: 24px; margin-bottom: 20px;">Rappel : Votre rendez-vous est demain !</h1>
          
          <p style="margin-bottom: 15px;">Bonjour ${clientName},</p>
          
          <p style="margin-bottom: 15px;">Ce message est un rappel pour votre <strong>${reservationTypeLabel.toLowerCase()}</strong> avec KAIRO Digital prévu pour demain.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">Détails de votre réservation</h2>
            <p><strong>Type :</strong> ${reservationTypeLabel}</p>
            <p><strong>Date et heure :</strong> ${startTimeFormatted}</p>
            <p><strong>Durée :</strong> ${Math.round(
              (endTime.getTime() - startTime.getTime()) / 1000 / 60
            )} minutes</p>
            ${
              meetingLink
                ? `<p><strong>Lien de réunion :</strong> <a href="${meetingLink}" target="_blank">${meetingLink}</a></p>`
                : ""
            }
          </div>
          
          <p style="margin-bottom: 15px;">Si vous avez des questions ou besoin de plus d'informations, n'hésitez pas à me contacter par email.</p>
          
          <p style="margin-bottom: 15px;">Si vous devez annuler ou reprogrammer votre rendez-vous, veuillez cliquer sur le lien ci-dessous :</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${cancellationLink}" target="_blank" style="color: #dc2626; text-decoration: underline;">Annuler ou modifier ma réservation</a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            KAIRO Digital<br />
            Développeur web freelance<br />
            <a href="${baseUrl}" style="color: #1e40af;">www.kairo-digital.fr</a>
          </p>
        </div>
      `,
    });
    console.log(`✅ Email de rappel envoyé à ${to}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de rappel:", error);
  }
}

// Envoyer un email de notification à l'administrateur
export async function sendAdminNotificationEmail(
  clientName: string,
  clientEmail: string,
  clientPhone: string | undefined,
  reservationId: string,
  startTime: Date,
  endTime: Date,
  reservationType: ReservationType,
  communicationMethod: string,
  projectDescription: string
): Promise<void> {
  const reservationTypeLabel = getReservationTypeLabel(reservationType);
  const startTimeFormatted = formatDateFr(startTime);
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.kairo-digital.fr";

  try {
    await sendEmail({
      to: adminEmail,
      subject: `Nouvelle réservation : ${reservationTypeLabel} avec ${clientName}`,
      text: `Nouvelle réservation de ${clientName} (${clientEmail}) pour ${startTimeFormatted}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h1 style="color: #1e40af; font-size: 22px; margin-bottom: 20px;">Nouvelle réservation !</h1>
          
          <p style="margin-bottom: 15px;">Un client vient de réserver un créneau de consultation.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">Détails de la réservation</h2>
            <p><strong>Client :</strong> ${clientName}</p>
            <p><strong>Email :</strong> ${clientEmail}</p>
            <p><strong>Téléphone :</strong> ${clientPhone || "Non fourni"}</p>
            <p><strong>Type :</strong> ${reservationTypeLabel}</p>
            <p><strong>Méthode :</strong> ${
              communicationMethod === "VISIO" ? "Visioconférence" : "Téléphone"
            }</p>
            <p><strong>Date et heure :</strong> ${startTimeFormatted}</p>
            <p><strong>Durée :</strong> ${Math.round(
              (endTime.getTime() - startTime.getTime()) / 1000 / 60
            )} minutes</p>
            <p><strong>ID de réservation :</strong> ${reservationId}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">Description du projet</h2>
            <p style="white-space: pre-line;">${projectDescription}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/admin/reservations" target="_blank" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir dans l'administration</a>
          </div>
        </div>
      `,
    });
    console.log(
      `✅ Email de notification administrateur envoyé à ${adminEmail}`
    );
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email d'admin:", error);
  }
}

// Fonction pour tester l'envoi d'email directement
export async function testEmailService(toEmail?: string): Promise<boolean> {
  console.log("🧪 TEST: Démarrage du test d'envoi d'email");
  const testEmail =
    toEmail ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_FROM ||
    "contact.kairodigital@gmail.com";

  console.log(`🧪 TEST: Envoi d'un email test à ${testEmail}`);

  try {
    const result = await sendEmail({
      to: testEmail,
      subject: "Test de configuration email - KAIRO Digital",
      text: `Ceci est un email de test envoyé le ${new Date().toLocaleString(
        "fr-FR"
      )}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h1 style="color: #1e40af; font-size: 22px; margin-bottom: 20px;">Test d'envoi d'email</h1>
          <p>Cet email a été envoyé automatiquement pour tester la configuration d'envoi d'emails.</p>
          <p>Date et heure: ${new Date().toLocaleString("fr-FR")}</p>
          <p>Si vous recevez cet email, cela signifie que la configuration est correcte!</p>
        </div>
      `,
    });

    console.log(
      "🧪 TEST: Résultat du test:",
      result ? "SUCCÈS ✅" : "ÉCHEC ❌"
    );
    return result;
  } catch (error) {
    console.error("🧪 TEST: Erreur lors du test d'envoi d'email:", error);
    return false;
  }
}

// Si ce fichier est exécuté directement, lancer un test d'envoi d'email
if (require.main === module) {
  testEmailService().then((success) => {
    console.log(`Test d'envoi d'email: ${success ? "RÉUSSI" : "ÉCHOUÉ"}`);
    process.exit(success ? 0 : 1);
  });
}
