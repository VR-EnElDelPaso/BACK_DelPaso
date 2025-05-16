import { transporter, sender } from "../config/email.config";
import nodemailer from 'nodemailer';
import { verificationEmailTemplate } from "../templates/email.templates";

/**
 * Envía un correo electrónico de verificación.
 *
 * @param {string} to - La dirección de correo electrónico del destinatario.
 * @param {string} verificationToken - El token de verificación que se incluirá en el correo electrónico.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando el correo electrónico se ha enviado correctamente.
 * @throws {Error} - Lanza un error si ocurre un problema al enviar el correo electrónico.
 */
export const sendVerificationEmail = async (
  to: string,
  verificationToken: string
): Promise<void> => {
  try {
    // build the verification link
    const client_url = process.env.CLIENT_URL;
    if (!client_url) throw new Error("CLIENT_URL is not defined");
    const verificationLink = `${client_url}/auth/verify-email?token=${verificationToken}`;

    // build the email content
    const mailOptions: nodemailer.SendMailOptions = {
      from: sender,
      to,
      subject: "Verifica tu correo en MUVI 😊",
      html: verificationEmailTemplate(verificationLink),
    };
    const response = await transporter.sendMail(mailOptions);
    console.log("Send email successfully", response.messageId);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};