import { Request, Response, NextFunction } from 'express';
import Maintenance from '../models/Maintenance';
import Equipment from '../models/Equipment';
import EquipmentStatus from '../models/EquipmentStatus';
import User from '../models/User';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all maintenance records
export const getAllMaintenances = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (req.query.equipmentId) {
      whereClause.equipment_id = req.query.equipmentId;
    }
    if (req.query.technicianId) {
      whereClause.technician_id = req.query.technicianId;
    }
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.priority) {
      whereClause.priority = req.query.priority;
    }

    const { count, rows } = await Maintenance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'reference'],
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        maintenances: rows,
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

// Get maintenance by ID
export const getMaintenanceById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const maintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
      ],
    });

    if (!maintenance) {
      throw new NotFoundError('Maintenance record not found');
    }

    res.json({
      success: true,
      data: {
        maintenance,
      },
    });
  }
);

// Create maintenance record
export const createMaintenance = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const {
      equipment_id,
      problem_description,
      technician_id,
      priority = 'MOYENNE',
      start_date,
      expected_end_date,
      photos,
    } = req.body;

    // Verify equipment exists
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    // Verify technician exists
    const technician = await User.findByPk(technician_id);
    if (!technician) {
      throw new NotFoundError('Technician not found');
    }

    // Create maintenance
    const maintenance = await Maintenance.create({
      equipment_id,
      problem_description,
      technician_id,
      priority,
      start_date,
      expected_end_date: expected_end_date || undefined,
      photos: photos || undefined,
      status: 'EN_ATTENTE',
    });

    // Update equipment status to EN_MAINTENANCE
    const maintenanceQuantity = equipment.quantity_available;
    await equipment.update({
      quantity_available: 0, // All available items go to maintenance
    });

    // Create equipment status entry
    await EquipmentStatus.create({
      equipment_id,
      status: 'EN_MAINTENANCE',
      quantity: maintenanceQuantity,
      related_maintenance_id: maintenance.id,
      changed_by: req.user.id,
      notes: `Equipment sent for maintenance: ${problem_description}`,
    });

    // Fetch with relations
    const maintenanceWithRelations = await Maintenance.findByPk(maintenance.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: {
        maintenance: maintenanceWithRelations,
      },
    });
  }
);

// Update maintenance record
export const updateMaintenance = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const updateData: any = {};

    const maintenance = await Maintenance.findByPk(id);
    if (!maintenance) {
      throw new NotFoundError('Maintenance record not found');
    }

    const allowedFields = [
      'problem_description',
      'technician_id',
      'priority',
      'expected_end_date',
      'actual_end_date',
      'cost',
      'status',
      'solution_description',
      'photos',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Verify technician if being updated
    if (updateData.technician_id) {
      const technician = await User.findByPk(updateData.technician_id);
      if (!technician) {
        throw new NotFoundError('Technician not found');
      }
    }

    await maintenance.update(updateData);

    // Fetch updated maintenance
    const updatedMaintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: {
        maintenance: updatedMaintenance,
      },
    });
  }
);

// Complete maintenance
export const completeMaintenance = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const id = req.params.id as string;
    const { actual_end_date, cost, solution_description, photos } = req.body;

    const maintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
      ],
    });

    if (!maintenance) {
      throw new NotFoundError('Maintenance record not found');
    }

    if (maintenance.status === 'TERMINE') {
      throw new ValidationError('Maintenance is already completed');
    }

    // Update maintenance
    await maintenance.update({
      status: 'TERMINE',
      actual_end_date: actual_end_date || new Date(),
      cost: cost || undefined,
      solution_description,
      photos: photos || maintenance.photos,
    });

    // Update equipment status back to DISPONIBLE
    const equipment = (maintenance as any).equipment;
    await equipment.update({
      quantity_available: equipment.quantity_total, // All items available again
    });

    // Create equipment status entry
    await EquipmentStatus.create({
      equipment_id: equipment.id,
      status: 'DISPONIBLE',
      quantity: equipment.quantity_total,
      related_maintenance_id: maintenance.id,
      changed_by: req.user.id,
      notes: `Maintenance completed: ${solution_description}`,
    });

    // Fetch updated maintenance
    const updatedMaintenance = await Maintenance.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Maintenance completed successfully',
      data: {
        maintenance: updatedMaintenance,
      },
    });
  }
);

// Delete maintenance record
export const deleteMaintenance = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const maintenance = await Maintenance.findByPk(id);
    if (!maintenance) {
      throw new NotFoundError('Maintenance record not found');
    }

    // Only allow deletion if not completed
    if (maintenance.status === 'TERMINE') {
      throw new ValidationError('Cannot delete completed maintenance record');
    }

    await maintenance.destroy();

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  }
);
