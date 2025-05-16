import { Request, RequestHandler, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const verifyUserEmailController: RequestHandler = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    if (!decoded.id) return res.status(400).json({ error: 'Invalid token' });

    const userId = decoded.id;
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    if (user.is_verified) return res.status(400).json({ error: 'User already verified' });

    // Update the user's is_verified field
    await prisma.user.update({
      where: { id: userId },
      data: { is_verified: true }
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError) return res.status(400).json({ error: 'Invalid token' });
    if (error instanceof jwt.TokenExpiredError) return res.status(400).json({ error: 'Token expired' });
    res.status(500).json({ error: 'An unknown error occurred during email verification' });
  }
}