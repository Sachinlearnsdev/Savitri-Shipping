const { Review } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class ReviewsService {
  /**
   * Get approved, non-deleted reviews (public)
   */
  async getPublicReviews(query) {
    const { type, boatId, page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isApproved: true, isDeleted: false };

    if (type) {
      filter.reviewType = type;
    }

    if (boatId) {
      filter.boatId = boatId;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews: formatDocuments(reviews),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Create a new review
   */
  async createReview(data) {
    // Set boatModel based on reviewType
    if (data.reviewType === 'SPEED_BOAT') {
      data.boatModel = 'SpeedBoat';
    } else if (data.reviewType === 'PARTY_BOAT') {
      data.boatModel = 'PartyBoat';
    }

    // If reviewType is COMPANY, remove boatId and boatModel
    if (data.reviewType === 'COMPANY') {
      delete data.boatId;
      delete data.boatModel;
    }

    // Validate that boat reviews have a boatId
    if ((data.reviewType === 'SPEED_BOAT' || data.reviewType === 'PARTY_BOAT') && !data.boatId) {
      throw ApiError.badRequest('boatId is required for boat reviews');
    }

    const review = await Review.create(data);
    return formatDocument(review.toObject());
  }

  /**
   * Get all reviews with filters (admin)
   */
  async getAdminReviews(query) {
    const { page, limit, search, type, isApproved } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (type) {
      if (type.includes(',')) {
        filter.reviewType = { $in: type.split(',').map(t => t.trim()) };
      } else {
        filter.reviewType = type;
      }
    }

    if (isApproved !== undefined && isApproved !== '') {
      filter.isApproved = isApproved === 'true';
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews: formatDocuments(reviews),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get single review by ID
   */
  async getById(id) {
    const review = await Review.findOne({ _id: id, isDeleted: false }).lean();

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    return formatDocument(review);
  }

  /**
   * Approve or reject a review
   */
  async approveReview(id, approved) {
    const review = await Review.findOne({ _id: id, isDeleted: false });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    review.isApproved = approved;
    await review.save();

    return formatDocument(review.toObject());
  }

  /**
   * Soft delete a review
   */
  async softDelete(id) {
    const review = await Review.findOne({ _id: id, isDeleted: false });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    review.isDeleted = true;
    review.deletedAt = new Date();
    await review.save();

    return { message: 'Review deleted successfully' };
  }
}

module.exports = new ReviewsService();
