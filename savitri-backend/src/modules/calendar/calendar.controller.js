const calendarService = require('./calendar.service');
const ApiResponse = require('../../utils/ApiResponse');

class CalendarController {
  async getCalendar(req, res, next) {
    try {
      const entries = await calendarService.getCalendar(req.query);
      res.json(ApiResponse.success('Calendar retrieved', entries));
    } catch (error) {
      next(error);
    }
  }

  async updateDay(req, res, next) {
    try {
      const entry = await calendarService.updateDay(req.body, req.adminUserId);
      res.json(ApiResponse.success('Calendar updated', entry));
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdate(req, res, next) {
    try {
      const entries = await calendarService.bulkUpdate(req.body.dates, req.adminUserId);
      res.json(ApiResponse.success('Calendar bulk updated', entries));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalendarController();
