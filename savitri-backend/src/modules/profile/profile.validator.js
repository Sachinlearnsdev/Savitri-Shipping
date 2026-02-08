// src/modules/profile/profile.validator.js

const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema, otpSchema } = require('../../utils/validators');

const addressSchema = z.object({
  line1: z.string().trim().optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
  country: z.string().trim().optional(),
}).optional();

const notificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  promotional: z.boolean().optional(),
}).optional();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  address: addressSchema,
  notificationPreferences: notificationPreferencesSchema,
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