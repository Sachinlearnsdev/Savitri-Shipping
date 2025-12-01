// src/modules/adminAuth/adminAuth.validator.js

const { z } = require('zod');
const { emailSchema, passwordSchema, otpSchema } = require('../../utils/validators');

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const verifyOTPSchema = z.object({
  email: emailSchema,
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

module.exports = {
  loginSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};