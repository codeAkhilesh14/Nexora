import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

// Initialize SMTP transporter
if (env.smtp.host && env.smtp.user && env.smtp.pass) {
  const isGmail = env.smtp.host.includes('gmail.com');
  transporter = nodemailer.createTransport(isGmail ? {
    service: 'gmail',
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  } : {
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('[Email Service] SMTP Connection Failed:', error.message);
    } else {
      console.log('[Email Service] SMTP Connection Successful');
    }
  });
} else {
  console.warn('[Email Service] SMTP not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
}

export const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    const errorMsg = 'SMTP not configured. Cannot send email: ' + subject + ' to ' + to;
    console.error('[Email Service]', errorMsg);
    throw new Error(errorMsg);
  }
  try {
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export const sendOtpEmail = (to, otp) => sendMail({
  to,
  subject: 'Verify your Nexora campus email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Welcome to Nexora! Your verification code is:</p>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This code expires in <b>10 minutes</b>. Do not share it with anyone.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
    </div>
  `
});

export const sendResetPasswordOtpEmail = (to, otp) => sendMail({
  to,
  subject: 'Reset your Nexora password',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Your password reset code is:</p>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This code expires in <b>10 minutes</b>. Do not share it with anyone.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
    </div>
  `
});

