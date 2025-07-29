import { createTransport } from "nodemailer";
import { Resend } from "resend";

// Prototype qui gere avec MAILDEV....
//---------------------------------
export const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
});

// Prototype qui gere avec GMAIL....
//---------------------------------
export const gmail_transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_SMTP_APP_USER,
    pass: process.env.GMAIL_SMTP_APP_KEY,
  },
});

// Prototype qui gere avec Resend....
//---------------------------------
export const resend = new Resend(process.env.RESEND_API_KEY);
