const express = require('express');
const router = express.Router();
const couponsController = require('./coupons.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { createCouponSchema, updateCouponSchema, couponQuerySchema } = require('./coupons.validator');

// All routes require admin auth
router.use(adminAuth);

router.get('/', roleCheck('coupons', 'view'), validateQuery(couponQuerySchema), couponsController.list);
router.get('/:id', roleCheck('coupons', 'view'), couponsController.getById);
router.post('/', roleCheck('coupons', 'create'), validate(createCouponSchema), couponsController.create);
router.put('/:id', roleCheck('coupons', 'edit'), validate(updateCouponSchema), couponsController.update);
router.delete('/:id', roleCheck('coupons', 'delete'), couponsController.softDelete);
router.patch('/:id/toggle-active', roleCheck('coupons', 'edit'), couponsController.toggleActive);

module.exports = router;
