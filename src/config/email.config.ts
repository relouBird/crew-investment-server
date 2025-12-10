import { createTransport } from "nodemailer";

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

