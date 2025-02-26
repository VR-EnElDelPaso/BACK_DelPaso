import { transporter, sender } from "../config/email.config";
import nodemailer from 'nodemailer';
import { verificationEmailTemplate } from "../templates/email.templates";

type Recipient = { email: string; };

export const sendVerificationEmail = async (
  to: string,
  verificationToken: string
): Promise<void> => {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: sender,
      to,
      subject: "Verifica tu correo en MUVI 😊",
      html: verificationEmailTemplate(verificationToken),
    };
    const response = await transporter.sendMail(mailOptions);
    console.log("Send email successfully", response.messageId);
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};