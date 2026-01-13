import { APP_URL, APP_NAME } from '../config/email';

export interface RegistrationEmailData {
  fullName: string;
  email: string;
  verificationToken?: string;
}

export interface PasswordResetEmailData {
  fullName: string;
  email: string;
  resetToken: string;
}

export interface EmailVerificationData {
  fullName: string;
  email: string;
  verificationToken: string;
}

/**
 * Registration success email template
 */
export const getRegistrationEmailTemplate = (data: RegistrationEmailData): string => {
  const verificationLink = data.verificationToken
    ? `${APP_URL}/verify-email?token=${data.verificationToken}`
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${APP_NAME}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .highlight {
          color: #2563eb;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
        </div>
        <div class="content">
          <h2>Welcome, ${data.fullName}!</h2>
          <p>Thank you for creating an account with ${APP_NAME}. Your account has been successfully created.</p>
          <p>Your account details:</p>
          <ul>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Status:</strong> <span class="highlight">Active</span></li>
          </ul>
          ${verificationLink ? `
          <p>To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${verificationLink}</p>
          ` : `
          <p>You can now log in to your account and start using our services.</p>
          `}
        </div>
        <div class="footer">
          <p>If you did not create this account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Password reset email template
 */
export const getPasswordResetEmailTemplate = (data: PasswordResetEmailData): string => {
  const resetLink = `${APP_URL}/reset-password?token=${data.resetToken}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #dc2626;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #b91c1c;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .token {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 10px;
          border-radius: 4px;
          word-break: break-all;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${data.fullName},</p>
          <p>We received a request to reset your password for your account associated with <strong>${data.email}</strong>.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <ul>
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you did not request this password reset, please ignore this email</li>
              <li>Your password will not change until you create a new one</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <p class="token">${resetLink}</p>
        </div>
        <div class="footer">
          <p>If you did not request a password reset, please contact support immediately.</p>
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email verification template
 */
export const getEmailVerificationTemplate = (data: EmailVerificationData): string => {
  const verificationLink = `${APP_URL}/verify-email?token=${data.verificationToken}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email Address</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #10b981;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #059669;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hello ${data.fullName},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${verificationLink}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you did not create an account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Password changed notification template
 */
export const getPasswordChangedTemplate = (data: { fullName: string; email: string }): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
        </div>
        <div class="content">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${data.fullName},</p>
          <p>Your password has been successfully changed for your account <strong>${data.email}</strong>.</p>
          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>If you did not make this change, please contact our support team immediately to secure your account.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
