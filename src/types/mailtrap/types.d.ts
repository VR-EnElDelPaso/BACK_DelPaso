declare module "mailtrap" {
    export class MailtrapClient {
      constructor(config: { token: string });
      send(options: {
        from: { email: string; name: string };
        to: { email: string }[];
        subject: string;
        html: string;
        category?: string;
      }): Promise<any>;
    }
  }

  declare namespace NodeJS {
    interface ProcessEnv {
      MAILTRAP_TOKEN: string;
    }
  }
  