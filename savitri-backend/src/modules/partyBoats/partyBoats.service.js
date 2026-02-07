const { PartyBoat } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class PartyBoatsService {
  /**
   * Get all party boats (admin - paginated)
   */
  async getAll(query) {
    const { page, limit, search, status } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [boats, total] = await Promise.all([
      PartyBoat.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      PartyBoat.countDocuments(filter),
    ]);

    return {
      boats: formatDocuments(boats),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get active party boats (public listing)
   */
  async getActiveBoats() {
    const boats = await PartyBoat.find({ status: 'ACTIVE', isDeleted: false })
      .select('name description images capacityMin capacityMax locationOptions basePrice timeSlots eventTypes addOns djIncluded')
      .sort({ name: 1 })
      .lean();

    return formatDocuments(boats);
  }

  /**
   * Get party boat by ID
   */
  async getById(id) {
    const boat = await PartyBoat.findOne({ _id: id, isDeleted: false }).lean();

    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }

    return formatDocument(boat);
  }

  /**
   * Create party boat
   */
  async create(data) {
    const boat = await PartyBoat.create(data);
    return formatDocument(boat.toObject());
  }

  /**
   * Update party boat
   */
  async update(id, data) {
    const boat = await PartyBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }

    Object.assign(boat, data);
    await boat.save();

    return formatDocument(boat.toObject());
  }

  /**
   * Delete party boat (soft delete)
   */
  async delete(id) {
    const boat = await PartyBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }

    boat.isDeleted = true;
    boat.deletedAt = new Date();
    await boat.save();

    return { message: 'Party boat deleted successfully' };
  }

  /**
   * Upload images for a party boat
   */
  async uploadImages(id, files) {
    const boat = await PartyBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Party boat not found');
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
   * Remove an image from a party boat
   */
  async removeImage(id, imageUrl) {
    const boat = await PartyBoat.findOne({ _id: id, isDeleted: false });

    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }

    boat.images = (boat.images || []).filter(img => img !== imageUrl);
    await boat.save();

    return formatDocument(boat.toObject());
  }
}

module.exports = new PartyBoatsService();
