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

// Shared wrapper so both templates stay visually consistent
const buildEmailShell = ({ heading, intro, otp, footerNote, accent = '#6366F1' }) => `
  <div style="margin:0; padding:0; background-color:#f4f5f7; width:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.06); font-family:'Segoe UI', Arial, sans-serif;">

            <!-- Header / Brand -->
            <tr>
              <td style="background:linear-gradient(135deg, ${accent}, #4338CA); padding:28px 32px;">
                <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.5px;">Nexora</span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <h2 style="margin:0 0 12px 0; font-size:20px; color:#111827; font-weight:600;">${heading}</h2>
                <p style="margin:0; font-size:14px; line-height:22px; color:#4B5563;">${intro}</p>
              </td>
            </tr>

            <!-- OTP Block -->
            <tr>
              <td style="padding:24px 32px;">
                <div style="background-color:#F3F4F6; border:1px solid #E5E7EB; border-radius:12px; padding:20px; text-align:center;">
                  <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#111827;">${otp}</span>
                </div>
              </td>
            </tr>

            <!-- Expiry note -->
            <tr>
              <td style="padding:0 32px 8px 32px;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#6B7280;">
                  This code expires in <strong style="color:#111827;">10 minutes</strong>. Do not share it with anyone — Nexora staff will never ask for this code.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <hr style="border:none; border-top:1px solid #E5E7EB; margin:0;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px 32px 32px;">
                <p style="margin:0; font-size:12px; line-height:18px; color:#9CA3AF;">
                  ${footerNote}
                </p>
                <p style="margin:16px 0 0 0; font-size:12px; color:#D1D5DB;">
                  &copy; ${new Date().getFullYear()} Nexora. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`;

export const sendOTPEmail = (to, otp) => sendMail({
  to,
  subject: 'Verify your Nexora campus email',
  html: buildEmailShell({
    heading: 'Verify your email',
    intro: 'Welcome to Nexora! Use the verification code below to confirm your campus email address and activate your account.',
    otp,
    footerNote: "If you didn't request this code, you can safely ignore this email — no changes will be made to your account."
  })
});

// Keep original camelCase sendOtpEmail export for backward compatibility
export const sendOtpEmail = sendOTPEmail;

export const sendResetPasswordOtpEmail = (to, otp) => sendMail({
  to,
  subject: 'Reset your Nexora password',
  html: buildEmailShell({
    heading: 'Reset your password',
    intro: 'We received a request to reset your Nexora password. Enter the code below to continue.',
    otp,
    footerNote: "If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.",
    accent: '#DC2626'
  })
});