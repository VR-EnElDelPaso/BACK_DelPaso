import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para puerto 465, false para 587
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión con el servidor SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying SMTP server", error);
  } else {
    console.log("SMTP server ready");
  }
});

export const sender = `${process.env.SMTP_USER}`;