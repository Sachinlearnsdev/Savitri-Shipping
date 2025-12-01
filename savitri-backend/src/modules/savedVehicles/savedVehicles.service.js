// src/modules/savedVehicles/savedVehicles.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

class SavedVehiclesService {
  /**
   * Get all saved vehicles for a customer
   */
  async getAll(customerId) {
    const vehicles = await prisma.savedVehicle.findMany({
      where: { customerId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return vehicles;
  }

  /**
   * Get vehicle by ID
   */
  async getById(customerId, vehicleId) {
    const vehicle = await prisma.savedVehicle.findFirst({
      where: {
        id: vehicleId,
        customerId,
      },
    });

    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    return vehicle;
  }

  /**
   * Create saved vehicle
   */
  async create(customerId, data) {
    const { type, brand, model, registrationNo, nickname, isDefault } = data;

    // If setting as default, remove default from others
    if (isDefault) {
      await prisma.savedVehicle.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const vehicle = await prisma.savedVehicle.create({
      data: {
        customerId,
        type,
        brand,
        model,
        registrationNo,
        nickname,
        isDefault: isDefault || false,
      },
    });

    return vehicle;
  }

  /**
   * Update saved vehicle
   */
  async update(customerId, vehicleId, data) {
    // Check if vehicle exists and belongs to customer
    const existingVehicle = await prisma.savedVehicle.findFirst({
      where: {
        id: vehicleId,
        customerId,
      },
    });

    if (!existingVehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await prisma.savedVehicle.updateMany({
        where: {
          customerId,
          isDefault: true,
          id: { not: vehicleId },
        },
        data: { isDefault: false },
      });
    }

    const vehicle = await prisma.savedVehicle.update({
      where: { id: vehicleId },
      data,
    });

    return vehicle;
  }

  /**
   * Delete saved vehicle
   */
  async delete(customerId, vehicleId) {
    // Check if vehicle exists and belongs to customer
    const vehicle = await prisma.savedVehicle.findFirst({
      where: {
        id: vehicleId,
        customerId,
      },
    });

    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    await prisma.savedVehicle.delete({
      where: { id: vehicleId },
    });

    return { message: 'Vehicle deleted successfully' };
  }
}

module.exports = new SavedVehiclesService();