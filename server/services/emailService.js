import nodemailer from 'nodemailer';

/**
 * Email Service
 * Supports development console logging (instant & reliable without external creds)
 * and production Nodemailer SMTP transport.
 */
class EmailService {
  constructor() {
    this.mode = process.env.EMAIL_MODE || 'dev';
    this.transporter = null;

    if (this.mode === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  /**
   * Send OTP Email
   * @param {string} to - Recipient email
   * @param {string} otp - 6-digit numeric OTP
   * @param {string} purpose - 'signup_verification' | 'login_2fa' | 'password_reset'
   */
  async sendOtpEmail(to, otp, purpose = 'signup_verification') {
    const titles = {
      signup_verification: 'Verify Your MeethaCart Account',
      login_2fa: 'Your MeethaCart Login OTP',
      password_reset: 'Reset Your MeethaCart Password'
    };

    const title = titles[purpose] || 'Your MeethaCart Security Code';

    // In DEV mode, print in console with prominent banner for easy testing
    if (this.mode === 'dev') {
      console.log('\n======================================================');
      console.log(`[EMAIL SERVICE - DEV MODE]`);
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${title}`);
      console.log(`PURPOSE: ${purpose}`);
      console.log(`OTP:     >>> ${otp} <<< (Valid for 5 minutes)`);
      console.log('======================================================\n');
      return { success: true, mode: 'dev' };
    }

    // SMTP Mode
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FDFBF7;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #B45309; margin: 0; font-size: 26px;">MeethaCart 🍰</h1>
          <p style="color: #78350F; margin: 4px 0 0 0; font-size: 14px;">Homemade & Artisanal Bakery Marketplace</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 8px; border: 1px solid #F3EDE4;">
          <h2 style="color: #1F2937; margin-top: 0; font-size: 18px;">${title}</h2>
          <p style="color: #4B5563; line-height: 1.5; font-size: 14px;">Use the 6-digit security code below to proceed. This code is valid for <strong>5 minutes</strong> and can only be used once.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #B45309; background-color: #FEF3C7; padding: 12px 28px; border-radius: 8px; border: 1px dashed #F59E0B;">
              ${otp}
            </span>
          </div>
          <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 0;">If you did not request this code, please ignore this email. Never share your OTP with anyone.</p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"MeethaCart Bakery" <no-reply@meethacart.com>',
        to,
        subject: `${title} - MeethaCart`,
        html
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[EmailService] SMTP send error:', error.message);
      throw new Error('Failed to send verification email. Please check SMTP settings.');
    }
  }
}

export const emailService = new EmailService();
