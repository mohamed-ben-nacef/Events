import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import {
  hashPassword,
  comparePassword,
} from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import {
  generateResetToken,
  generateEmailVerificationToken,
  hashToken,
} from '../utils/tokens';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { sendEmail } from '../config/email';
import {
  getRegistrationEmailTemplate,
  getPasswordResetEmailTemplate,
  getEmailVerificationTemplate,
  getPasswordChangedTemplate,
} from '../utils/emailTemplates';

// Helper to get client IP
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.socket.remoteAddress as string) ||
    'unknown'
  );
};

// Register new user
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, full_name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken();
    const hashedVerificationToken = hashToken(verificationToken);

    // Set verification token expiration (24 hours)
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone,
      role: role || 'TECHNICIEN',
      is_active: true,
      is_email_verified: false,
      email_verification_token: hashedVerificationToken,
      email_verification_expires: emailVerificationExpires,
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    await user.update({
      refresh_token: refreshToken,
      refresh_token_expires: refreshTokenExpires,
    });

    // Send welcome email with verification link
    try {
      const emailHtml = getRegistrationEmailTemplate({
        fullName: user.full_name,
        email: user.email,
        verificationToken: verificationToken, // Send unhashed token in email
      });

      await sendEmail({
        to: user.email,
        subject: `Welcome to ${process.env.APP_NAME || 'Audiovisual Event Manager'}`,
        html: emailHtml,
      });
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to send registration email:', emailError);
      // Continue with registration even if email fails
    }

    // Remove sensitive data from response
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: userResponse,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        // In development, return verification token for testing
        ...(process.env.NODE_ENV === 'development' && { verification_token: verificationToken }),
      },
    });
  }
);

// Login user
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token and update login info
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    const clientIp = getClientIp(req);

    await user.update({
      refresh_token: refreshToken,
      refresh_token_expires: refreshTokenExpires,
      last_login_at: new Date(),
      last_login_ip: clientIp,
    });

    // Remove sensitive data from response
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      profile_picture: user.profile_picture,
      role: user.role,
      is_email_verified: user.is_email_verified,
      last_login_at: user.last_login_at,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      },
    });
  }
);

// Refresh access token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    // Find user and verify refresh token matches
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    if (user.refresh_token !== refresh_token) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (user.refresh_token_expires && user.refresh_token_expires < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token in database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await user.update({
      refresh_token: newRefreshToken,
      refresh_token_expires: refreshTokenExpires,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      },
    });
  }
);

// Logout user
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await User.findByPk(req.user.id);
    if (user) {
      await user.update({
        refresh_token: undefined,
        refresh_token_expires: undefined,
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

// Get current user profile
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password_hash', 'refresh_token', 'reset_password_token'],
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  }
);

// Update user profile
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { full_name, phone, profile_picture } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update allowed fields
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;

    await user.update(updateData);

    // Fetch updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password_hash', 'refresh_token', 'reset_password_token'],
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  }
);

// Change password
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(current_password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await hashPassword(new_password);

    // Update password
    await user.update({ password_hash });

    // Send password changed notification email
    try {
      const emailHtml = getPasswordChangedTemplate({
        fullName: user.full_name,
        email: user.email,
      });

      await sendEmail({
        to: user.email,
        subject: 'Password Changed Successfully',
        html: emailHtml,
      });
    } catch (emailError) {
      // Log error but don't fail the password change
      console.error('Failed to send password changed notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);

// Forgot password - generate reset token
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Set token expiration (1 hour)
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    await user.update({
      reset_password_token: hashedToken,
      reset_password_expires: resetPasswordExpires,
    });

    // Send password reset email
    try {
      const emailHtml = getPasswordResetEmailTemplate({
        fullName: user.full_name,
        email: user.email,
        resetToken: resetToken, // Send unhashed token in email
      });

      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: emailHtml,
      });
    } catch (emailError) {
      // Log error but don't reveal if user exists
      console.error('Failed to send password reset email:', emailError);
      // Continue - we still return success for security
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, return token for testing
      ...(process.env.NODE_ENV === 'development' && { reset_token: resetToken }),
    });
  }
);

// Reset password with token
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    if (!token) {
      throw new ValidationError('Reset token is required');
    }

    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        reset_password_token: hashedToken,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Check if token is expired
    if (!user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new UnauthorizedError('Reset token has expired');
    }

    // Hash new password
    const password_hash = await hashPassword(password);

    // Update password and clear reset token
    await user.update({
      password_hash,
      reset_password_token: undefined,
      reset_password_expires: undefined,
    });

    // Send password changed notification email
    try {
      const emailHtml = getPasswordChangedTemplate({
        fullName: user.full_name,
        email: user.email,
      });

      await sendEmail({
        to: user.email,
        subject: 'Password Changed Successfully',
        html: emailHtml,
      });
    } catch (emailError) {
      // Log error but don't fail the password reset
      console.error('Failed to send password changed notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  }
);

// Verify email
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    const hashedToken = hashToken(token);

    // Find user with valid verification token
    const user = await User.findOne({
      where: {
        email_verification_token: hashedToken,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired verification token');
    }

    // Check if token is expired
    if (!user.email_verification_expires || user.email_verification_expires < new Date()) {
      throw new UnauthorizedError('Verification token has expired');
    }

    // Check if already verified
    if (user.is_email_verified) {
      throw new ValidationError('Email is already verified');
    }

    // Verify email and clear verification token
    await user.update({
      is_email_verified: true,
      email_verification_token: undefined,
      email_verification_expires: undefined,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  }
);

// Resend verification email
export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.is_email_verified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    const hashedVerificationToken = hashToken(verificationToken);

    // Set verification token expiration (24 hours)
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    // Update user with new verification token
    await user.update({
      email_verification_token: hashedVerificationToken,
      email_verification_expires: emailVerificationExpires,
    });

    // Send verification email
    try {
      const emailHtml = getEmailVerificationTemplate({
        fullName: user.full_name,
        email: user.email,
        verificationToken: verificationToken, // Send unhashed token in email
      });

      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      throw new Error('Failed to send verification email. Please try again later.');
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      // In development, return token for testing
      ...(process.env.NODE_ENV === 'development' && { verification_token: verificationToken }),
    });
  }
);
