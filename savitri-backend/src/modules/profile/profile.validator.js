// src/modules/profile/profile.validator.js

const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema, otpSchema } = require('../../utils/validators');

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateEmailSchema = z.object({
  email: emailSchema,
});

const verifyEmailChangeSchema = z.object({
  otp: otpSchema,
});

const updatePhoneSchema = z.object({
  phone: phoneSchema,
});

const verifyPhoneChangeSchema = z.object({
  otp: otpSchema,
});

const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  promotionalEmails: z.boolean().optional(),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  updateEmailSchema,
  verifyEmailChangeSchema,
  updatePhoneSchema,
  verifyPhoneChangeSchema,
  updateNotificationPreferencesSchema,
};