const { SpeedBoat } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class SpeedBoatsService {
  /**
   * Get all boats (admin - paginated)
   */
  async getAll(query) {
    const { page, limit, search, status } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [boats, total] = await Promise.all([
      SpeedBoat.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      SpeedBoat.countDocuments(filter),
    ]);

    return {
      boats: formatDocuments(boats),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get active boats (public listing)
   */
  async getActiveBoats() {
    const boats = await SpeedBoat.find({ status: 'ACTIVE', isDeleted: false })
      .select('name capacity description images baseRate')
      .sort({ name: 1 })
      .lean();

    return formatDocuments(boats);
  }

  /**
   * Get boat by ID
   */
  async getById(id) {
    const boat = await SpeedBoat.findOne({ _id: id, isDeleted: false }).lean();

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    return formatDocument(boat);
  }

  /**
   * Create boat
   */
  async create(data) {
    const existing = await SpeedBoat.findOne({
      registrationNumber: data.registrationNumber,
      isDeleted: false,
    });

    if (existing) {
      throw ApiError.conflict('A boat with this registration number already exists');
    }

    const boat = await SpeedBoat.create(data);
    return formatDocument(boat.toObject());
  }

  /**
   * Update boat
   */
  async update(id, data) {
    const boat = await SpeedBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    if (data.registrationNumber && data.registrationNumber !== boat.registrationNumber) {
      const existing = await SpeedBoat.findOne({
        registrationNumber: data.registrationNumber,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existing) {
        throw ApiError.conflict('A boat with this registration number already exists');
      }
    }

    Object.assign(boat, data);
    await boat.save();

    return formatDocument(boat.toObject());
  }

  /**
   * Delete boat (soft delete)
   */
  async delete(id) {
    const boat = await SpeedBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    boat.isDeleted = true;
    boat.deletedAt = new Date();
    await boat.save();

    return { message: 'Speed boat deleted successfully' };
  }

  /**
   * Upload images for a boat
   */
  async uploadImages(id, files) {
    const boat = await SpeedBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files uploaded');
    }

    const imageUrls = files.map(file => `/uploads/${file.filename}`);
    boat.images = [...(boat.images || []), ...imageUrls];
    await boat.save();

    return formatDocument(boat.toObject());
  }

  /**
   * Remove an image from a boat
   */
  async removeImage(id, imageUrl) {
    const boat = await SpeedBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    boat.images = (boat.images || []).filter(img => img !== imageUrl);
    await boat.save();

    return formatDocument(boat.toObject());
  }

  /**
   * Get count of active boats (for availability)
   */
  async getActiveCount() {
    return SpeedBoat.countDocuments({ status: 'ACTIVE', isDeleted: false });
  }
}

module.exports = new SpeedBoatsService();
