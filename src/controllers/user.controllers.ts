import { Request, RequestHandler, Response } from "express";

import bcrypt from "bcryptjs";

import prisma from "../prisma";
import { generateUserVerificationToken, validationStudent, validationVisitor, validationWorker } from "../utils/user.utils";
import { sendVerificationEmail } from "../services/email.services";

export const createUserController: RequestHandler = async (req: Request, res: Response) => {
  const { account_number, name, display_name, email, password, role } = req.body;

  if (!name || !display_name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and include both letters and numbers',
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser && existingUser.is_verified) return res.status(409).json({ error: 'User already exists' });
    if (existingUser && !existingUser.is_verified) return res.status(409).json({ error: 'User not verified' });

    // validate the account number and email based on the role
    if (role === "WORKER") {
      validationWorker(account_number, email);
    } else if (role === "STUDENT") {
      validationStudent(account_number, email);
    } else if (role === "VISITOR") {
      validationVisitor(email);
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        account_number,
        name,
        display_name,
        email,
        password: hashedPassword,
        role,
        is_verified: false,
      }
    });

    // send verification email
    const verificationToken = generateUserVerificationToken(user);
    sendVerificationEmail(user.email, verificationToken);

    // send response
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'An unknown error occurred during user creation' });
  }
}
