const express = require('express');
const router = express.Router();
const calendarController = require('./calendar.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { updateDaySchema, bulkUpdateSchema, calendarQuerySchema } = require('./calendar.validator');

router.use(adminAuth);

router.get('/weather', roleCheck('calendar', 'view'), calendarController.getWeather);
router.get('/', roleCheck('calendar', 'view'), validateQuery(calendarQuerySchema), calendarController.getCalendar);
router.put('/', roleCheck('calendar', 'edit'), validate(updateDaySchema), calendarController.updateDay);
router.put('/bulk', roleCheck('calendar', 'edit'), validate(bulkUpdateSchema), calendarController.bulkUpdate);

module.exports = router;
