const { z } = require('zod');

const createBoatSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  baseRate: z.number().min(0, 'Base rate must be positive'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

const updateBoatSchema = z.object({
  name: z.string().min(2).optional(),
  registrationNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  baseRate: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

const boatQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

module.exports = {
  createBoatSchema,
  updateBoatSchema,
  boatQuerySchema,
};
