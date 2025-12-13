// src/modules/savedVehicles/savedVehicles.service.js
const { SavedVehicle } = require("../../models");
const ApiError = require("../../utils/ApiError");
const {
  formatDocument,
  formatDocuments,
} = require("../../utils/responseFormatter");

class SavedVehiclesService {
  /**
   * Get all saved vehicles for a customer
   */
  async getAll(customerId) {
    const vehicles = await SavedVehicle.find({ customerId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return formatDocuments(vehicles);
  }

  /**
   * Get vehicle by ID
   */
  async getById(customerId, vehicleId) {
    const vehicle = await SavedVehicle.findOne({
      _id: vehicleId,
      customerId,
    }).lean();

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    return formatDocument(vehicle);
  }

  /**
   * Create saved vehicle
   */
  async create(customerId, data) {
    const { type, brand, model, registrationNo, nickname, isDefault } = data;

    // If setting as default, remove default from others
    if (isDefault) {
      await SavedVehicle.updateMany(
        { customerId, isDefault: true },
        { isDefault: false }
      );
    }

    const vehicle = await SavedVehicle.create({
      customerId,
      type,
      brand,
      model,
      registrationNo,
      nickname,
      isDefault: isDefault || false,
    });

    return formatDocument(vehicle.toObject());
  }

  /**
   * Update saved vehicle
   */
  async update(customerId, vehicleId, data) {
    // Check if vehicle exists and belongs to customer
    const existingVehicle = await SavedVehicle.findOne({
      _id: vehicleId,
      customerId,
    });

    if (!existingVehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await SavedVehicle.updateMany(
        {
          customerId,
          isDefault: true,
          _id: { $ne: vehicleId },
        },
        { isDefault: false }
      );
    }

    const vehicle = await SavedVehicle.findByIdAndUpdate(vehicleId, data, {
      new: true,
    }).lean();

    return formatDocument(vehicle);
  }

  /**
   * Delete saved vehicle
   */
  async delete(customerId, vehicleId) {
    // Check if vehicle exists and belongs to customer
    const vehicle = await SavedVehicle.findOne({
      _id: vehicleId,
      customerId,
    });

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    await SavedVehicle.findByIdAndDelete(vehicleId);

    return { message: "Vehicle deleted successfully" };
  }
}

module.exports = new SavedVehiclesService();
