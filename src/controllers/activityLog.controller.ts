import { Request, Response, NextFunction } from 'express';
import ActivityLog from '../models/ActivityLog';
import User from '../models/User';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all activity logs (Admin only)
export const getAllActivityLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Only admins can view all logs
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can view all activity logs');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (req.query.userId) {
      whereClause.user_id = req.query.userId;
    }
    if (req.query.action) {
      whereClause.action = req.query.action;
    }
    if (req.query.entityType) {
      whereClause.entity_type = req.query.entityType;
    }
    if (req.query.entityId) {
      whereClause.entity_id = req.query.entityId;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      whereClause.created_at = {};
      if (req.query.dateFrom) {
        whereClause.created_at[Op.gte] = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo as string);
        dateTo.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = dateTo;
      }
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
          required: false,
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  }
);

// Get activity log by ID
export const getActivityLogById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can view activity logs');
    }

    const id = req.params.id as string;

    const log = await ActivityLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    if (!log) {
      throw new NotFoundError('Activity log not found');
    }

    res.json({
      success: true,
      data: {
        log,
      },
    });
  }
);

// Get user activity logs
export const getUserActivityLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;

    // Users can only view their own logs, admins can view any user's logs
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      throw new ForbiddenError('You can only view your own activity logs');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const whereClause: any = { user_id: userId };
    if (req.query.action) {
      whereClause.action = req.query.action;
    }
    if (req.query.entityType) {
      whereClause.entity_type = req.query.entityType;
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  }
);

// Get entity activity logs
export const getEntityActivityLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const entityType = req.params.entityType as string;
    const entityId = req.params.entityId as string;

    const logs = await ActivityLog.findAll({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        logs,
      },
    });
  }
);

// Export activity logs (Admin only)
export const exportActivityLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can export activity logs');
    }

    const whereClause: any = {};
    if (req.query.userId) {
      whereClause.user_id = req.query.userId;
    }
    if (req.query.action) {
      whereClause.action = req.query.action;
    }
    if (req.query.entityType) {
      whereClause.entity_type = req.query.entityType;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      whereClause.created_at = {};
      if (req.query.dateFrom) {
        whereClause.created_at[Op.gte] = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo as string);
        dateTo.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = dateTo;
      }
    }

    const logs = await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Convert to CSV format
    const csvHeader = 'ID,User,Action,Entity Type,Entity ID,Description,IP Address,Date\n';
    const csvRows = logs.map((log) => {
      const user = (log as any).user;
      const userName = user ? `${user.full_name} (${user.email})` : 'System';
      return [
        log.id,
        userName,
        log.action,
        log.entity_type,
        log.entity_id || '',
        (log.description || '').replace(/"/g, '""'),
        log.ip_address || '',
        log.created_at?.toISOString() || '',
      ]
        .map((field) => `"${field}"`)
        .join(',');
    });

    const csv = csvHeader + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  }
);
