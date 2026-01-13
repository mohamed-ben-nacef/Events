import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || 'noreply@audiovisual-manager.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const APP_NAME = process.env.APP_NAME || 'Audiovisual Event Manager';

// Create transporter
let transporter: nodemailer.Transporter;

if (SMTP_USER && SMTP_PASS) {
  // Production/real SMTP configuration
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // Development: Use test account (ethereal.email) or console logging
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  SMTP credentials not configured. Emails will be logged to console only.');
    // Create a mock transporter that logs instead of sending
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test',
      },
    });
  } else {
    throw new Error('SMTP credentials are required in production. Please set SMTP_USER and SMTP_PASS environment variables.');
  }
}

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    
    // Type guard for error with code property
    const errorWithCode = error as Error & { code?: string };
    
    // Provide helpful error messages for common issues
    if (errorWithCode.code === 'EAUTH') {
      console.error('\n⚠️  Authentication Error Detected:');
      if (error.message.includes('Application-specific password')) {
        console.error('📧 Gmail requires an App Password instead of your regular password.');
        console.error('   1. Go to: https://myaccount.google.com/apppasswords');
        console.error('   2. Generate an App Password for "Mail"');
        console.error('   3. Use that 16-character password in SMTP_PASS\n');
      } else {
        console.error('   Please check your SMTP_USER and SMTP_PASS in .env file');
        console.error('   Make sure credentials are correct for your email provider\n');
      }
    } else if (errorWithCode.code === 'ECONNECTION') {
      console.error('\n⚠️  Connection Error:');
      console.error('   Check your SMTP_HOST and SMTP_PORT settings');
      console.error('   Make sure your firewall/network allows SMTP connections\n');
    }
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    // If no SMTP credentials, just log the email in development
    if (!SMTP_USER || !SMTP_PASS) {
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 EMAIL (Not Sent - SMTP not configured):');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('---');
        console.log(mailOptions.text || 'HTML email (see HTML content)');
        console.log('---\n');
        return; // Don't actually send
      }
    }

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Email sent:', info.messageId);
      // Preview URL for ethereal.email
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
      }
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // In development, don't throw - just log
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Failed to send email');
    } else {
      console.warn('⚠️  Email sending failed, but continuing in development mode');
    }
  }
};

export { APP_URL, APP_NAME, EMAIL_FROM };
