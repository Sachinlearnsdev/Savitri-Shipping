const { z } = require('zod');

const addOnSchema = z.object({
  type: z.enum(['CATERING_VEG', 'CATERING_NONVEG', 'LIVE_BAND', 'PHOTOGRAPHER', 'DECORATION_STANDARD']),
  label: z.string().min(1, 'Add-on label is required'),
  price: z.number().min(0, 'Price must be positive'),
  priceType: z.enum(['FIXED', 'PER_PERSON']).optional(),
});

const createPartyBoatSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  capacityMin: z.number().int().min(1, 'Minimum capacity must be at least 1'),
  capacityMax: z.number().int().min(1, 'Maximum capacity must be at least 1'),
  locationOptions: z.array(z.enum(['HARBOR', 'CRUISE'])).min(1, 'At least one location option required'),
  basePrice: z.number().min(0, 'Base price must be positive'),
  operatingStartTime: z.string().optional(),
  operatingEndTime: z.string().optional(),
  timeSlots: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'])).optional(),
  eventTypes: z.array(z.enum(['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'])).optional(),
  addOns: z.array(addOnSchema).optional(),
  djIncluded: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

const updatePartyBoatSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  capacityMin: z.number().int().min(1).optional(),
  capacityMax: z.number().int().min(1).optional(),
  locationOptions: z.array(z.enum(['HARBOR', 'CRUISE'])).optional(),
  basePrice: z.number().min(0).optional(),
  operatingStartTime: z.string().optional(),
  operatingEndTime: z.string().optional(),
  timeSlots: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'])).optional(),
  eventTypes: z.array(z.enum(['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'])).optional(),
  addOns: z.array(addOnSchema).optional(),
  djIncluded: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

const partyBoatQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

module.exports = {
  createPartyBoatSchema,
  updatePartyBoatSchema,
  partyBoatQuerySchema,
};
