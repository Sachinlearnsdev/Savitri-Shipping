// src/modules/roles/roles.validator.js

const { z } = require('zod');

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.record(z.record(z.boolean())).refine(
    (permissions) => Object.keys(permissions).length > 0,
    { message: 'Permissions are required' }
  ),
});

const updateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').optional(),
  description: z.string().optional(),
  permissions: z.record(z.record(z.boolean())).optional(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
};