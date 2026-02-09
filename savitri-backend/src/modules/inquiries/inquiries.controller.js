const inquiriesService = require('./inquiries.service');
const ApiResponse = require('../../utils/ApiResponse');

class InquiriesController {
  // ===== ADMIN =====

  async getAll(req, res, next) {
    try {
      const { inquiries, pagination } = await inquiriesService.getAll(req.query);
      res.json(ApiResponse.paginated(inquiries, pagination, 'Inquiries retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const inquiry = await inquiriesService.getById(req.params.id);
      res.json(ApiResponse.success('Inquiry retrieved', inquiry));
    } catch (error) {
      next(error);
    }
  }

  async sendQuote(req, res, next) {
    try {
      const inquiry = await inquiriesService.sendQuote(req.params.id, req.body);
      res.json(ApiResponse.success('Quote sent successfully', inquiry));
    } catch (error) {
      next(error);
    }
  }

  async convertToBooking(req, res, next) {
    try {
      const result = await inquiriesService.convertToBooking(req.params.id);
      res.json(ApiResponse.success('Inquiry converted to booking', result));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await inquiriesService.delete(req.params.id);
      res.json(ApiResponse.success('Inquiry deleted'));
    } catch (error) {
      next(error);
    }
  }

  // ===== PUBLIC =====

  async create(req, res, next) {
    try {
      const customerId = req.customerId || null;
      const inquiry = await inquiriesService.create(req.body, customerId);
      res.status(201).json(ApiResponse.created('Inquiry submitted successfully', inquiry));
    } catch (error) {
      next(error);
    }
  }

  async getMyInquiries(req, res, next) {
    try {
      const { inquiries, pagination } = await inquiriesService.getMyInquiries(req.customerId, req.query);
      res.json(ApiResponse.paginated(inquiries, pagination, 'Your inquiries retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getMyInquiryById(req, res, next) {
    try {
      const inquiry = await inquiriesService.getMyInquiryById(req.params.id, req.customerId);
      res.json(ApiResponse.success('Inquiry retrieved', inquiry));
    } catch (error) {
      next(error);
    }
  }

  async respondToQuote(req, res, next) {
    try {
      const inquiry = await inquiriesService.respondToQuote(
        req.params.id,
        req.customerId,
        req.body.response
      );
      res.json(ApiResponse.success('Response submitted successfully', inquiry));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InquiriesController();
