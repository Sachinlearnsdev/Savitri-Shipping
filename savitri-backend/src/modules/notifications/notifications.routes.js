const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const adminAuth = require('../../middleware/adminAuth');

router.use(adminAuth);
router.get('/counts', notificationsController.getCounts);

module.exports = router;
