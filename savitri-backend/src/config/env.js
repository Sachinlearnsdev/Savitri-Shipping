/**
 * Get Codespace URL for a specific port
 * @param {number} port 
 * @returns {string|null}
 */
const getCodespaceUrl = (port) => {
  const codespaceName = process.env.CODESPACE_NAME;
  if (codespaceName) {
    return `https://${codespaceName}-${port}.app.github.dev`;
  }
  return null;
};

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Detect if running in Codespaces
  isCodespaces: !!process.env.CODESPACE_NAME,
  codespaceName: process.env.CODESPACE_NAME || null,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // URLs - Auto-detect for Codespaces
  backendUrl: getCodespaceUrl(5000) || process.env.BACKEND_URL || 'http://localhost:5000',
  frontendUrl: getCodespaceUrl(3000) || process.env.FRONTEND_URL || 'http://localhost:3000',
  adminUrl: getCodespaceUrl(5173) || process.env.ADMIN_URL || 'http://localhost:5173',
  
  // CORS Origins - Auto-configure for Codespaces
  get corsOrigins() {
    const origins = [
      this.frontendUrl,
      this.adminUrl,
    ];
    
    // In Codespaces, allow all github.dev origins
    if (this.isCodespaces) {
      origins.push(/\.app\.github\.dev$/);
    }
    
    // Add any additional origins from env
    if (process.env.ADDITIONAL_CORS_ORIGINS) {
      origins.push(...process.env.ADDITIONAL_CORS_ORIGINS.split(','));
    }
    
    return origins;
  },
  
  // Email Service
  emailService: process.env.EMAIL_SERVICE || 'google',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'Savitri Shipping <noreply@savitrishipping.in>',
  
  // SMS Service
  smsService: process.env.SMS_SERVICE || 'master',
  smsMasterOtp: process.env.SMS_MASTER_OTP || '123456',
  msg91ApiKey: process.env.MSG91_API_KEY,
  
  // File Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  
  // Company Defaults
  companyName: process.env.COMPANY_NAME || 'Savitri Shipping',
  companyDomain: process.env.COMPANY_DOMAIN || 'savitrishipping.in',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP_USER',
    'SMTP_PASS',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    process.exit(1);
  }
}

// Log configuration in development
if (config.nodeEnv === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`   Running in Codespaces: ${config.isCodespaces}`);
  console.log(`   Backend URL: ${config.backendUrl}`);
  console.log(`   Frontend URL: ${config.frontendUrl}`);
  console.log(`   Admin URL: ${config.adminUrl}`);
}

module.exports = config;