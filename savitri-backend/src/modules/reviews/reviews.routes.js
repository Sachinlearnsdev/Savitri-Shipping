const express = require('express');
const reviewsController = require('./reviews.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const {
  createReviewSchema,
  approveReviewSchema,
  publicReviewQuerySchema,
  adminReviewQuerySchema,
} = require('./reviews.validator');

// ===== ADMIN ROUTES =====
const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.get('/', roleCheck('reviews', 'view'), validateQuery(adminReviewQuerySchema), reviewsController.getAdminReviews);
adminRouter.get('/stats', roleCheck('reviews', 'view'), reviewsController.getReviewStats);
adminRouter.get('/boat-aggregation', roleCheck('reviews', 'view'), reviewsController.getBoatReviewsAggregation);
adminRouter.get('/:id', roleCheck('reviews', 'view'), reviewsController.getById);
adminRouter.patch('/:id/approve', roleCheck('reviews', 'edit'), validate(approveReviewSchema), reviewsController.approveReview);
adminRouter.delete('/:id', roleCheck('reviews', 'delete'), reviewsController.deleteReview);

// ===== PUBLIC ROUTES =====
const publicRouter = express.Router();

// No auth required - get approved reviews
publicRouter.get('/', validateQuery(publicReviewQuerySchema), reviewsController.getPublicReviews);

// Optional auth - submit a review (authenticated users get isVerified=true)
publicRouter.post('/', (req, res, next) => {
  const authMiddleware = require('../../middleware/auth');
  authMiddleware(req, res, (err) => {
    // Ignore auth errors - allow guest reviews
    next();
  });
}, validate(createReviewSchema), reviewsController.createReview);

module.exports = { adminRouter, publicRouter };
