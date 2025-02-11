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

  export const sendPasswordResetEmail = async (email: string, resetURL: string): Promise<void> => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset"
        });
    } catch (error) {
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
};

export const sendEmailResetSuccess = async (email: string): Promise<void> => {
  const recipient = [{ email }];
  try {
      const response = await mailtrapClient.send({
          from: sender,
          to: recipient,
          subject: "Password Reset Successful",
          html: PASSWORD_RESET_SUCCESS_TEMPLATE,
          category: "Password Reset"
      });

      console.log("Password reset email sent successfully");
  } catch (error) {
      console.error("Error sending password reset success email", error);
      throw new Error(`Error sending password reset success email: ${error}`);
  }
};
