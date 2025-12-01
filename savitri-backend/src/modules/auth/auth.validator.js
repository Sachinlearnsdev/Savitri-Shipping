// src/modules/auth/auth.validator.js

const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema, otpSchema } = require('../../utils/validators');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

const verifyPhoneSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const loginPhoneSchema = z.object({
  phone: phoneSchema,
});

const verifyLoginOTPSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resendOTPSchema = z.object({
  identifier: z.string(), // email or phone
  type: z.enum(['email', 'phone']),
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
  loginSchema,
  loginPhoneSchema,
  verifyLoginOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOTPSchema,
};