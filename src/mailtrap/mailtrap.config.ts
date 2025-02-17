import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const mailtrapToken = process.env.MAILTRAP_TOKEN;

if (!mailtrapToken) {
  throw new Error("MAILTRAP_TOKEN is not defined in the environment variables.");
}

export const mailtrapClient = new MailtrapClient({
  token: mailtrapToken,
});


export const sender: { email: string; name: string } = {
  email: "hello@demomailtrap.com",
  name: "FernandoDelPaso",
};
