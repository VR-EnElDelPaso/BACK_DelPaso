import { User, Role } from "@prisma/client";

export default interface UserWithoutPassword extends Omit<User, "password"> {
  // Sobrescribir tipos específicos para mayor compatibilidad
  id: string;
  account_number: number | null; // Mantener compatible con Prisma
  email: string;
  name: string;
  first_lastname: string;
  second_lastname: string;
  display_name: string;
  image: string | null;
  role: Role; // Usar el enum de Prisma
  is_verified: boolean | null;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  created_at: Date;
  updated_at: Date;
}
