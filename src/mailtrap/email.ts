import { mailtrapClient, sender } from "./mailtrap.config";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./email.templates";

type Recipient = { email: string; };

export const sendVerificationEmail = async (
    email: string, 
    verificationToken: string
  ): Promise<void> => {
    const recipient: Recipient[] = [{ email }];
  
    try {
      const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        subject: "Verify your email!",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        category: "Email verification",
      });
  
      console.log("Email sent successfully", response);
    } catch (error) {
      console.error("Error sending verification email", error);
      throw new Error(`Error sending verification email: ${error}`);
    }
  };