import { Request, Response, NextFunction } from 'express';
import Equipment from '../models/Equipment';
import EquipmentStatus from '../models/EquipmentStatus';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import User from '../models/User';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { generateEquipmentReference } from '../utils/referenceGenerator';
import { Op } from 'sequelize';

// Get all equipment with pagination and filtering
export const getAllEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (req.query.categoryId) {
      whereClause.category_id = req.query.categoryId;
    }
    if (req.query.subcategoryId) {
      whereClause.subcategory_id = req.query.subcategoryId;
    }
    if (req.query.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { reference: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    // Build status filter (if needed, we'd need to join with equipment_status)
    // For now, we'll filter by quantity_available
    if (req.query.status === 'DISPONIBLE') {
      whereClause.quantity_available = { [Op.gt]: 0 };
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
        {
          model: Subcategory,
          as: 'subcategory',
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
        equipment: rows,
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

// Get equipment by ID
export const getEquipmentById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          required: true,
        },
        {
          model: Subcategory,
          as: 'subcategory',
          required: false,
        },
        {
          model: EquipmentStatus,
          as: 'status_history',
          required: false,
          include: [
            {
              model: User,
              as: 'changer',
              attributes: ['id', 'full_name', 'email'],
            },
          ],
          order: [['changed_at', 'DESC']],
          limit: 10, // Last 10 status changes
        },
      ],
    });

    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    res.json({
      success: true,
      data: {
        equipment,
      },
    });
  }
);

// Create equipment
export const createEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      category_id,
      subcategory_id,
      brand,
      model,
      description,
      technical_specs,
      quantity_total = 0,
      purchase_price,
      daily_rental_price,
      purchase_date,
      warranty_end_date,
      supplier,
      weight_kg,
      qr_code_url,
      photos,
      manual_url,
    } = req.body;

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Verify subcategory exists if provided
    if (subcategory_id) {
      const subcategory = await Subcategory.findByPk(subcategory_id);
      if (!subcategory) {
        throw new NotFoundError('Subcategory not found');
      }
      // Verify subcategory belongs to category
      if (subcategory.category_id !== category_id) {
        throw new ValidationError('Subcategory does not belong to the specified category');
      }
    }

    // Generate unique reference
    const reference = await generateEquipmentReference(category_id);

    // Create equipment
    const equipment = await Equipment.create({
      name,
      reference,
      category_id,
      subcategory_id: subcategory_id || undefined,
      brand: brand || undefined,
      model: model || undefined,
      description: description || undefined,
      technical_specs: technical_specs || undefined,
      quantity_total,
      quantity_available: quantity_total, // Initially all available
      purchase_price: purchase_price || undefined,
      daily_rental_price: daily_rental_price || undefined,
      purchase_date: purchase_date || undefined,
      warranty_end_date: warranty_end_date || undefined,
      supplier: supplier || undefined,
      weight_kg: weight_kg || undefined,
      qr_code_url: qr_code_url || undefined,
      photos: photos || undefined,
      manual_url: manual_url || undefined,
    });

    // Create initial status entry
    if (req.user) {
      await EquipmentStatus.create({
        equipment_id: equipment.id,
        status: quantity_total > 0 ? 'DISPONIBLE' : 'MANQUANT',
        quantity: quantity_total,
        changed_by: req.user.id,
        notes: 'Initial equipment creation',
      });
    }

    // Fetch with relations
    const equipmentWithRelations = await Equipment.findByPk(equipment.id, {
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Subcategory,
          as: 'subcategory',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: {
        equipment: equipmentWithRelations,
      },
    });
  }
);

// Update equipment
export const updateEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const updateData: any = {};

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    // Build update data
    const allowedFields = [
      'name',
      'category_id',
      'subcategory_id',
      'brand',
      'model',
      'description',
      'technical_specs',
      'quantity_total',
      'purchase_price',
      'daily_rental_price',
      'purchase_date',
      'warranty_end_date',
      'supplier',
      'weight_kg',
      'qr_code_url',
      'photos',
      'manual_url',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Verify category if being updated
    if (updateData.category_id) {
      const category = await Category.findByPk(updateData.category_id);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    // Verify subcategory if being updated
    if (updateData.subcategory_id) {
      const subcategory = await Subcategory.findByPk(updateData.subcategory_id);
      if (!subcategory) {
        throw new NotFoundError('Subcategory not found');
      }
      // Verify subcategory belongs to category
      const targetCategoryId = updateData.category_id || equipment.category_id;
      if (subcategory.category_id !== targetCategoryId) {
        throw new ValidationError('Subcategory does not belong to the specified category');
      }
    }

    // If quantity_total is being updated, recalculate quantity_available
    if (updateData.quantity_total !== undefined) {
      const currentRented = equipment.quantity_total - equipment.quantity_available;
      const newAvailable = Math.max(0, updateData.quantity_total - currentRented);
      updateData.quantity_available = newAvailable;
    }

    await equipment.update(updateData);

    // Fetch updated equipment with relations
    const updatedEquipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Subcategory,
          as: 'subcategory',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: {
        equipment: updatedEquipment,
      },
    });
  }
);

// Delete equipment
export const deleteEquipment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    // Check if equipment is currently in use (has active status entries)
    const activeStatus = await EquipmentStatus.findOne({
      where: {
        equipment_id: id,
        status: { [Op.in]: ['EN_LOCATION', 'EN_MAINTENANCE'] },
      },
    });

    if (activeStatus) {
      throw new ValidationError(
        'Cannot delete equipment. It is currently in use (rented or under maintenance).'
      );
    }

    await equipment.destroy();

    res.json({
      success: true,
      message: 'Equipment deleted successfully',
    });
  }
);

// Get equipment status history
export const getEquipmentStatusHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    const statusHistory = await EquipmentStatus.findAll({
      where: { equipment_id: id },
      include: [
        {
          model: User,
          as: 'changer',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['changed_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        equipment: {
          id: equipment.id,
          name: equipment.name,
          reference: equipment.reference,
        },
        status_history: statusHistory,
      },
    });
  }
);

// Update equipment status
export const updateEquipmentStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { status, quantity, related_event_id, related_maintenance_id, notes } = req.body;

    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    // Validate quantity
    if (quantity < 0) {
      throw new ValidationError('Quantity must be non-negative');
    }

    if (quantity > equipment.quantity_available && status === 'EN_LOCATION') {
      throw new ValidationError(
        `Cannot reserve ${quantity} items. Only ${equipment.quantity_available} available.`
      );
    }

    // Create status history entry
    const statusEntry = await EquipmentStatus.create({
      equipment_id: id,
      status,
      quantity,
      related_event_id: related_event_id || undefined,
      related_maintenance_id: related_maintenance_id || undefined,
      notes: notes || undefined,
      changed_by: req.user.id,
    });

    // Update equipment quantity_available based on status
    let newAvailable = equipment.quantity_available;

    if (status === 'EN_LOCATION' || status === 'EN_MAINTENANCE') {
      newAvailable = Math.max(0, equipment.quantity_available - quantity);
    } else if (status === 'DISPONIBLE') {
      // Returning equipment
      newAvailable = Math.min(
        equipment.quantity_total,
        equipment.quantity_available + quantity
      );
    }
    // MANQUANT doesn't change available quantity

    await equipment.update({
      quantity_available: newAvailable,
    });

    // Fetch updated equipment
    const updatedEquipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
        },
        {
          model: Subcategory,
          as: 'subcategory',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Equipment status updated successfully',
      data: {
        status: statusEntry,
        equipment: updatedEquipment,
      },
    });
  }
);
