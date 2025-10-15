import nodemailer from "nodemailer";

// Configuration du transporteur d'email
export const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || "",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
  auth: {
    user: process.env.EMAIL_SERVER_USER || "",
    pass: process.env.EMAIL_SERVER_PASSWORD || "",
  },
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  from: process.env.EMAIL_FROM || "contact@kairodigital.com",
};

// Fonction pour envoyer un email de contact
export async function sendContactEmail(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  project: string;
}) {
  try {
    const transporter = nodemailer.createTransport(emailConfig);

    // Vérifier que la connexion est active
    await transporter.verify();

    // Préparer le contenu de l'email
    const mailOptions = {
      from: emailConfig.from,
      to: process.env.EMAIL_RECIPIENT || "contact@kairodigital.com",
      replyTo: formData.email,
      subject: `[KAIRO Digital] Nouveau message : ${formData.subject}`,
      text: `
        Nouveau message de contact:
        
        Nom: ${formData.firstName} ${formData.lastName}
        Email: ${formData.email}
        Téléphone: ${formData.phone || "Non fourni"}
        
        Sujet: ${formData.subject}
        
        Message:
        ${formData.project}
        
        ---
        Ce message a été envoyé depuis le formulaire de contact sur le site KAIRO Digital.
      `,
      html: `
        <h2>Nouveau message de contact</h2>
        
        <p><strong>Nom:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Téléphone:</strong> ${formData.phone || "Non fourni"}</p>
        
        <p><strong>Sujet:</strong> ${formData.subject}</p>
        
        <h3>Message:</h3>
        <p>${formData.project.replace(/\n/g, "<br>")}</p>
        
        <hr>
        <p><small>Ce message a été envoyé depuis le formulaire de contact sur le site KAIRO Digital.</small></p>
      `,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email");
  }
}

// Fonction pour envoyer une notification de réception au client
export async function sendAutoReplyEmail(toName: string, toEmail: string) {
  try {
    const transporter = nodemailer.createTransport(emailConfig);

    // Vérifier que la connexion est active
    await transporter.verify();

    // Préparer le contenu de l'email
    const mailOptions = {
      from: emailConfig.from,
      to: toEmail,
      subject: "Merci pour votre message - KAIRO Digital",
      text: `
        Bonjour ${toName},
        
        Nous vous remercions pour votre message. 
        
        Notre équipe l'examine et vous répondra dans les meilleurs délais, généralement sous 24 à 48 heures ouvrées.
        
        Si votre demande est urgente, n'hésitez pas à nous appeler directement.
        
        Cordialement,
        L'équipe KAIRO Digital
      `,
      html: `
        <h2>Bonjour ${toName},</h2>
        
        <p>Nous vous remercions pour votre message.</p>
        
        <p>Notre équipe l'examine et vous répondra dans les meilleurs délais, généralement sous 24 à 48 heures ouvrées.</p>
        
        <p>Si votre demande est urgente, n'hésitez pas à nous appeler directement.</p>
        
        <p>Cordialement,<br>
        L'équipe KAIRO Digital</p>
      `,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de la confirmation:", error);
    // On ne lève pas d'erreur ici car c'est un email secondaire,
    // l'échec ne devrait pas bloquer le processus principal
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
