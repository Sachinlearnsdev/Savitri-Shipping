// src/modules/speedBoats/speedBoats.service.js

const { SpeedBoat } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');

class SpeedBoatsService {
  /**
   * Get all active speed boats (public)
   */
  async getAll(query) {
    const { page, limit, sort, capacity } = query;
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    const filter = { status: 'ACTIVE' };

    // Filter by capacity
    if (capacity) {
      filter.capacity = { $gte: parseInt(capacity) };
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price_asc') {
      sortOption = { hourlyRate: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { hourlyRate: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    } else if (sort === 'name_desc') {
      sortOption = { name: -1 };
    }

    const [speedBoats, total] = await Promise.all([
      SpeedBoat.find(filter)
        .select('name model description capacity hourlyRate taxRate taxType minDuration operatingHours features images')
        .skip(skip)
        .limit(take)
        .sort(sortOption)
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
   * Get single speed boat by ID (public)
   */
  async getById(id) {
    const speedBoat = await SpeedBoat.findOne({ _id: id, status: 'ACTIVE' })
      .select('-createdBy -updatedBy')
      .lean();

    if (!speedBoat) {
      throw ApiError.notFound('Speed boat not found or not available');
    }

    return formatDocument(speedBoat);
  }
}

module.exports = new SpeedBoatsService();