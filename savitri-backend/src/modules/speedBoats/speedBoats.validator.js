// src/modules/speedBoats/speedBoats.validator.js

const { z } = require('zod');

/**
 * Query schema for listing speed boats
 */
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc']).optional(),
  capacity: z.string().optional(),
});

module.exports = {
  querySchema,
};