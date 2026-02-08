const { Coupon } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class CouponsService {
  /**
   * Get all coupons (admin - paginated)
   */
  async list(query) {
    const { page, limit, search, isActive, applicableTo } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (applicableTo) {
      filter.applicableTo = applicableTo;
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    return {
      coupons: formatDocuments(coupons),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get coupon by ID
   */
  async getById(id) {
    const coupon = await Coupon.findOne({ _id: id, isDeleted: false }).lean();

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    return formatDocument(coupon);
  }

  /**
   * Create coupon
   */
  async create(data) {
    // Auto-uppercase the code
    data.code = data.code.toUpperCase();

    const existing = await Coupon.findOne({
      code: data.code,
      isDeleted: false,
    });

    if (existing) {
      throw ApiError.conflict('A coupon with this code already exists');
    }

    const coupon = await Coupon.create(data);
    return formatDocument(coupon.toObject());
  }

  /**
   * Update coupon
   */
  async update(id, data) {
    const coupon = await Coupon.findOne({ _id: id, isDeleted: false });

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    // Can't change code if coupon has been used
    if (data.code && data.code.toUpperCase() !== coupon.code && coupon.usageCount > 0) {
      throw ApiError.badRequest('Cannot change coupon code after it has been used');
    }

    // Auto-uppercase code if provided
    if (data.code) {
      data.code = data.code.toUpperCase();

      // Check uniqueness if code is being changed
      if (data.code !== coupon.code) {
        const existing = await Coupon.findOne({
          code: data.code,
          isDeleted: false,
          _id: { $ne: id },
        });

        if (existing) {
          throw ApiError.conflict('A coupon with this code already exists');
        }
      }
    }

    Object.assign(coupon, data);
    await coupon.save();

    return formatDocument(coupon.toObject());
  }

  /**
   * Soft delete coupon
   */
  async softDelete(id) {
    const coupon = await Coupon.findOne({ _id: id, isDeleted: false });

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    coupon.isDeleted = true;
    coupon.deletedAt = new Date();
    await coupon.save();

    return { message: 'Coupon deleted successfully' };
  }

  /**
   * Toggle coupon active status
   */
  async toggleActive(id) {
    const coupon = await Coupon.findOne({ _id: id, isDeleted: false });

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return formatDocument(coupon.toObject());
  }
}

module.exports = new CouponsService();
