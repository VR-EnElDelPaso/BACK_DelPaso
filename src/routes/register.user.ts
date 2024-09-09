import { Router, Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/register", async (req: Request, res: Response)=>{
    const {account_number, name, display_name, email, password, type} = req.body;
    
    if (!account_number || !name || !display_name || !email || !password || !type) {
        return res.status(400).json({ error: 'Todos los campos son necesarios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato invalido' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { account_number },
        });
        
        if (existingUser) {
            return res.status(400).json({ error: '' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data:{
                account_number,
                name,
                display_name,
                email,
                password: hashedPassword,
                type
            }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

export default router;