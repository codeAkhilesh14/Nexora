import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(process.env.RESEND_API_KEY || env.resendApiKey);

export const sendMail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Nexora <noreply@codepanda.me>',
      to: [to],
      subject,
      html
    });

    if (error) {
      console.error('[Email Service] Resend Error:', error);
      throw new Error(error.message || 'Resend Error');
    }

    console.log('[Email Service] Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export const sendOTPEmail = (to, otp) => sendMail({
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

