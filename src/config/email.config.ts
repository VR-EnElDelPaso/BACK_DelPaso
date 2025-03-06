/**
 * Configuración de Nodemailer para el envío de correos electrónicos.
 * 
 * Este módulo configura y exporta un `transporter` de Nodemailer
 * utilizando credenciales almacenadas en variables de entorno.
 * También incluye una verificación inicial de la conexión con el servidor SMTP.
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Creación del transportador de correo utilizando Nodemailer.
 * 
 * Se configuran los parámetros de conexión con el servidor SMTP,
 * incluyendo el host, el puerto y las credenciales de autenticación.
 * La opción `secure` está definida como `true` para el puerto 465
 * y `false` para el puerto 587.
 */
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

/**
 * Verificación de la conexión con el servidor SMTP.
 * 
 * Se ejecuta una verificación inicial para confirmar que la configuración
 * es válida y que el servidor está accesible.
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying SMTP server", error);
  } else {
    console.log("SMTP server ready");
  }
});

/**
 * Dirección de correo electrónico del remitente.
 * 
 * Se extrae de la variable de entorno `SMTP_USER`.
 */
export const sender = `${process.env.SMTP_USER}`;
