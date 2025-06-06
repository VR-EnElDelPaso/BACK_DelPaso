import { Request, RequestHandler, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../prisma";
import {
  generateUserVerificationToken,
  validationStudent,
  validationVisitor,
  validationWorker,
} from "../utils/user.utils";
import { sendVerificationEmail } from "../services/email.services";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";

export const createUserController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const {
    account_number,
    name,
    first_lastname,
    second_lastname,
    display_name,
    email,
    password,
    role,
  } = req.body;

  if (
    !name ||
    !first_lastname ||
    !second_lastname ||
    !display_name ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include both letters and numbers",
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.is_verified)
      return res.status(409).json({ error: "User already exists" });
    if (existingUser && !existingUser.is_verified)
      return res.status(409).json({ error: "User not verified" });

    // validate the account number and email based on the role
    if (role === "WORKER") {
      validationWorker(account_number, email);
    } else if (role === "STUDENT") {
      validationStudent(account_number, email);
    } else if (role === "VISITOR") {
      validationVisitor(email);
    } else {
      return res.status(400).json({ error: "Invalid user role" });
    }

    // create the user - convertir account_number a número o null
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        account_number: account_number ? parseInt(account_number) : null, // Conversión segura
        name,
        first_lastname,
        second_lastname,
        display_name,
        email,
        password: hashedPassword,
        role,
        is_verified: false,
      },
    });

    // send verification email
    const verificationToken = generateUserVerificationToken(user);
    sendVerificationEmail(user.email, verificationToken);

    // send response without password
    const { password: _, ...userResponse } = user;
    res.status(201).json({
      ok: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An unknown error occurred during user creation",
    });
  }
};

export const verifyUserEmailController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  // Check if the token is provided
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!decoded.id) return res.status(400).json({ error: "Invalid token" });

    // Find the user by ID
    const userId = decoded.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return res.status(400).json({ error: "Invalid token" });

    // Check if the user is already verified
    if (user.is_verified)
      return res.status(400).json({ error: "User already verified" });

    // Update the user's is_verified field
    await prisma.user.update({
      where: { id: userId },
      data: { is_verified: true },
    });

    res.status(200).json({
      ok: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(400).json({ error: "Invalid token" });
    if (error instanceof jwt.TokenExpiredError)
      return res.status(400).json({ error: "Token expired" });
    res
      .status(500)
      .json({ error: "An unknown error occurred during email verification" });
  }
};

export const sendVerificationEmailController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  // Check if the email is provided
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if the user is already verified
    if (user.is_verified)
      return res.status(400).json({ error: "User already verified" });

    // Send verification email
    const verificationToken = generateUserVerificationToken(user);
    sendVerificationEmail(user.email, verificationToken);

    // Send response
    res.status(200).json({
      ok: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An unknown error occurred while sending the verification email",
    });
  }
};

export const updateUserController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { name, first_lastname, second_lastname, display_name } = req.body;
  const user = req.user as UserWithoutPassword;

  if (!user?.id) {
    return res.status(401).json({
      ok: false,
      error: "User not authenticated",
    });
  }

  if (!name || !first_lastname || !second_lastname || !display_name) {
    return res.status(400).json({
      ok: false,
      error:
        "Name, first lastname, second lastname and display name are required",
    });
  }

  try {
    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser) {
      return res.status(404).json({
        ok: false,
        error: "User not found",
      });
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        first_lastname,
        second_lastname,
        display_name,
        updated_at: new Date(),
      },
      select: {
        id: true,
        account_number: true,
        email: true,
        name: true,
        first_lastname: true,
        second_lastname: true,
        display_name: true,
        image: true,
        role: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(200).json({
      ok: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      error: "An unknown error occurred during user update",
    });
  }
};

export const getUserProfileController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const user = req.user as UserWithoutPassword;

  if (!user?.id) {
    return res.status(401).json({
      ok: false,
      error: "User not authenticated",
    });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        account_number: true,
        email: true,
        name: true,
        first_lastname: true,
        second_lastname: true,
        display_name: true,
        image: true,
        role: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        ok: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      ok: true,
      message: "User profile retrieved successfully",
      data: userProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      error: "An unknown error occurred while retrieving user profile",
    });
  }
};
