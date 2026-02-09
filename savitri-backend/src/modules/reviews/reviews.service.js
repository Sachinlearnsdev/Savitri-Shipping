const { Review, SpeedBoat, PartyBoat } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');
const { emitToAdmins } = require('../../utils/socket');

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

    // Emit real-time notification to admins
    try {
      let boatName = 'Company';
      if (data.boatId) {
        const Model = data.boatModel === 'SpeedBoat' ? SpeedBoat : PartyBoat;
        const boat = await Model.findById(data.boatId).select('name').lean();
        if (boat) boatName = boat.name;
      }
      emitToAdmins('new-review', {
        type: data.reviewType,
        boatName,
        rating: data.rating,
        customerName: data.customerName || 'Anonymous',
      });
    } catch (emitErr) {
      // Socket emit failure should not affect review creation
    }

    return formatDocument(review.toObject());
  }

  /**
   * Get all reviews with filters (admin)
   */
  async getAdminReviews(query) {
    const { page, limit, search, type, isApproved, boatId } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (type) {
      if (type.includes(',')) {
        filter.reviewType = { $in: type.split(',').map(t => t.trim()) };
      } else {
        filter.reviewType = type;
      }
    }

    if (boatId) {
      filter.boatId = boatId;
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

  /**
   * Get review stats for a given review type filter (admin)
   * Returns: total, average rating, rating distribution (1-5)
   */
  async getReviewStats(query) {
    const { type } = query;
    const filter = { isDeleted: false };

    if (type) {
      if (type.includes(',')) {
        filter.reviewType = { $in: type.split(',').map(t => t.trim()) };
      } else {
        filter.reviewType = type;
      }
    }

    const [stats] = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          approvedCount: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } },
          hiddenCount: { $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] } },
        },
      },
    ]);

    if (!stats) {
      return {
        total: 0,
        avgRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        approvedCount: 0,
        hiddenCount: 0,
      };
    }

    return {
      total: stats.total,
      avgRating: Math.round(stats.avgRating * 10) / 10,
      distribution: {
        1: stats.star1,
        2: stats.star2,
        3: stats.star3,
        4: stats.star4,
        5: stats.star5,
      },
      approvedCount: stats.approvedCount,
      hiddenCount: stats.hiddenCount,
    };
  }

  /**
   * Get aggregated boat review stats grouped by boatId (admin)
   * Returns array of boats with: boatId, boatName, boatImage, reviewCount, avgRating, totalRides
   */
  async getBoatReviewsAggregation(query) {
    const { type } = query;
    const filter = { isDeleted: false, boatId: { $exists: true, $ne: null } };

    if (type) {
      if (type.includes(',')) {
        filter.reviewType = { $in: type.split(',').map(t => t.trim()) };
      } else {
        filter.reviewType = type;
      }
    } else {
      // Default: all boat types
      filter.reviewType = { $in: ['SPEED_BOAT', 'PARTY_BOAT'] };
    }

    const aggregation = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { boatId: '$boatId', boatModel: '$boatModel' },
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          approvedCount: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } },
          hiddenCount: { $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] } },
        },
      },
      { $sort: { reviewCount: -1 } },
    ]);

    // Fetch boat details for each group
    const results = [];
    for (const group of aggregation) {
      const { boatId, boatModel } = group._id;
      let boatName = 'Unknown Boat';
      let boatImage = null;
      let boatType = boatModel === 'SpeedBoat' ? 'SPEED_BOAT' : 'PARTY_BOAT';

      try {
        const Model = boatModel === 'SpeedBoat' ? SpeedBoat : PartyBoat;
        const boat = await Model.findById(boatId).select('name images').lean();
        if (boat) {
          boatName = boat.name;
          boatImage = boat.images && boat.images.length > 0 ? boat.images[0] : null;
        }
      } catch {
        // Boat may have been deleted
      }

      results.push({
        boatId: boatId.toString(),
        boatName,
        boatImage,
        boatType,
        reviewCount: group.reviewCount,
        avgRating: Math.round(group.avgRating * 10) / 10,
        approvedCount: group.approvedCount,
        hiddenCount: group.hiddenCount,
      });
    }

    return results;
  }
}

module.exports = new ReviewsService();
