const express = require('express');
const inquiriesController = require('./inquiries.controller');
const adminAuth = require('../../middleware/adminAuth');
const auth = require('../../middleware/auth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const {
  createInquirySchema,
  quoteInquirySchema,
  respondInquirySchema,
  inquiryQuerySchema,
} = require('./inquiries.validator');

// ===== ADMIN ROUTES =====
const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.get('/', roleCheck('inquiries', 'view'), validateQuery(inquiryQuerySchema), inquiriesController.getAll);
adminRouter.get('/:id', roleCheck('inquiries', 'view'), inquiriesController.getById);
adminRouter.patch('/:id/quote', roleCheck('inquiries', 'edit'), validate(quoteInquirySchema), inquiriesController.sendQuote);
adminRouter.patch('/:id/convert', roleCheck('inquiries', 'edit'), inquiriesController.convertToBooking);
adminRouter.delete('/:id', roleCheck('inquiries', 'delete'), inquiriesController.delete);

// ===== PUBLIC ROUTES =====
const publicRouter = express.Router();

// No auth required - guest can submit inquiry
publicRouter.post('/', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authMiddleware = require('../../middleware/auth');
  authMiddleware(req, res, (err) => {
    // Ignore auth errors - allow guest inquiries
    next();
  });
}, validate(createInquirySchema), inquiriesController.create);

// Auth required
publicRouter.get('/my-inquiries', auth, inquiriesController.getMyInquiries);
publicRouter.get('/:id', auth, inquiriesController.getMyInquiryById);
publicRouter.patch('/:id/respond', auth, validate(respondInquirySchema), inquiriesController.respondToQuote);
publicRouter.post('/:id/callback-request', auth, inquiriesController.addCallbackRequest);

module.exports = { adminRouter, publicRouter };
