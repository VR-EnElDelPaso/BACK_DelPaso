import { transporter, sender } from "../config/email.config";
import nodemailer from 'nodemailer';
import { verificationEmailTemplate } from "../templates/email.templates";

export const sendVerificationEmail = async (
    to: string, 
    token: string
  ): Promise<void> => {
  
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: sender,
        to,
        subject: "Verifica tu cuenta MUVI 😊",
        html: verificationEmailTemplate(token),
      };
  
      const response = await transporter.sendMail(mailOptions);
      console.log("Email enviado con éxito", response.messageId);
    } catch (error) {
      console.error("Error enviando el correo de verificación", error);
      throw new Error(`Error enviando el correo de verificación: ${error}`);
    }
  };