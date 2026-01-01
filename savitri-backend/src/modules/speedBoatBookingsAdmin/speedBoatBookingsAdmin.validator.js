// src/modules/speedBoatsAdmin/speedBoatsAdmin.validator.js

const { z } = require('zod');

/**
 * Query schema for listing speed boats
 */
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

/**
 * Create speed boat schema
 */
const createSpeedBoatSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  model: z.string().max(100).optional(),
  description: z.string().optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(50),
  hourlyRate: z.number().min(0, 'Hourly rate must be non-negative'),
  taxRate: z.number().min(0).max(100).default(18),
  taxType: z.enum(['inclusive', 'exclusive']).default('exclusive'),
  minDuration: z.number().min(0.5, 'Minimum duration must be at least 0.5 hours').default(1),
  advanceBookingDays: z.number().int().min(0).default(0),
  operatingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  }).refine((hours) => {
    const startMin = parseInt(hours.start.split(':')[0]) * 60 + parseInt(hours.start.split(':')[1]);
    const endMin = parseInt(hours.end.split(':')[0]) * 60 + parseInt(hours.end.split(':')[1]);
    return endMin > startMin;
  }, {
    message: 'End time must be after start time',
  }),
  features: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
  })).optional(),
  safetyInfo: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
});

/**
 * Update speed boat schema
 */
const updateSpeedBoatSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  model: z.string().max(100).optional(),
  description: z.string().optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  hourlyRate: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxType: z.enum(['inclusive', 'exclusive']).optional(),
  minDuration: z.number().min(0.5).optional(),
  advanceBookingDays: z.number().int().min(0).optional(),
  operatingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  }).refine((hours) => {
    const startMin = parseInt(hours.start.split(':')[0]) * 60 + parseInt(hours.start.split(':')[1]);
    const endMin = parseInt(hours.end.split(':')[0]) * 60 + parseInt(hours.end.split(':')[1]);
    return endMin > startMin;
  }, {
    message: 'End time must be after start time',
  }).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional(),
  safetyInfo: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
});

module.exports = {
  querySchema,
  createSpeedBoatSchema,
  updateSpeedBoatSchema,
};