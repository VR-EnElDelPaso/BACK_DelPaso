import prisma from "../prisma";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail, sendEmailResetSuccess } from "../mailtrap/email";

export const CreateUser = async (req: Request, res: Response) => {
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
    let existingUser;

    if(role === "WORKER"){
      validationWorker(account_number, email);
    }else if(role === "STUDENT"){
      validationStudent(account_number, email);
    }else if(role === "VISITOR"){
      validationVisitor(email);
    }else{
      return res.status(400).json({ error: 'Invalid user role' });
    }

    existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User registration failed' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        account_number,
        name,
        display_name,
        email,
        password: hashedPassword,
        role,
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000)

      }
    });
    sendVerificationEmail(email, verificationToken);
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'An unknown error occurred during user creation' });
  }
};

function validationWorker(account_number: number, email: string){
  if(!account_number){
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

function validationStudent(account_number: number, email: string){
  if(!account_number){
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

function validationVisitor(email: string){
  const correoUCol = /^[a-zA-Z0-9._%+-]+@ucol\.mx$/;
  if (correoUCol.test(email)) {
    throw new Error("Insert a valid email address");
  }
}

export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Verification code is required",
        });
    }

    try {
        // Find the user with a valid verification code
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: code,
                verificationTokenExpiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        // Update the user to mark email as verified
        const updatedUser = await prisma.user.update({
            where: { id: user.id }, // Assuming `id` is the primary key (UUID) in your schema
            data: {
                is_verified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (error: any) {
        console.error("Error during email verification:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during verification",
            error: error.message,
        });
    }
};


export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
  
    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
      // Update user with reset token and expiry
      await prisma.user.update({
        where: { email },
        data: {
          verificationToken: hashedToken, // Assuming verificationToken is used for password reset
          verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
  
      // Send email with reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetLink);
  
      return res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and password are required" });
  }

  try {
    // Find the user with the provided token and valid expiry time
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token, // Using verificationToken as reset token based on your schema
        verificationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id }, // Assuming the primary key is `id`
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    // Send success email notification
    await sendEmailResetSuccess(user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Password reset error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    } else {
      console.error("An unknown error occurred:", error);
      return res.status(500).json({ success: false, message: "An unknown error occurred" });
    }
  }
};
