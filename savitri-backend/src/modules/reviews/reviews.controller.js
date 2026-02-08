const reviewsService = require('./reviews.service');
const ApiResponse = require('../../utils/ApiResponse');

class ReviewsController {
  // ===== PUBLIC =====

  async getPublicReviews(req, res, next) {
    try {
      const { reviews, pagination } = await reviewsService.getPublicReviews(req.query);
      res.json(ApiResponse.paginated(reviews, pagination, 'Reviews retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async createReview(req, res, next) {
    try {
      const data = { ...req.body };

      // Attach customerId if user is authenticated
      if (req.customer) {
        data.customerId = req.customer.id;
        data.isVerified = true;
      }

      const review = await reviewsService.createReview(data);
      res.status(201).json(ApiResponse.created('Review submitted successfully', review));
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN =====

  async getAdminReviews(req, res, next) {
    try {
      const { reviews, pagination } = await reviewsService.getAdminReviews(req.query);
      res.json(ApiResponse.paginated(reviews, pagination, 'Reviews retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const review = await reviewsService.getById(req.params.id);
      res.json(ApiResponse.success('Review retrieved', review));
    } catch (error) {
      next(error);
    }
  }

  async approveReview(req, res, next) {
    try {
      const review = await reviewsService.approveReview(req.params.id, req.body.approved);
      const message = req.body.approved ? 'Review approved' : 'Review rejected';
      res.json(ApiResponse.success(message, review));
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const result = await reviewsService.softDelete(req.params.id);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewsController();
