import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import { NotFoundError, ValidationError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';

// Get all users with filtering
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, is_active } = req.query;

    const whereClause: any = {};
    if (role) {
      if (Array.isArray(role)) {
        whereClause.role = { [Op.in]: role };
      } else {
        whereClause.role = role;
      }
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: {
        exclude: ['password_hash', 'refresh_token', 'reset_password_token', 'email_verification_token'],
      },
      order: [['full_name', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        users,
      },
    });
  }
);

// Get user by ID
export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['password_hash', 'refresh_token', 'reset_password_token', 'email_verification_token'],
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
