// src/utils/email.js
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const config = require("../config/env");

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (!config.smtpUser || !config.smtpPass) {
    console.warn(
      "⚠️  Email SMTP credentials not configured. Emails will not be sent."
    );
    return null;
  }

  if (config.emailService === "google") {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Add other email services here (Resend, SendGrid, etc.)
  throw new Error("Email service not configured");
};

/**
 * Load email template
 */
const loadTemplate = (templateName) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.html`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template ${templateName} not found`);
  }

  return fs.readFileSync(templatePath, "utf-8");
};

/**
 * Replace variables in template
 */
const replaceVariables = (template, variables) => {
  let result = template;

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, variables[key]);
  });

  return result;
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, templateName, variables = {} }) => {
  try {
    // Load and process template
    let html = loadTemplate(templateName);

    // Add default variables
    const allVariables = {
      companyName: config.companyName,
      currentYear: new Date().getFullYear(),
      frontendUrl: config.frontendUrl,
      ...variables,
    };

    html = replaceVariables(html, allVariables);

    // Create transporter
    const transporter = createTransporter();

    // If no transporter (SMTP not configured), log and return
    if (!transporter) {
      if (config.nodeEnv === "development") {
        console.log("📧 Email would be sent (SMTP not configured):");
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Template: ${templateName}`);
        console.log(`   Variables:`, variables);
      }
      return { success: true, messageId: "dev-mode-no-smtp" };
    }

    // Send email
    const info = await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
    });

    if (config.nodeEnv === "development") {
      console.log("✅ Email sent:", info.messageId);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: `Welcome to ${config.companyName}!`,
    templateName: "welcome",
    variables: { name },
  });
};

/**
 * Send email verification OTP
 */
const sendEmailVerificationOTP = async (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    templateName: "verify-email",
    variables: { name, otp },
  });
};

/**
 * Send login OTP
 */
const sendLoginOTP = async (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Your Login OTP",
    templateName: "login-otp",
    variables: { name, otp },
  });
};

/**
 * Send password reset OTP
 */
const sendPasswordResetOTP = async (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    templateName: "password-reset",
    variables: { name, otp },
  });
};

/**
 * Send password changed confirmation
 */
const sendPasswordChangedEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Password Changed Successfully",
    templateName: "password-changed",
    variables: { name },
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationOTP,
  sendLoginOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
};
