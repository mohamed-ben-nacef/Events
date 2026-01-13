import { Request, Response, NextFunction } from 'express';
import Vehicle from '../models/Vehicle';
import Transport from '../models/Transport';
import Event from '../models/Event';
import User from '../models/User';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

// Get all vehicles
export const getAllVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const whereClause: any = {};
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.type) {
      whereClause.type = req.query.type;
    }

    const vehicles = await Vehicle.findAll({
      where: whereClause,
      order: [['registration_number', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        vehicles,
      },
    });
  }
);

// Get vehicle by ID
export const getVehicleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: Transport,
          as: 'transports',
          include: [
            {
              model: Event,
              as: 'event',
              attributes: ['id', 'event_name', 'event_date'],
            },
            {
              model: User,
              as: 'driver',
              attributes: ['id', 'full_name', 'email'],
            },
          ],
        },
      ],
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    res.json({
      success: true,
      data: {
        vehicle,
      },
    });
  }
);

// Create vehicle
export const createVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      registration_number,
      type,
      brand,
      model,
      load_capacity_kg,
      cargo_dimensions,
      photo_url,
      insurance_expiry,
      technical_inspection_expiry,
      fuel_type,
      current_mileage = 0,
    } = req.body;

    // Check if registration number already exists
    const existingVehicle = await Vehicle.findOne({
      where: { registration_number: { [Op.iLike]: registration_number } },
    });

    if (existingVehicle) {
      throw new ConflictError('Vehicle with this registration number already exists');
    }

    const vehicle = await Vehicle.create({
      registration_number,
      type,
      brand,
      model,
      load_capacity_kg,
      cargo_dimensions: cargo_dimensions || undefined,
      photo_url: photo_url || undefined,
      insurance_expiry: insurance_expiry || undefined,
      technical_inspection_expiry: technical_inspection_expiry || undefined,
      fuel_type: fuel_type || undefined,
      current_mileage,
      status: 'DISPONIBLE',
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicle,
      },
    });
  }
);

// Update vehicle
export const updateVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const updateData: any = {};

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const allowedFields = [
      'registration_number',
      'type',
      'brand',
      'model',
      'load_capacity_kg',
      'cargo_dimensions',
      'photo_url',
      'insurance_expiry',
      'technical_inspection_expiry',
      'fuel_type',
      'current_mileage',
      'status',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Check registration number uniqueness if being updated
    if (updateData.registration_number && updateData.registration_number !== vehicle.registration_number) {
      const existingVehicle = await Vehicle.findOne({
        where: {
          registration_number: { [Op.iLike]: updateData.registration_number },
          id: { [Op.ne]: id },
        },
      });

      if (existingVehicle) {
        throw new ConflictError('Vehicle with this registration number already exists');
      }
    }

    await vehicle.update(updateData);

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: {
        vehicle,
      },
    });
  }
);

// Delete vehicle
export const deleteVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: Transport,
          as: 'transports',
          required: false,
        },
      ],
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    // Check if vehicle has active transports
    const activeTransports = (vehicle as any).transports?.filter(
      (t: Transport) => t.status !== 'TERMINE'
    );

    if (activeTransports && activeTransports.length > 0) {
      throw new ValidationError(
        `Cannot delete vehicle. It has ${activeTransports.length} active transport(s).`
      );
    }

    await vehicle.destroy();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  }
);

// Get all transports
export const getAllTransports = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const whereClause: any = {};
    if (req.query.eventId) {
      whereClause.event_id = req.query.eventId;
    }
    if (req.query.vehicleId) {
      whereClause.vehicle_id = req.query.vehicleId;
    }
    if (req.query.driverId) {
      whereClause.driver_id = req.query.driverId;
    }
    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    const transports = await Transport.findAll({
      where: whereClause,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'event_name', 'event_date'],
        },
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
      ],
      order: [['departure_date', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        transports,
      },
    });
  }
);

// Get transport by ID
export const getTransportById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const transport = await Transport.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'full_name', 'email', 'phone'],
        },
      ],
    });

    if (!transport) {
      throw new NotFoundError('Transport not found');
    }

    res.json({
      success: true,
      data: {
        transport,
      },
    });
  }
);

// Create transport
export const createTransport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      event_id,
      vehicle_id,
      driver_id,
      departure_address,
      arrival_address,
      departure_date,
      return_date,
      departure_mileage,
      total_weight_kg,
    } = req.body;

    // Verify event exists
    const event = await Event.findByPk(event_id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Verify vehicle exists and is available
    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.status !== 'DISPONIBLE') {
      throw new ValidationError(`Vehicle is not available. Current status: ${vehicle.status}`);
    }

    // Verify driver exists
    const driver = await User.findByPk(driver_id);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    if (!driver.is_active) {
      throw new ValidationError('Driver account is not active');
    }

    // Validate weight if provided
    if (total_weight_kg && total_weight_kg > vehicle.load_capacity_kg) {
      throw new ValidationError(
        `Total weight (${total_weight_kg} kg) exceeds vehicle capacity (${vehicle.load_capacity_kg} kg)`
      );
    }

    // Create transport
    const transport = await Transport.create({
      event_id,
      vehicle_id,
      driver_id,
      departure_address,
      arrival_address,
      departure_date,
      return_date: return_date || undefined,
      departure_mileage: departure_mileage || vehicle.current_mileage,
      total_weight_kg: total_weight_kg || undefined,
      status: 'PLANIFIE',
    });

    // Update vehicle status to EN_SERVICE
    await vehicle.update({
      status: 'EN_SERVICE',
    });

    // Fetch with relations
    const transportWithRelations = await Transport.findByPk(transport.id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Transport created successfully',
      data: {
        transport: transportWithRelations,
      },
    });
  }
);

// Update transport status
export const updateTransportStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { status, arrival_mileage, return_date, fuel_cost, incidents, notes } = req.body;

    const transport = await Transport.findByPk(id, {
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
        },
      ],
    });

    if (!transport) {
      throw new NotFoundError('Transport not found');
    }

    const updateData: any = { status };
    if (arrival_mileage !== undefined) updateData.arrival_mileage = arrival_mileage;
    if (return_date !== undefined) updateData.return_date = return_date;
    if (fuel_cost !== undefined) updateData.fuel_cost = fuel_cost;
    if (incidents !== undefined) updateData.incidents = incidents;
    if (notes !== undefined) updateData.notes = notes;

    await transport.update(updateData);

    // Fetch updated transport
    const updatedTransport = await Transport.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: User,
          as: 'driver',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Transport status updated successfully',
      data: {
        transport: updatedTransport,
      },
    });
  }
);

// Complete transport
export const completeTransport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { return_date, arrival_mileage, fuel_cost, incidents, notes } = req.body;

    const transport = await Transport.findByPk(id, {
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
        },
      ],
    });

    if (!transport) {
      throw new NotFoundError('Transport not found');
    }

    const vehicle = (transport as any).vehicle;

    // Update transport
    const updateData: any = {
      status: 'TERMINE',
      return_date: return_date || new Date(),
    };

    if (arrival_mileage !== undefined) {
      updateData.arrival_mileage = arrival_mileage;
      // Update vehicle mileage
      const mileageDifference = arrival_mileage - (transport.departure_mileage || vehicle.current_mileage);
      await vehicle.update({
        current_mileage: vehicle.current_mileage + mileageDifference,
      });
    }

    if (fuel_cost !== undefined) updateData.fuel_cost = fuel_cost;
    if (incidents !== undefined) updateData.incidents = incidents;
    if (notes !== undefined) updateData.notes = notes;

    await transport.update(updateData);

    // Update vehicle status back to DISPONIBLE
    await vehicle.update({
      status: 'DISPONIBLE',
    });

    // Fetch updated transport
    const updatedTransport = await Transport.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: Vehicle,
          as: 'vehicle',
        },
        {
          model: User,
          as: 'driver',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Transport completed successfully',
      data: {
        transport: updatedTransport,
      },
    });
  }
);

// Delete transport
export const deleteTransport = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const transport = await Transport.findByPk(id);
    if (!transport) {
      throw new NotFoundError('Transport not found');
    }

    // Only allow deletion if not completed
    if (transport.status === 'TERMINE') {
      throw new ValidationError('Cannot delete completed transport');
    }

    // Update vehicle status if transport is deleted
    const vehicle = await Vehicle.findByPk(transport.vehicle_id);
    if (vehicle) {
      await vehicle.update({ status: 'DISPONIBLE' });
    }

    await transport.destroy();

    res.json({
      success: true,
      message: 'Transport deleted successfully',
    });
  }
);
