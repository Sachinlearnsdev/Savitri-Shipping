const calendarService = require('./calendar.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

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

  async getWeather(req, res, next) {
    try {
      const { month } = req.query;
      if (!month) {
        throw ApiError.badRequest('month query parameter is required (format: YYYY-MM)');
      }
      const data = await calendarService.getWeather(month);
      res.json(ApiResponse.success('Weather data retrieved', data));
    } catch (error) {
      next(error);
    }
  }

  async getCurrentWeather(req, res, next) {
    try {
      const data = await calendarService.getCurrentWeather();
      res.json(ApiResponse.success('Current weather data retrieved', data));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalendarController();
