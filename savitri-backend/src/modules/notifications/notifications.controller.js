const notificationsService = require('./notifications.service');
const ApiResponse = require('../../utils/ApiResponse');

class NotificationsController {
  async getCounts(req, res, next) {
    try {
      const counts = await notificationsService.getCounts();
      res.json(ApiResponse.success('Notification counts retrieved', counts));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationsController();
