import { createTransport } from "nodemailer";
import { Resend } from "resend";

export const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
});

export const resend = new Resend(process.env.RESEND_API_KEY);
