const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.SMTP_PORT || 587);
const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
const senderName = process.env.SENDER_NAME || 'HireAI';

if (!process.env.SENDER_EMAIL) {
  console.warn('Email warning: SENDER_EMAIL is not set. Falling back to SMTP_USER as the From address can hurt deliverability.');
}

if (process.env.SENDER_EMAIL && /@(gmail|yahoo|outlook|hotmail|icloud)\./i.test(process.env.SENDER_EMAIL)) {
  console.warn('Email warning: SENDER_EMAIL uses a public email domain. Prefer a verified business-domain sender in Brevo for reliable delivery.');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.senderEmail = senderEmail;
transporter.senderName = senderName;

module.exports = transporter;
