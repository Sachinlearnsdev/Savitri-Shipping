const speedBoatsService = require('./speedBoats.service');
const ApiResponse = require('../../utils/ApiResponse');

class SpeedBoatsController {
  async getAll(req, res, next) {
    try {
      const { boats, pagination } = await speedBoatsService.getAll(req.query);
      res.json(ApiResponse.paginated(boats, pagination, 'Speed boats retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getActiveBoats(req, res, next) {
    try {
      const boats = await speedBoatsService.getActiveBoats();
      res.json(ApiResponse.success('Active boats retrieved', boats));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const boat = await speedBoatsService.getById(req.params.id);
      res.json(ApiResponse.success('Speed boat retrieved', boat));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const boat = await speedBoatsService.create(req.body);
      res.status(201).json(ApiResponse.created('Speed boat created', boat));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const boat = await speedBoatsService.update(req.params.id, req.body);
      res.json(ApiResponse.success('Speed boat updated', boat));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await speedBoatsService.delete(req.params.id);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req, res, next) {
    try {
      const boat = await speedBoatsService.uploadImages(req.params.id, req.files);
      res.json(ApiResponse.success('Images uploaded', boat));
    } catch (error) {
      next(error);
    }
  }

  async removeImage(req, res, next) {
    try {
      const boat = await speedBoatsService.removeImage(req.params.id, req.body.imageUrl);
      res.json(ApiResponse.success('Image removed', boat));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeedBoatsController();
