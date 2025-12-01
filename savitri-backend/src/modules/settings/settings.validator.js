// src/modules/settings/settings.validator.js

const { z } = require('zod');
const { gstinSchema, panSchema } = require('../../utils/validators');

const generalSettingsSchema = z.object({
  companyName: z.string().min(2),
  companyAddress: z.string().min(5),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  websiteUrl: z.string().url().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
});

const billingSettingsSchema = z.object({
  companyLegalName: z.string().min(2),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  bankDetails: z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifscCode: z.string().optional(),
    branch: z.string().optional(),
  }).optional(),
  gstEnabled: z.boolean(),
  gstPercentage: z.number().min(0).max(100),
  gstType: z.enum(['inclusive', 'exclusive']),
  hsnSacCode: z.string().optional(),
  invoicePrefix: z.string(),
  invoiceStartNumber: z.number().min(1),
  invoiceFooter: z.string().optional(),
});

const bookingSettingsSchema = z.object({
  speedBoatOperatingHours: z.object({
    from: z.string(),
    to: z.string(),
  }),
  partyBoatOperatingHours: z.object({
    from: z.string(),
    to: z.string(),
  }),
  ferryOperatingHours: z.object({
    from: z.string(),
    to: z.string(),
  }),
  defaultAdvanceBookingDays: z.number().min(1),
  cancellationPolicy: z.object({
    speedBoat: z.object({
      freeHours: z.number(),
      partialRefundHours: z.number(),
      partialRefundPercent: z.number(),
    }),
    partyBoat: z.object({
      freeDays: z.number(),
      partialRefundDays: z.number(),
      partialRefundPercent: z.number(),
    }),
    ferry: z.object({
      freeHours: z.number(),
      partialRefundHours: z.number(),
      partialRefundPercent: z.number(),
    }),
  }),
  refundProcessingDays: z.number().min(1),
});

const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  adminAlertEmail: z.string().email(),
  reminderHoursBeforeTrip: z.number().min(0),
  smsReminderHoursBeforeTrip: z.number().min(0),
});

const contentSettingsSchema = z.object({
  termsAndConditions: z.string(),
  privacyPolicy: z.string(),
  refundPolicy: z.string(),
  aboutUs: z.string(),
});

module.exports = {
  generalSettingsSchema,
  billingSettingsSchema,
  bookingSettingsSchema,
  notificationSettingsSchema,
  contentSettingsSchema,
};