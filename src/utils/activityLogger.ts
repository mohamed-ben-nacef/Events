import ActivityLog from '../models/ActivityLog';
import { Request } from 'express';

/**
 * Helper to get client IP
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.socket.remoteAddress as string) ||
    'unknown'
  );
};

/**
 * Helper to get user agent
 */
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Log an activity
 */
export const logActivity = async (
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  description?: string
): Promise<void> => {
  try {
    await ActivityLog.create({
      user_id: req.user?.id || undefined,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
    });
  } catch (error) {
    // Don't throw - logging should not break the application
    console.error('Failed to log activity:', error);
  }
};
