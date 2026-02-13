// src/modules/customers/customers.validator.js

const { z } = require('zod');

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED']).optional(),
  emailVerified: z.enum(['true', 'false']).optional(),
  phoneVerified: z.enum(['true', 'false']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']),
});

module.exports = {
  querySchema,
  updateStatusSchema,
};