// src/modules/adminUsers/adminUsers.validator.js

const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema } = require('../../utils/validators');

const createAdminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  roleId: z.string().min(1, 'Role is required'),
});

const updateAdminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  roleId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']),
});

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED']).optional(),
  roleId: z.string().optional(),
});

module.exports = {
  createAdminUserSchema,
  updateAdminUserSchema,
  updateStatusSchema,
  querySchema,
};