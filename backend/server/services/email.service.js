import dns from 'node:dns';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

dns.setDefaultResultOrder('ipv4first');

let transporter = null;

if (env.smtp.user && env.smtp.pass) {
  console.log('[SMTP CONFIG]', {
    host: 'smtp.gmail.com',
    port: 587,
    user: env.smtp.user,
    from: env.smtp.from
  });

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify()
    .then(() => {
      console.log('[Email Service] SMTP Connection Successful');
    })
    .catch((error) => {
      console.error('[Email Service] SMTP Connection Failed:', error);
    });
}

export const sendMail = async ({ to, subject, html }) => {
  try {
    console.log(`[Email Service] Sending email to ${to}`);

    const info = await transporter.sendMail({
      from: env.smtp.from || env.smtp.user,
      to,
      subject,
      html
    });

    console.log('[Email Service] Email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error(
      `[Email Service] Failed to send email to ${to}:`,
      error
    );
    throw error;
  }
};

export const sendOtpEmail = async (to, otp) => {
  return sendMail({
    to,
    subject: 'Verify your Nexora account',
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `
  });
};

export const sendResetPasswordOtpEmail = async (to, otp) => {
  return sendMail({
    to,
    subject: 'Reset your Nexora password',
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `
  });
};
