// src/modules/settings/settings.validator.js

const { z } = require('zod');

// Settings are flexible config objects stored as MongoDB Mixed type.
// Frontend sends { key: 'config', value: { ...settings } } wrapper.
// Validators accept this wrapper format with permissive inner validation,
// since these are admin-only routes behind auth + role check.

const settingsPayloadSchema = z.object({
  key: z.string().optional(),
  value: z.record(z.unknown()).optional(),
}).passthrough();

const generalSettingsSchema = settingsPayloadSchema;
const billingSettingsSchema = settingsPayloadSchema;
const bookingSettingsSchema = settingsPayloadSchema;
const notificationSettingsSchema = settingsPayloadSchema;
const contentSettingsSchema = settingsPayloadSchema;

module.exports = {
  generalSettingsSchema,
  billingSettingsSchema,
  bookingSettingsSchema,
  notificationSettingsSchema,
  contentSettingsSchema,
};
