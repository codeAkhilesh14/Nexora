<<<<<<< HEAD
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

if (env.smtp.user && env.smtp.pass) {
  console.log('[SMTP CONFIG]', {
    host: 'smtp.gmail.com',
    port: 465,
    user: env.smtp.user,
    from: env.smtp.from
  });

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
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
=======
import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(process.env.RESEND_API_KEY || env.resendApiKey);

export const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Nexora <noreply@codepanda.me>',
      to: [to],
>>>>>>> 8ae9cd6 (Replaced SMTP with Resend)
      subject,
      html,
    });

<<<<<<< HEAD
    console.log('[Email Service] Email sent:', info.messageId);
=======
    if (error) {
      console.error('[Email Service] Resend Error:', error);
      throw new Error(error.message || 'Resend Error');
    }

    console.log('[Email Service] Email sent successfully:', data);
>>>>>>> 8ae9cd6 (Replaced SMTP with Resend)
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error);
    throw error;
  }
};

<<<<<<< HEAD
export const sendOtpEmail = async (to, otp) => {
  return sendMail({
    to,
    subject: 'Verify your Nexora account',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
=======
export const sendOTPEmail = (to, otp) => sendMail({
  to,
  subject: 'Verify your Nexora campus email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Welcome to Nexora! Your verification code is:</p>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
>>>>>>> 8ae9cd6 (Replaced SMTP with Resend)
      </div>
    `
  });
};

<<<<<<< HEAD
export const sendResetPasswordOtpEmail = async (to, otp) => {
  return sendMail({
    to,
    subject: 'Reset your Nexora password',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `
  });
};
=======
// Keep original camelCase sendOtpEmail export for backward compatibility
export const sendOtpEmail = sendOTPEmail;

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


>>>>>>> 8ae9cd6 (Replaced SMTP with Resend)
