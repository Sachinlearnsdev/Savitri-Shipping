// src/modules/savedVehicles/savedVehicles.validator.js

const { z } = require('zod');

const createVehicleSchema = z.object({
  type: z.enum(['CAR', 'BIKE', 'CYCLE']),
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  registrationNo: z.string().optional(),
  nickname: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateVehicleSchema = z.object({
  type: z.enum(['CAR', 'BIKE', 'CYCLE']).optional(),
  brand: z.string().min(2, 'Brand must be at least 2 characters').optional(),
  model: z.string().min(2, 'Model must be at least 2 characters').optional(),
  registrationNo: z.string().optional(),
  nickname: z.string().optional(),
  isDefault: z.boolean().optional(),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
};