import { Router, Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../mailtrap/email";

const router = Router();

router.post("/new", async (req: Request, res: Response) => {
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
});

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

export default router;