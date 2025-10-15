import nodemailer from "nodemailer";

export function createNodemailerTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

export async function testEmailConfig() {
  try {
    const transporter = createNodemailerTransporter();

    // Vérifier la connexion SMTP
    const connectionTest = await transporter.verify();
    console.log("Connexion SMTP vérifiée:", connectionTest);

    // Envoyer un email de test
    const testEmail = await transporter.sendMail({
      from: `"Test Email" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "Test d'envoi d'email - Système de réservation",
      text: "Ceci est un test d'envoi d'email pour vérifier que la configuration SMTP fonctionne correctement.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h1 style="color: #1e40af; font-size: 22px; margin-bottom: 20px;">Test d'envoi d'email</h1>
          <p>Ceci est un test d'envoi d'email pour vérifier que la configuration SMTP fonctionne correctement.</p>
          <ul>
            <li><strong>Date d'envoi:</strong> ${new Date().toLocaleString(
              "fr-FR"
            )}</li>
            <li><strong>Serveur:</strong> ${process.env.EMAIL_SERVER_HOST}</li>
            <li><strong>Utilisateur:</strong> ${
              process.env.EMAIL_SERVER_USER
            }</li>
          </ul>
          <p>Si vous recevez cet email, la configuration est correcte.</p>
        </div>
      `,
    });

    console.log("Email de test envoyé:", testEmail);
    return {
      success: true,
      message: "Email de test envoyé avec succès",
      details: testEmail,
    };
  } catch (error) {
    console.error("Erreur lors du test de configuration email:", error);
    return {
      success: false,
      message: "Erreur lors du test de configuration email",
      error,
    };
  }
}
