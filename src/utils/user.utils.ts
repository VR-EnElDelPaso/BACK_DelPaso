import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export function validationStudent(account_number: number, email: string) {
  if (!account_number) {
    throw new Error("Account number is missing");
  }

  if (account_number.toString().length !== 8) {
    throw new Error("Insert a valid 8-digit account number");
  }

  const correoUCol = /^[a-zA-Z0-9._%+-]+@ucol\.mx$/;
  if (!correoUCol.test(email)) {
    throw new Error("Insert a valid email address");
  }
}

export function validationVisitor(email: string) {
  const correoUCol = /^[a-zA-Z0-9._%+-]+@ucol\.mx$/;
  if (correoUCol.test(email)) {
    throw new Error("Insert a valid email address");
  }
}

export function validationWorker(account_number: number, email: string) {
  if (!account_number) {
    throw new Error("Account number is missing");
  }

  if (account_number.toString().length !== 4) {
    throw new Error("Insert a valid 4-digit account number");
  }

  const correoUCol = /^[a-zA-Z0-9._%+-]+@ucol\.mx$/;
  if (!correoUCol.test(email)) {
    throw new Error("Insert a valid email address");
  }
}

export const generateUserVerificationToken = (user: User): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be defined");
  }
  return jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });
};
