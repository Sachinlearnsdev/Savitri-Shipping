const partyBoatsService = require('./partyBoats.service');
const ApiResponse = require('../../utils/ApiResponse');

class PartyBoatsController {
  async getAll(req, res, next) {
    try {
      const { boats, pagination } = await partyBoatsService.getAll(req.query);
      res.json(ApiResponse.paginated(boats, pagination, 'Party boats retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getActiveBoats(req, res, next) {
    try {
      const boats = await partyBoatsService.getActiveBoats();
      res.json(ApiResponse.success('Active party boats retrieved', boats));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const boat = await partyBoatsService.getById(req.params.id);
      res.json(ApiResponse.success('Party boat retrieved', boat));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const boat = await partyBoatsService.create(req.body);
      res.status(201).json(ApiResponse.created('Party boat created', boat));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const boat = await partyBoatsService.update(req.params.id, req.body);
      res.json(ApiResponse.success('Party boat updated', boat));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await partyBoatsService.delete(req.params.id);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req, res, next) {
    try {
      const boat = await partyBoatsService.uploadImages(req.params.id, req.files);
      res.json(ApiResponse.success('Images uploaded', boat));
    } catch (error) {
      next(error);
    }
  }

  async removeImage(req, res, next) {
    try {
      const boat = await partyBoatsService.removeImage(req.params.id, req.body.imageUrl);
      res.json(ApiResponse.success('Image removed', boat));
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const imageIndex = parseInt(req.params.imageIndex, 10);
      const boat = await partyBoatsService.deleteImage(req.params.id, imageIndex);
      res.json(ApiResponse.success('Image deleted', boat));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PartyBoatsController();
