import { createTransport } from "nodemailer";

// Prototype qui gere avec MAILDEV....
//---------------------------------
export const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
});

// // Prototype qui gere avec GMAIL....
// //---------------------------------
// export const gmail_transporter = createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_SMTP_APP_USER,
//     pass: process.env.GMAIL_SMTP_APP_KEY,
//   },
// });

// Prototype qui gere avec MON SERVER....
//---------------------------------
export const hoster_transporter = createTransport({
  host: 'mailer.mon-ndem.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.PLANET_HOSTER_SMTP_APP_USER,
    pass: process.env.PLANET_HOSTER_SMTP_APP_KEY,
  },
});

