import { UserWithoutPassword } from "@/types/auth/UserWithoutPassword";

declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}
