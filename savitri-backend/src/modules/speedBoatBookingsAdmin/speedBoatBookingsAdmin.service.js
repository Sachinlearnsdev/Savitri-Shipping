// src/modules/speedBoatsAdmin/speedBoatsAdmin.service.js

const { SpeedBoat } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');

class SpeedBoatsAdminService {
  /**
   * Get all speed boats (admin)
   */
  async getAll(query) {
    const { page, limit, search, status } = query;
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const [speedBoats, total] = await Promise.all([
      SpeedBoat.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      SpeedBoat.countDocuments(filter),
    ]);

    return {
      speedBoats: formatDocuments(speedBoats),
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }

  /**
   * Get speed boat by ID (admin)
   */
  async getById(id) {
    const speedBoat = await SpeedBoat.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!speedBoat) {
      throw ApiError.notFound('Speed boat not found');
    }

    return formatDocument(speedBoat);
  }

  /**
   * Create speed boat
   */
  async create(data, adminUserId) {
    const speedBoat = await SpeedBoat.create({
      ...data,
      createdBy: adminUserId,
      updatedBy: adminUserId,
    });

    return formatDocument(speedBoat.toObject());
  }

  /**
   * Update speed boat
   */
  async update(id, data, adminUserId) {
    const speedBoat = await SpeedBoat.findById(id);

    if (!speedBoat) {
      throw ApiError.notFound('Speed boat not found');
    }

    const updatedSpeedBoat = await SpeedBoat.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedBy: adminUserId,
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    return formatDocument(updatedSpeedBoat);
  }

  /**
   * Delete speed boat (soft delete)
   */
  async delete(id) {
    const speedBoat = await SpeedBoat.findById(id);

    if (!speedBoat) {
      throw ApiError.notFound('Speed boat not found');
    }

    const updatedSpeedBoat = await SpeedBoat.findByIdAndUpdate(
      id,
      { status: 'INACTIVE' },
      { new: true }
    )
      .select('id name status')
      .lean();

    return formatDocument(updatedSpeedBoat);
  }
}

module.exports = new SpeedBoatsAdminService();