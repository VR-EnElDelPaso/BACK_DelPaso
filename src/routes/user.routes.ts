import { Router, Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/new", async (req: Request, res: Response) => {
  const { account_number, name, display_name, email, password, role } = req.body;

  if (!name || !display_name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and include both letters and numbers',
    });
  }

  try {
    let existingUser;

    if (role === "STUDENT") {
      if (!account_number) {
        throw new Error("Account number is missing");
      }
      existingUser = await prisma.user.findUnique({
        where: { account_number },
      });
    } else {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User registration failed' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        account_number,
        name,
        display_name,
        email,
        password: hashedPassword,
        role
      }
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

export default router;